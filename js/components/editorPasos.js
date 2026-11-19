// === COMPONENTE: EDITOR POR PASOS ===
// Comportamiento compartido por los editores de cursos y de misiones del administrador:
// navegación entre pasos, validación por paso, salto al paso con errores al publicar,
// contadores en vivo de módulos y preguntas, y el paso final de revisión.

const EditorPasos = {
    /**
     * @param {HTMLElement} overlay  Contenedor del editor (#tutorial-overlay)
     * @param {Object} config
     *   revision(form): HTML del paso de revisión (último paso)
     *   listas: [{ contenedor, paso, subtitulo(n), numero(i), etiqueta }]
     */
    activar: function(overlay, config = {}) {
        if (!overlay) return;
        const form = overlay.querySelector('form');
        const contenido = overlay.querySelector('.cv-editor-contenido');
        const secciones = [...overlay.querySelectorAll('.cv-paso')];
        const botonesPaso = [...overlay.querySelectorAll('.cv-paso-btn')];
        const btnAnterior = overlay.querySelector('.cv-btn-anterior');
        const btnSiguiente = overlay.querySelector('.cv-btn-siguiente');
        const indicador = overlay.querySelector('.cv-paso-actual');
        const total = secciones.length;
        let actual = 1;

        const seccion = n => secciones.find(s => Number(s.dataset.paso) === n);
        const invalidosDe = n => [...(seccion(n)?.querySelectorAll('input, select, textarea') || [])].filter(c => !c.checkValidity());

        const marcarErrores = () => {
            botonesPaso.forEach(btn => {
                const n = Number(btn.dataset.paso);
                btn.classList.toggle('cv-con-error', invalidosDe(n).length > 0 && form.classList.contains('cv-mostrar-errores'));
            });
        };

        const pintarRevision = () => {
            const destino = seccion(total)?.querySelector('.cv-revision-contenedor');
            if (!destino || typeof config.revision !== 'function') return;
            destino.innerHTML = config.revision(form);
            destino.querySelectorAll('[data-ir-paso]').forEach(btn => {
                btn.addEventListener('click', () => {
                    form.classList.add('cv-mostrar-errores');
                    mostrar(Number(btn.dataset.irPaso));
                    const primero = invalidosDe(actual)[0];
                    if (primero) setTimeout(() => primero.reportValidity(), 0);
                });
            });
        };

        const mostrar = (n) => {
            if (n < 1 || n > total) return;
            // Al salir de un paso sin errores se marca como completo
            const previo = botonesPaso.find(b => Number(b.dataset.paso) === actual);
            if (previo && n !== actual) previo.classList.toggle('cv-completo', invalidosDe(actual).length === 0);

            actual = n;
            secciones.forEach(s => s.classList.toggle('cv-activo', Number(s.dataset.paso) === n));
            botonesPaso.forEach(b => {
                const activo = Number(b.dataset.paso) === n;
                b.classList.toggle('cv-activo', activo);
                if (activo) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
            });
            if (indicador) indicador.textContent = n;
            if (btnAnterior) btnAnterior.disabled = n === 1;
            if (btnSiguiente) btnSiguiente.style.display = n === total ? 'none' : '';
            if (n === total) pintarRevision();
            if (contenido) contenido.scrollTop = 0;
            marcarErrores();
        };

        botonesPaso.forEach(btn => btn.addEventListener('click', () => mostrar(Number(btn.dataset.paso))));
        btnAnterior?.addEventListener('click', () => mostrar(actual - 1));
        btnSiguiente?.addEventListener('click', () => {
            const invalidos = invalidosDe(actual);
            if (invalidos.length > 0) {
                form.classList.add('cv-mostrar-errores');
                marcarErrores();
                invalidos[0].reportValidity();
                return;
            }
            mostrar(actual + 1);
        });

        // Al publicar: si falta algo, se abre el paso que lo contiene en lugar de fallar en silencio.
        // Se registra antes que el guardado del controlador, así que puede detenerlo.
        form.addEventListener('submit', (e) => {
            const invalido = [...form.querySelectorAll('input, select, textarea')].find(c => !c.checkValidity());
            if (!invalido) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            form.classList.add('cv-mostrar-errores');
            const paso = Number(invalido.closest('.cv-paso')?.dataset.paso || 1);
            mostrar(paso);
            setTimeout(() => { invalido.focus(); invalido.reportValidity(); }, 0);
        });

        form.addEventListener('input', () => {
            if (form.classList.contains('cv-mostrar-errores')) marcarErrores();
        });

        // Listas repetibles (módulos adicionales, preguntas): contador, numeración y estado vacío
        (config.listas || []).forEach(lista => {
            const contenedor = overlay.querySelector('#' + lista.contenedor);
            if (!contenedor) return;
            const vacio = overlay.querySelector(`[data-vacia-de="${lista.contenedor}"]`);
            const sub = overlay.querySelector(`[data-sub-paso="${lista.paso}"]`);

            const actualizar = () => {
                const items = [...contenedor.children];
                if (vacio) vacio.style.display = items.length === 0 ? '' : 'none';
                if (sub) sub.textContent = lista.subtitulo(items.length);
                items.forEach((item, i) => {
                    const num = item.querySelector('.cv-bloque-num');
                    const titulo = item.querySelector('.cv-bloque-titulo');
                    if (num) num.textContent = lista.numero(i);
                    if (titulo) titulo.textContent = `${lista.etiqueta} ${lista.numero(i)}`;
                });
            };

            new MutationObserver((cambios) => {
                actualizar();
                // Al agregar un bloque, se lleva a la vista y se enfoca su primer campo
                const nuevo = cambios.flatMap(c => [...c.addedNodes]).find(n => n.nodeType === 1);
                if (nuevo) {
                    nuevo.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    nuevo.querySelector('input:not([type="hidden"]):not([type="radio"]), textarea')?.focus({ preventScroll: true });
                }
            }).observe(contenedor, { childList: true });
            actualizar();
        });

        mostrar(1);
    }
};
