const ResultadosPage = {
    render: function() {
        return `
        <section id="resultados" class="view-section active">
            <div class="card text-center" style="padding: 3rem;">
                <div class="icon-result mb-3"><i class="fa-solid fa-microscope" style="font-size: 3rem; color: var(--primary);"></i></div>
                <h1 class="mb-2">Análisis de tu Decisión</h1>
                <p class="text-muted mb-4">El Motor de IA ha evaluado tu interacción con el escenario de Phishing.</p>
                
                <div class="terminal-body" id="terminal-output" style="text-align: left; max-width: 600px; margin: 0 auto; background: var(--bg-main); padding: 2rem; border-radius: 12px; border: 1px solid var(--border);">
                    <!-- Logs inyectados por JS -->
                </div>
                
                <a href="#/dashboard" class="btn btn-primary mt-4"><i class="fa-solid fa-arrow-left"></i> Volver a Mi Progreso</a>
            </div>
        </section>
        `;
    }
};