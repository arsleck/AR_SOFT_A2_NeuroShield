const ResultadosPage = {
    render: function() {
        const res = AppModel.ultimoResultadoSimulacion;
        const mision = res ? res.mision : AppModel.catalogoMisiones[0];
        const pistas = Array.isArray(mision.pistas_forenses) ? mision.pistas_forenses : [];

        return `
        <section id="resultados" class="view-section active">
            <div class="learning-hero mb-4">
                <div>
                    <span class="badge-pill">
                        <i class="fa-solid fa-magnifying-glass-chart"></i> Análisis Post-Simulación
                    </span>
                    <h1 style="font-size: 1.8rem; font-weight: 800; margin-top: 0.4rem;">
                        ${res ? res.estadoDecision : 'Reporte Forense de Simulación'}
                    </h1>
                    <p class="text-muted mt-1">
                        Escenario analizado: <strong>${mision.titulo}</strong> (Vector: ${mision.vector})
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <a href="#/misiones" class="btn-cisco-outline">
                        <i class="fa-solid fa-rotate-right"></i> Probar Otra Misión
                    </a>
                    <a href="#/perfil" class="btn-cisco-primary">
                        <i class="fa-solid fa-chart-simple"></i> Ver mi Perfil de Seguridad
                    </a>
                </div>
            </div>

            <div class="profile-layout-grid">
                <div class="card" style="background: #0f172a; color: #f8fafc;">
                    <h3 class="mb-3" style="color: white;">
                        <i class="fa-solid fa-terminal" style="color: var(--cisco-green);"></i> Registro de Telemetría y Evaluación
                    </h3>
                    <div id="terminal-output" class="terminal-body">
                        ${res && res.logs ? res.logs.map(l => `<p>&gt; ${l}</p>`).join('') : '<p>&gt; Ejecuta una simulación para ver el registro forense.</p>'}
                    </div>
                </div>

                <div class="card">
                    <h3 class="mb-2">
                        <i class="fa-solid fa-fingerprint text-primary me-1"></i> Evidencia Forense del Escenario
                    </h3>
                    <p class="text-muted mb-3" style="font-size: 0.86rem;">
                        Estos eran los indicadores clave que revelaban el engaño en esta misión:
                    </p>
                    <ul class="course-alert-list">
                        ${pistas.map(p => `
                            <li style="background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                                <i class="fa-solid fa-shield-halved" style="color: var(--cisco-green);"></i>
                                <span>${p}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </section>
        `;
    }
};