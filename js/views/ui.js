// === LA VISTA (MVC) ===
// Responsable de manipular el DOM (HTML) y actualizar gráficos. No contiene lógica de negocio.

const UIView = {
    miGrafico: null,

    renderizarGrafico: function(historial) {
        const ctx = document.getElementById('vulnChart');
        if(!ctx) return;
        
        const canvasContext = ctx.getContext('2d');
        if(this.miGrafico) this.miGrafico.destroy();
        
        // Crear un degradado azul bonito para el fondo de la gráfica
        let gradient = canvasContext.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)'); // Color primario transparente
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

    actualizarDashboard: function(nuevoRiesgo) {
        // Actualizar número
        const scoreText = document.getElementById('score-text');
        if(scoreText) scoreText.innerText = `${nuevoRiesgo}%`;
        
        // Actualizar barra circular (stroke-dasharray)
        const circle = document.querySelector('.score-path');
        if(circle) circle.style.strokeDasharray = `${nuevoRiesgo}, 100`;
        
        // Actualizar el título del Topbar según la vista
        const topbarTitle = document.getElementById('topbar-title');
        if(topbarTitle) topbarTitle.innerText = "Mi Progreso";
    },

    imprimirTerminal: function(logs) {
        const terminal = document.getElementById('terminal-output');
        if(!terminal) return;
        terminal.innerHTML = "";
        logs.forEach(log => {
            terminal.innerHTML += `<p><i class="fa-solid fa-angle-right me-2 text-muted"></i> ${log}</p>`;
        });
    },

    cambiarVistaActiva: function(rutaHash) {
        // Ocultar todas las secciones
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        const topbarTitle = document.getElementById('topbar-title');

        if (rutaHash === '#/login' || rutaHash === '') {
            document.getElementById('login-view').classList.remove('hidden');
            document.getElementById('app-layout').classList.add('hidden');
        } else {
            document.getElementById('login-view').classList.add('hidden');
            document.getElementById('app-layout').classList.remove('hidden');
            
            const seccionId = rutaHash.replace('#/', '');
            const seccionDOM = document.getElementById(seccionId);
            if (seccionDOM) {
                seccionDOM.classList.remove('hidden');
                seccionDOM.classList.add('active');
            }
            
            const btnNav = document.querySelector(`a[href="${rutaHash}"]`);
            if (btnNav && !btnNav.classList.contains('locked')) {
                btnNav.classList.add('active');
            }

            // Cambiar título del topbar
            if(topbarTitle) {
                if(seccionId === 'dashboard') topbarTitle.innerText = "Mi Progreso";
                else if(seccionId === 'simulador') topbarTitle.innerText = "Simulador de Ataques";
                else if(seccionId === 'resultados') topbarTitle.innerText = "Reporte Forense";
            }
        }
    }
};