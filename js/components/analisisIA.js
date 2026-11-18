// === COMPONENTE: ANÁLISIS DEL SERVICIO DE IA ===
// Muestra el resultado que devuelve la red neuronal (a través del backend):
// nivel de vulnerabilidad, riesgo por vector, recomendaciones y cursos sugeridos.

const AnalisisIAComponent = {
    colorRiesgo: function(valor) {
        if (valor < 40) return '#10b981';
        if (valor < 60) return '#f59e0b';
        return '#ef4444';
    },

    textoNivel: function(nivel) {
        return { Alto: 'alta', Medio: 'media', Bajo: 'baja' }[nivel] || String(nivel || '').toLowerCase();
    },

    renderCursos: function(cursos) {
        if (!Array.isArray(cursos) || cursos.length === 0) return '';
        return `
            <h4 style="font-size: 0.92rem; font-weight: 800; margin: 1rem 0 0.5rem;">
                <i class="fa-solid fa-graduation-cap text-primary me-1"></i> Cursos recomendados para ti
            </h4>
            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                ${cursos.map(c => `
                    <button type="button" class="btn btn-ver-curso" data-curso-id="${c.id_curso}" style="padding: 0.5rem 0.9rem; font-size: 0.82rem;">
                        <i class="fa-solid fa-book-open"></i> ${c.titulo} <span class="text-muted">(${c.categoria})</span>
                    </button>
                `).join('')}
            </div>
        `;
    },

    // opciones.compacto: solo la fuente del análisis y los cursos (para el perfil,
    // que ya muestra la gráfica y las recomendaciones).
    render: function(ia, opciones = {}) {
        if (!ia || !ia.disponible) {
            if (opciones.compacto) return '';
            return `
            <div class="card mt-4" style="border-left: 5px solid #f59e0b;">
                <h3><i class="fa-solid fa-brain text-warning me-1"></i> Análisis del Servicio de IA</h3>
                <p class="text-muted mt-1" style="font-size: 0.88rem;">
                    ${ia && ia.motivo ? ia.motivo : 'El servicio de IA no está disponible en este momento.'}
                    Tu resultado se calculó con el motor de reglas de la plataforma.
                </p>
            </div>`;
        }

        const color = this.colorRiesgo(ia.puntaje);
        const pie = `Estimación de la red neuronal convolucional (modelo ${ia.modelo || 'N/D'}) a partir de tus últimas ${ia.interacciones_analizadas || 0} interacciones en simulaciones y quizzes.`;

        if (opciones.compacto) {
            return `
            <div class="card" style="border-left: 5px solid ${color};">
                <h3><i class="fa-solid fa-brain text-primary me-1"></i> Análisis del Servicio de IA</h3>
                <p class="text-muted mt-1" style="font-size: 0.85rem;">
                    Vulnerabilidad <strong>${this.textoNivel(ia.nivel)}</strong> (${ia.puntaje}%). ${pie}
                </p>
                ${this.renderCursos(ia.cursos_recomendados)}
            </div>`;
        }

        const barras = Object.entries(ia.riesgo_por_vector || {}).map(([vector, valor]) => `
            <div style="margin-bottom: 0.7rem;">
                <div class="flex-between" style="font-size: 0.85rem; font-weight: 700;">
                    <span>${vector}${(ia.vectores_sin_practica || []).includes(vector) ? ' <span class="text-muted" style="font-weight: 400;">(sin práctica aún)</span>' : ''}</span>
                    <span>${valor}%</span>
                </div>
                <div style="height: 10px; background: var(--bg-main); border: 1px solid var(--border); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${valor}%; height: 100%; background: ${this.colorRiesgo(valor)};"></div>
                </div>
            </div>
        `).join('');

        const recomendaciones = (ia.recomendaciones || []).map(rec => `
            <li class="rec-item">
                <i class="fa-solid ${rec.icono} ${rec.color}"></i>
                <span>${rec.texto}</span>
            </li>
        `).join('');

        return `
        <div class="card mt-4" style="border-left: 5px solid ${color};">
            <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.75rem;">
                <div>
                    <h3><i class="fa-solid fa-brain text-primary me-1"></i> Análisis del Servicio de IA</h3>
                    <p class="text-muted" style="font-size: 0.84rem;">${pie}</p>
                </div>
                <span class="badge-pill" style="background: ${color}; color: #ffffff; font-size: 0.9rem;">
                    <i class="fa-solid fa-gauge-high"></i> Vulnerabilidad ${this.textoNivel(ia.nivel)}: ${ia.puntaje}%
                </span>
            </div>

            <div class="profile-layout-grid">
                <div>
                    <h4 style="font-size: 0.92rem; font-weight: 800; margin-bottom: 0.6rem;">Riesgo estimado por vector</h4>
                    ${barras}
                </div>
                <div>
                    <h4 style="font-size: 0.92rem; font-weight: 800; margin-bottom: 0.6rem;">Recomendaciones personalizadas</h4>
                    <ul class="rec-list">${recomendaciones}</ul>
                </div>
            </div>

            ${this.renderCursos(ia.cursos_recomendados)}
        </div>`;
    }
};
