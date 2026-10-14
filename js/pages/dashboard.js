const DashboardPage = {
    render: function() {
        return `
        <section id="dashboard" class="view-section active">
            <div class="kpi-grid mb-4">
                <div class="kpi-card">
                    <div class="kpi-icon bg-blue"><i class="fa-solid fa-bullseye"></i></div>
                    <div class="kpi-info"><h3>4</h3><p>Simulaciones Realizadas</p></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon bg-green"><i class="fa-solid fa-shield-halved"></i></div>
                    <div class="kpi-info"><h3>Moderado</h3><p>Nivel de Atención</p></div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-icon bg-purple"><i class="fa-solid fa-envelope-open-text"></i></div>
                    <div class="kpi-info"><h3 style="font-size: 1.1rem; margin-top: 5px;">Phishing (ICETEX)</h3><p>Última Amenaza</p></div>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="card interactive-card text-center">
                    <h3 class="mb-3 text-left">Nivel de Vulnerabilidad</h3>
                    <div class="score-container">
                        <div class="score-circle">
                            <svg viewBox="0 0 36 36" class="circular-chart">
                                <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path class="circle score-path" stroke-dasharray="65, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            </svg>
                            <div class="score-value"><h2 id="score-text">65%</h2></div>
                        </div>
                    </div>
                    <p class="text-muted mt-3" style="font-size: 0.9rem;">Probabilidad calculada por el motor de IA.</p>
                </div>
                
                <div class="card">
                    <div class="flex-between mb-3">
                        <h3>Evolución de Aprendizaje</h3>
                        <span class="badge-soft">Historial</span>
                    </div>
                    <div class="chart-container"><canvas id="vulnChart"></canvas></div>
                </div>
            </div>
        </section>
        `;
    }
};