// === PÁGINA DE SIMULADORES (#/misiones) ===
// Organización tipo LMS: un módulo plegable por vector de ataque con sus misiones,
// el estado de cada una para el usuario y una columna "Por hacer" con lo que
// recomienda el servicio de IA.

const MisionesPage = {
    metaVectores: [
        {
            vector: 'Phishing',
            titulo: 'Phishing · Correo electrónico',
            icono: 'fa-envelope-open-text',
            descripcion: 'Bandeja de entrada para inspeccionar remitentes, cabeceras, adjuntos y enlaces fraudulentos.'
        },
        {
            vector: 'Smishing',
            titulo: 'Smishing · Mensajes de texto',
            icono: 'fa-mobile-screen-button',
            descripcion: 'Teléfono simulado con SMS de paquetería, cobros falsos y enlaces acortados.'
        },
        {
            vector: 'Vishing',
            titulo: 'Vishing · Llamadas de voz',
            icono: 'fa-phone-volume',
            descripcion: 'Llamadas con voz sintetizada de falsos asesores que piden códigos o datos.'
        },
        {
            vector: 'Ing. Social',
            titulo: 'Ingeniería Social · Chat',
            icono: 'fa-comments',
            descripcion: 'Conversaciones de mensajería donde el atacante usa urgencia o suplanta autoridad.'
        }
    ],

    modosDisponibles: [
        { id: 'reaccion', icono: 'fa-bolt', nombre: 'Reacción Táctica', desc: 'Acceder, ignorar o reportar bajo reloj.' },
        { id: 'redflags', icono: 'fa-magnifying-glass-location', nombre: 'Cazador de Red Flags', desc: 'Señala dónde falla el mensaje.' },
        { id: 'urlinspector', icono: 'fa-link-slash', nombre: 'Inspector de URLs', desc: 'Analiza dominios, IPs y cabeceras.' },
        { id: 'dialogo', icono: 'fa-reply-all', nombre: 'Escudo de Respuesta', desc: 'Elige cómo responder al atacante.' },
        { id: 'protocolo', icono: 'fa-list-ol', nombre: 'Protocolo SOC', desc: 'Ordena los pasos de contención.' }
    ],

    ordenDificultad: { 'Básico': 0, 'Intermedio': 1, 'Avanzado': 2 },

    // Misiones de un vector en el orden del módulo (de Básico a Avanzado)
    misionesDeVector: function(vector) {
        return (AppModel.catalogoMisiones || [])
            .filter(m => m.vector === vector)
            .sort((a, b) => ((this.ordenDificultad[a.dificultad] ?? 9) - (this.ordenDificultad[b.dificultad] ?? 9)) || (a.id_mision - b.id_mision));
    },

    metaDeVector: function(vector) {
        return this.metaVectores.find(m => m.vector === vector) || { vector, titulo: vector, icono: 'fa-shield-halved', descripcion: '' };
    },

    estadoMision: function(idMision) {
        const h = (AppModel.historialMisiones || {})[idMision];
        if (!h) return { clase: 'cv-estado-pendiente', icono: 'fa-regular fa-circle', texto: 'Pendiente', intentos: 0 };
        if (h.superada) return { clase: 'cv-estado-ok', icono: 'fa-solid fa-circle-check', texto: 'Superada', intentos: h.intentos };
        return { clase: 'cv-estado-progreso', icono: 'fa-solid fa-circle-half-stroke', texto: 'En progreso', intentos: h.intentos };
    },

    chipRiesgo: function(valor) {
        if (valor === undefined || valor === null) return '';
        const clase = valor >= 60 ? 'cv-chip-alto' : valor >= 40 ? 'cv-chip-medio' : 'cv-chip-bajo';
        return `<span class="cv-chip ${clase}" title="Riesgo estimado en este vector">Riesgo ${valor}%</span>`;
    },

    renderModulo: function(meta, ia) {
        const misiones = this.misionesDeVector(meta.vector);
        const superadas = misiones.filter(m => this.estadoMision(m.id_mision).texto === 'Superada').length;
        const riesgo = (AppModel.estadoUsuario.riesgoPorVector || {})[meta.vector];
        const prioritario = ia && Array.isArray(ia.vectores_prioritarios) && ia.vectores_prioritarios.includes(meta.vector);
        const recomendadas = new Map(((ia && ia.misiones_recomendadas) || []).map(m => [m.id_mision, m]));

        return `
        <section class="cv-modulo" data-vector="${meta.vector}">
            <button type="button" class="cv-modulo-cabecera" aria-expanded="true">
                <i class="fa-solid fa-caret-down cv-caret"></i>
                <span class="cv-modulo-icono"><i class="fa-solid ${meta.icono}"></i></span>
                <span class="cv-modulo-titulo">
                    <strong>${meta.titulo}</strong>
                    <span>${meta.descripcion}</span>
                </span>
                <span class="cv-modulo-meta">
                    ${prioritario ? '<span class="cv-chip cv-chip-ia"><i class="fa-solid fa-brain"></i> Prioridad según la IA</span>' : ''}
                    ${this.chipRiesgo(riesgo)}
                    <span class="cv-chip">${superadas}/${misiones.length} superadas</span>
                </span>
            </button>
            <div class="cv-modulo-cuerpo">
                ${misiones.length === 0 ? '<p class="cv-modulo-vacio">Aún no hay misiones publicadas en este módulo.</p>' : misiones.map(m => {
                    const estado = this.estadoMision(m.id_mision);
                    const rec = recomendadas.get(m.id_mision);
                    const modo = rec ? rec.modo_sugerido : 'reaccion';
                    return `
                    <div class="cv-item btn-iniciar-mision-modulo" role="button" tabindex="0" data-mision-id="${m.id_mision}" data-modo="${modo}">
                        <i class="fa-solid fa-crosshairs cv-item-tipo"></i>
                        <div>
                            <div class="cv-item-titulo">${m.titulo}</div>
                            <div class="cv-item-desc">${m.descripcion_corta || ''}</div>
                            <div class="cv-item-meta">
                                <span><i class="fa-solid fa-signal"></i>${m.dificultad || 'Básico'}</span>
                                <span><i class="fa-solid fa-stopwatch"></i>${m.tiempo_limite || 120} s</span>
                                ${estado.intentos > 0 ? `<span><i class="fa-solid fa-rotate"></i>${estado.intentos} intento${estado.intentos === 1 ? '' : 's'}</span>` : ''}
                                ${rec ? `<span class="cv-chip cv-chip-ia"><i class="fa-solid fa-brain"></i> Recomendada por IA · ${AnalisisIAComponent.MODOS[modo] || 'Simulador'}</span>` : ''}
                            </div>
                        </div>
                        <div class="cv-item-derecha">
                            <span class="cv-estado ${estado.clase}"><i class="${estado.icono}"></i> ${estado.texto}</span>
                            <i class="fa-solid fa-chevron-right" style="color: #a3b1a8;"></i>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </section>`;
    },

    renderPorHacer: function(ia) {
        const misiones = (ia && ia.misiones_recomendadas) || [];
        const cursos = (ia && ia.cursos_recomendados) || [];
        const refuerzos = (ia && ia.refuerzos) || [];

        const items = [
            ...misiones.map(m => `
                <button type="button" class="cv-pendiente btn-ir-mision-ia" data-mision-id="${m.id_mision}" data-modo="${m.modo_sugerido || 'reaccion'}">
                    <i class="fa-solid fa-crosshairs"></i>
                    <span>
                        <span class="cv-pendiente-titulo">${m.titulo}</span>
                        <span class="cv-pendiente-sub" style="display: block;">${m.vector} · ${m.dificultad} · ${AnalisisIAComponent.MODOS[m.modo_sugerido] || 'Simulador'}</span>
                        ${m.motivo ? `<span class="cv-pendiente-sub" style="display: block;">${m.motivo}</span>` : ''}
                    </span>
                </button>`),
            ...cursos.slice(0, 3).map(c => `
                <button type="button" class="cv-pendiente btn-ver-curso" data-curso-id="${c.id_curso}">
                    <i class="fa-solid fa-book-open"></i>
                    <span>
                        <span class="cv-pendiente-titulo">${c.titulo}</span>
                        <span class="cv-pendiente-sub" style="display: block;">Curso · ${c.categoria}${c.duracion ? ' · ' + c.duracion : ''}</span>
                    </span>
                </button>`)
        ];

        return `
        <aside class="cv-lateral">
            <div class="cv-panel">
                <h3><i class="fa-solid fa-list-check"></i> Por hacer</h3>
                ${refuerzos.length > 0 ? `
                    <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.6rem;">
                        ${refuerzos.map(r => `<span class="cv-chip cv-chip-ia" title="Confianza ${r.confianza}"><i class="fa-solid fa-brain"></i> ${(AnalisisIAComponent.REFUERZOS[r.tipo] || {}).titulo || r.tipo}</span>`).join('')}
                    </div>` : ''}
                ${items.length > 0 ? items.join('') : `
                    <p class="cv-vacio-lateral">Completa una misión o el examen de un curso y la red neuronal te sugerirá aquí qué practicar.</p>`}
            </div>
            <div class="cv-panel">
                <h3><i class="fa-solid fa-gamepad"></i> Dinámicas del simulador</h3>
                <ul class="cv-lista-simple">
                    ${this.modosDisponibles.map(m => `<li><i class="fa-solid ${m.icono}"></i><strong>${m.nombre}:</strong> ${m.desc}</li>`).join('')}
                </ul>
            </div>
        </aside>`;
    },

    render: function() {
        const ia = AppModel.estadoUsuario.analisisIA && AppModel.estadoUsuario.analisisIA.disponible
            ? AppModel.estadoUsuario.analisisIA : null;
        const todas = AppModel.catalogoMisiones || [];
        const superadas = todas.filter(m => this.estadoMision(m.id_mision).texto === 'Superada').length;
        const porcentaje = todas.length > 0 ? Math.round((superadas / todas.length) * 100) : 0;

        return `
        <section id="misiones" class="view-section active cv-page">
            <nav class="cv-breadcrumb" aria-label="Ruta">
                <a href="#/dashboard">NeuroShield</a><i class="fa-solid fa-chevron-right cv-sep"></i>
                <span class="cv-actual">Simuladores</span>
            </nav>

            <header class="cv-page-header">
                <div>
                    <h1>Simuladores</h1>
                    <p>Cuatro módulos, uno por vector de ataque. Cada misión se puede practicar en 5 dinámicas distintas; se considera superada cuando identificas y reportas la amenaza.</p>
                </div>
                <div class="cv-acciones">
                    <button type="button" class="cv-btn" id="btn-alternar-modulos"><i class="fa-solid fa-up-right-and-down-left-from-center"></i> Contraer todo</button>
                    <button type="button" class="cv-btn cv-btn-primario" id="btn-mision-aleatoria"><i class="fa-solid fa-shuffle"></i> Reto aleatorio</button>
                </div>
            </header>

            <div class="cv-progreso">
                <span class="cv-progreso-texto"><strong>${superadas} de ${todas.length}</strong> misiones superadas</span>
                <div class="cv-barra" role="progressbar" aria-valuenow="${porcentaje}" aria-valuemin="0" aria-valuemax="100"><span style="width: ${porcentaje}%;"></span></div>
                <span class="cv-progreso-texto"><strong>${porcentaje}%</strong></span>
            </div>

            <div class="cv-con-lateral">
                <div>
                    ${this.metaVectores.map(meta => this.renderModulo(meta, ia)).join('')}
                </div>
                ${this.renderPorHacer(ia)}
            </div>
        </section>
        `;
    }
};
