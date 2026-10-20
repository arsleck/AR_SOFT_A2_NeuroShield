// === LA VISTA (MVC) ===
// Responsable de manipular el DOM (HTML) y actualizar gráficos. No contiene lógica de negocio.

const UIView = {
    miGrafico: null,

    // Novedad: Ahora la vista renderiza la página completa combinando los componentes (Lego)
    renderizarPagina: function(rutaHash) {
        const root = document.getElementById('app-root');
        
        // Si no hay ruta o es login, cargamos solo la pantalla de Login (sin menús)
        if (rutaHash === '#/login' || rutaHash === '') {
            root.innerHTML = LoginPage.render();
        } else if (rutaHash === '#/registro') {
            root.innerHTML = RegistroPage.render();
        } else {

            // Definimos qué componente de página cargar según la ruta
            if (rutaHash === '#/dashboard') {
                contenidoPagina = DashboardPage.render();
                titulo = 'Mi Progreso';
            } else if (rutaHash === '#/simulador') {
                contenidoPagina = SimuladorPage.render();
                titulo = 'Simulador de Ataques';
            } else if (rutaHash === '#/resultados') {
                contenidoPagina = ResultadosPage.render();
                titulo = 'Reporte Forense';
            } else if (rutaHash === '#/gestion') {            
                contenidoPagina = GestionPage.render();     
                titulo = 'Gestión del Sistema';              
            }
            
            // Ensamblamos la estructura general inyectando el Sidebar, el Topbar y la Página
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

    // Renderiza la gráfica de Chart.js con el degradado moderno
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
                    data: historial, 
                    borderColor: '#4f46e5', 
                    backgroundColor: gradient,
                    borderWidth: 3, 
                    tension: 0.4, 
                    fill: true, 
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4f46e5', 
                    pointRadius: 5
                }]
            },
            options: { 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                    y: { grid: { color: '#e2e8f0', drawBorder: false } }, 
                    x: { grid: { display: false } } 
                }
            }
        });
    },

    // Actualiza los números y la barra circular del dashboard
    actualizarDashboard: function(nuevoRiesgo) {
        const scoreText = document.getElementById('score-text');
        if(scoreText) scoreText.innerText = `${nuevoRiesgo}%`;
        
        const circle = document.querySelector('.score-path');
        if(circle) circle.style.strokeDasharray = `${nuevoRiesgo}, 100`;
    },

    // Inyecta los resultados del motor IA en la consola forense
    imprimirTerminal: function(logs) {
        const terminal = document.getElementById('terminal-output');
        if(!terminal) return;
        terminal.innerHTML = "";
        logs.forEach(log => {
            terminal.innerHTML += `<p><i class="fa-solid fa-angle-right me-2 text-muted"></i> ${log}</p>`;
        });
    }
};