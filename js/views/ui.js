const UIView = {
    miGrafico: null,

    // Novedad: Ahora la vista renderiza la página completa combinando los componentes (Lego)
    renderizarPagina: function(rutaHash) {
        const root = document.getElementById('app-root');
        
        if (rutaHash === '#/login' || rutaHash === '') {
            root.innerHTML = LoginPage.render();
        } else {
            let contenidoPagina = '';
            let titulo = '';

            if (rutaHash === '#/dashboard') {
                contenidoPagina = DashboardPage.render();
                titulo = 'Mi Progreso';
            } else if (rutaHash === '#/simulador') {
                contenidoPagina = SimuladorPage.render();
                titulo = 'Simulador de Ataques';
            } else if (rutaHash === '#/resultados') {
                contenidoPagina = ResultadosPage.render();
                titulo = 'Reporte Forense';
            }

            // Aquí se ensambla la estructura general inyectando los menús
            root.innerHTML = `
                <div class="app-layout">
                    ${SidebarComponent.render(rutaHash)}
                    <div class="main-wrapper">
                        ${TopbarComponent.render(titulo)}
                        <main class="main-content">
                            ${contenidoPagina}
                        </main>
                    </div>
                </div>
            `;
        }
    },

    renderizarGrafico: function(historial) {
        const ctx = document.getElementById('vulnChart');
        if(!ctx) return;
        
        const canvasContext = ctx.getContext('2d');
        if(this.miGrafico) this.miGrafico.destroy();
        
        let gradient = canvasContext.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

        this.miGrafico = new Chart(canvasContext, {
            type: 'line',
            data: {
                labels: historial.map((_, i) => `Simulación ${i+1}`),
                datasets: [{ 
                    data: historial, borderColor: '#4f46e5', backgroundColor: gradient,
                    borderWidth: 3, tension: 0.4, fill: true, pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4f46e5', pointRadius: 5
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { y: { grid: { color: '#e2e8f0', drawBorder: false } }, x: { grid: { display: false } } }
            }
        });
    },

    actualizarDashboard: function(nuevoRiesgo) {
        const scoreText = document.getElementById('score-text');
        if(scoreText) scoreText.innerText = `${nuevoRiesgo}%`;
        
        const circle = document.querySelector('.score-path');
        if(circle) circle.style.strokeDasharray = `${nuevoRiesgo}, 100`;
    },

    imprimirTerminal: function(logs) {
        const terminal = document.getElementById('terminal-output');
        if(!terminal) return;
        terminal.innerHTML = "";
        logs.forEach(log => {
            terminal.innerHTML += `<p><i class="fa-solid fa-angle-right me-2 text-muted"></i> ${log}</p>`;
        });
    }
};