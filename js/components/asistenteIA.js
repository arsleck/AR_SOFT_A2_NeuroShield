/**
 * Asistente previo a la generación con IA (vista del administrador).
 *
 * Antes de que la red neuronal genere un curso o una misión, el administrador
 * responde unas preguntas cortas. Cada pregunta llega preseleccionada con lo que
 * recomienda la IA según el grupo elegido, así que basta con pulsar "Generar"
 * si se está de acuerdo. Después se abre el editor por pasos con el borrador.
 */
const AsistenteIAComponent = {
    VECTORES: ['Phishing', 'Smishing', 'Vishing', 'Ing. Social'],
    NIVELES: ['Básico', 'Intermedio', 'Avanzado'],
    URL: {
        curso: 'http://localhost:3000/api/admin/ia/sugerir-curso',
        mision: 'http://localhost:3000/api/admin/ia/sugerir-mision'
    },

    esc: v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    claseRiesgo: v => (v >= 60 ? 'cv-chip-alto' : v >= 40 ? 'cv-chip-medio' : 'cv-chip-bajo'),

    // Opciones tipo "botón" (radio oculto + etiqueta)
    opcion: function(nombre, valor, contenido, marcada, extra = '') {
        return `
            <label class="cv-asis-opcion ${extra}">
                <input type="radio" name="${nombre}" value="${this.esc(valor)}" ${marcada ? 'checked' : ''}>
                <span>${contenido}</span>
            </label>`;
    },

    renderMarco: function(tipo) {
        const esCurso = tipo === 'curso';
        const grupos = (AppModel.listaGruposAdmin || []).map(g => `<option value="${g.id_grupo}">${this.esc(g.nombre_grupo)}</option>`).join('');
        return `
        <div id="asistente-ia-overlay" class="tutorial-backdrop">
            <div class="cv-asistente" role="dialog" aria-modal="true" aria-labelledby="cv-asis-titulo">
                <header class="cv-editor-cabecera">
                    <div>
                        <span class="cv-editor-etiqueta cv-ia"><i class="fa-solid fa-brain"></i> Asistente de IA</span>
                        <h2 id="cv-asis-titulo">${esCurso ? 'Generar un curso con IA' : 'Generar una misión con IA'}</h2>
                        <p>Responde estas preguntas y la red neuronal armará el borrador. Lo que recomienda la IA ya viene marcado.</p>
                    </div>
                    <button type="button" id="btn-cerrar-asistente" class="cv-editor-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </header>
                <div class="cv-asistente-cuerpo">
                    <div class="cv-asis-pregunta">
                        <h4><span class="cv-asis-num">1</span> ¿Para qué grupo es ${esCurso ? 'el curso' : 'la misión'}?</h4>
                        <p class="cv-asis-ayuda">La IA analizará el historial de los estudiantes de ese grupo.</p>
                        <select id="asis-grupo" class="cv-select" style="max-width: 320px;">
                            <option value="">Todos los usuarios</option>${grupos}
                        </select>
                    </div>
                    <div id="asis-dinamico">
                        <div class="cv-lista-vacia"><i class="fa-solid fa-spinner fa-spin"></i> Analizando el grupo con la red neuronal...</div>
                    </div>
                </div>
                <footer class="cv-editor-pie">
                    <span class="cv-pie-estado" id="asis-resumen"></span>
                    <div class="cv-pie-botones">
                        <button type="button" id="btn-cancelar-asistente" class="cv-btn">Cancelar</button>
                        <button type="button" id="btn-generar-asistente" class="cv-btn cv-btn-primario" disabled>
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Generar borrador
                        </button>
                    </div>
                </footer>
            </div>
        </div>`;
    },

    // Preguntas que dependen del análisis del grupo
    renderPreguntas: function(tipo, datos) {
        const esCurso = tipo === 'curso';
        const g = datos.analisis_grupal || {};
        const riesgo = g.riesgo_promedio_por_vector || {};
        const rec = datos.recomendacion || {};
        const b = datos.borrador || {};

        const vectores = this.VECTORES.map(v => this.opcion('asis-vector', v, `
            <strong>${v}</strong>
            <span class="cv-chip ${this.claseRiesgo(riesgo[v])}">${riesgo[v] ?? '—'} % riesgo</span>
            ${v === rec.vector ? '<span class="cv-chip cv-chip-ia"><i class="fa-solid fa-brain"></i> Recomendado</span>' : ''}`,
            v === rec.vector, 'cv-asis-ancha')).join('');

        const niveles = `
            ${this.opcion('asis-nivel', 'auto', `<strong>Automático</strong> <span class="cv-asis-sub" id="asis-nivel-auto"></span>`, true)}
            ${this.NIVELES.map(n => this.opcion('asis-nivel', n, `<strong>${n}</strong>`, false)).join('')}`;

        let especificas;
        if (esCurso) {
            especificas = `
            <div class="cv-asis-pregunta">
                <h4><span class="cv-asis-num">4</span> ¿Cuántas preguntas tendrá el examen?</h4>
                <div class="cv-asis-opciones">
                    ${[3, 4, 5, 6].map(n => this.opcion('asis-preguntas', n, `<strong>${n}</strong>${n === 4 ? ' <span class="cv-asis-sub">(sugerido)</span>' : ''}`, n === 4)).join('')}
                </div>
            </div>
            <div class="cv-asis-pregunta">
                <h4><span class="cv-asis-num">5</span> ¿Incluir el módulo de refuerzo que se desbloquea después del examen?</h4>
                <div class="cv-asis-opciones">
                    ${this.opcion('asis-refuerzo', 'si', '<strong>Sí</strong> <span class="cv-asis-sub">(recomendado)</span>', true)}
                    ${this.opcion('asis-refuerzo', 'no', '<strong>No</strong>', false)}
                </div>
            </div>`;
        } else {
            const t = b.patron_tiempo || {};
            const textoAuto = b.prisa_detectada
                ? `la IA detectó que el ${Math.round((t.proporcion_prisa || 0) * 100)} % de las caídas fueron por prisa y reducirá el tiempo`
                : t.caidas_con_tiempo > 0 ? 'la IA no detectó un patrón de prisa; deja el tiempo normal' : 'aún no hay caídas con tiempo registrado; deja el tiempo normal';
            especificas = `
            <div class="cv-asis-pregunta">
                <h4><span class="cv-asis-num">4</span> ¿Cuánta presión de tiempo quieres?</h4>
                <div class="cv-asis-opciones">
                    ${this.opcion('asis-presion', 'auto', `<strong>Automática</strong> <span class="cv-asis-sub">(${textoAuto})</span>`, true, 'cv-asis-ancha')}
                    ${this.opcion('asis-presion', 'normal', '<strong>Normal</strong> <span class="cv-asis-sub">(tiempo de la plantilla)</span>', false)}
                    ${this.opcion('asis-presion', 'alta', '<strong>Alta</strong> <span class="cv-asis-sub">(30 s menos)</span>', false)}
                </div>
            </div>`;
        }

        return `
            <div class="cv-asis-pregunta">
                <h4><span class="cv-asis-num">2</span> ¿Qué vector quieres reforzar?</h4>
                <p class="cv-asis-ayuda">Riesgo promedio estimado para ${g.usuarios_analizados || 0} estudiante(s). La IA recomienda el más alto.</p>
                <div class="cv-asis-opciones">${vectores}</div>
            </div>
            <div class="cv-asis-pregunta">
                <h4><span class="cv-asis-num">3</span> ¿Qué ${esCurso ? 'nivel' : 'dificultad'}?</h4>
                <p class="cv-asis-ayuda">A mayor riesgo, contenido más básico; a menor riesgo, un reto mayor.</p>
                <div class="cv-asis-opciones">${niveles}</div>
            </div>
            ${especificas}`;
    },

    valor: nombre => document.querySelector(`#asistente-ia-overlay input[name="${nombre}"]:checked`)?.value,

    // Respuestas -> cuerpo de la petición (lo que queda en automático no se envía)
    respuestas: function(tipo) {
        const cuerpo = {
            id_grupo: document.getElementById('asis-grupo').value || null,
            vector: this.valor('asis-vector')
        };
        const nivel = this.valor('asis-nivel');
        if (tipo === 'curso') {
            if (nivel && nivel !== 'auto') cuerpo.nivel = nivel;
            cuerpo.num_preguntas = parseInt(this.valor('asis-preguntas'), 10) || 4;
            cuerpo.incluir_refuerzo = this.valor('asis-refuerzo') !== 'no';
        } else {
            if (nivel && nivel !== 'auto') cuerpo.dificultad = nivel;
            cuerpo.presion = this.valor('asis-presion') || 'auto';
        }
        return cuerpo;
    },

    /**
     * Abre el asistente. `alGenerar(datos)` recibe la respuesta del backend
     * (borrador + análisis) para abrir el editor por pasos.
     */
    abrir: function(tipo, { headers, alGenerar }) {
        document.getElementById('asistente-ia-overlay')?.remove();
        document.body.insertAdjacentHTML('beforeend', this.renderMarco(tipo));

        const overlay = document.getElementById('asistente-ia-overlay');
        const dinamico = document.getElementById('asis-dinamico');
        const btnGenerar = document.getElementById('btn-generar-asistente');
        const resumen = document.getElementById('asis-resumen');
        let analisis = null;
        let consulta = 0;

        const cerrar = () => overlay.remove();
        document.getElementById('btn-cerrar-asistente').addEventListener('click', cerrar);
        document.getElementById('btn-cancelar-asistente').addEventListener('click', cerrar);

        const pedir = async (cuerpo) => {
            const res = await fetch(this.URL[tipo], { method: 'POST', headers, body: JSON.stringify(cuerpo) });
            const datos = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(datos.error || 'No se pudo generar la sugerencia.');
            return datos;
        };

        // El texto de "Automático" cambia según el vector marcado
        const actualizarResumen = () => {
            if (!analisis) return;
            const vector = this.valor('asis-vector');
            const recomendado = (analisis.recomendacion?.nivel_por_vector || {})[vector];
            const auto = document.getElementById('asis-nivel-auto');
            if (auto) auto.textContent = recomendado ? `(la IA recomienda ${recomendado})` : '';
            const nivel = this.valor('asis-nivel');
            resumen.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${tipo === 'curso' ? 'Curso' : 'Misión'} de <strong>${vector}</strong>, nivel <strong>${nivel === 'auto' ? recomendado : nivel}</strong>.`;
        };

        // Análisis inicial del grupo (sin respuestas: lo que decide la red)
        const analizarGrupo = async () => {
            const id = ++consulta;
            btnGenerar.disabled = true;
            resumen.textContent = '';
            dinamico.innerHTML = '<div class="cv-lista-vacia"><i class="fa-solid fa-spinner fa-spin"></i> Analizando el grupo con la red neuronal...</div>';
            try {
                const datos = await pedir({ id_grupo: document.getElementById('asis-grupo').value || null });
                if (id !== consulta) return;
                analisis = datos;
                dinamico.innerHTML = this.renderPreguntas(tipo, datos);
                btnGenerar.disabled = false;
                actualizarResumen();
            } catch (err) {
                if (id !== consulta) return;
                analisis = null;
                dinamico.innerHTML = `<div class="cv-lista-vacia" style="color: #b91c1c;"><i class="fa-solid fa-triangle-exclamation"></i> ${this.esc(err.message)}</div>`;
            }
        };

        document.getElementById('asis-grupo').addEventListener('change', analizarGrupo);
        dinamico.addEventListener('change', actualizarResumen);

        btnGenerar.addEventListener('click', async () => {
            const original = btnGenerar.innerHTML;
            btnGenerar.disabled = true;
            btnGenerar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando...';
            try {
                const datos = await pedir(this.respuestas(tipo));
                cerrar();
                alGenerar(datos);
            } catch (err) {
                alert(err.message);
                btnGenerar.disabled = false;
                btnGenerar.innerHTML = original;
            }
        });

        analizarGrupo();
    }
};
