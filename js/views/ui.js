const UIView = {
    miGrafico: null,

    renderizarPagina: function(rutaHash) {
        const root = document.getElementById('app-root');
        
        if (rutaHash === '#/login' || rutaHash === '') {
            root.innerHTML = LoginPage.render();
        } else if (rutaHash === '#/registro') {
            root.innerHTML = RegistroPage.render();
        } else {
            let contenidoPagina = ''; 
            let titulo = '';

            if (rutaHash === '#/dashboard') { contenidoPagina = DashboardPage.render(); titulo = 'Inicio'; } 
            else if (rutaHash === '#/perfil') { contenidoPagina = PerfilPage.render(); titulo = 'Mi Perfil'; }
            else if (rutaHash === '#/aprendizaje') { contenidoPagina = AprendizajePage.render(); titulo = 'Catálogo de Cursos'; }
            else if (rutaHash === '#/simulador') { contenidoPagina = SimuladorPage.render(); titulo = 'Simulador'; } 
            else if (rutaHash === '#/resultados') { contenidoPagina = ResultadosPage.render(); titulo = 'Reporte Forense'; } 
            else if (rutaHash === '#/gestion') { contenidoPagina = GestionPage.render(); titulo = 'Gestión'; }
            else if (rutaHash === '#/misiones') { contenidoPagina = MisionesPage.render(); titulo = 'Entrenamientos'; }
            
            root.innerHTML = `
                <div class="app-layout">
                    ${SidebarComponent.render(rutaHash)}
                    ${TopbarComponent.render(titulo, rutaHash)}
                    <div class="main-wrapper" style="flex:1; overflow-y:auto;">
                        <main class="main-content">
                            ${contenidoPagina}
                        </main>
                    </div>
                </div>
            `;
            
            this.activarMenu();
        }
    },

    activarMenu: function() {
        const openBtn = document.getElementById('open-drawer');
        const closeBtn = document.getElementById('close-drawer');
        const drawer = document.getElementById('side-drawer');
        const overlay = document.getElementById('drawer-overlay');

        if(openBtn) openBtn.onclick = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
        if(closeBtn) closeBtn.onclick = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
        if(overlay) overlay.onclick = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
    },

    // Gráfica de Barras Horizontales por Tipo de Ataque con Semáforo de Riesgo
    renderizarGrafico: function() {
        const ctx = document.getElementById('vulnChart');
        if(!ctx) return;
        
        if(this.miGrafico) this.miGrafico.destroy();

        const vectores = AppModel.estadoUsuario.riesgoPorVector || {
            Phishing: 65, Smishing: 50, Vishing: 60, "Ing. Social": 45
        };

        const etiquetas = Object.keys(vectores);
        const valores = Object.values(vectores);

        // Asignar color semáforo según nivel de riesgo
        const coloresFondo = valores.map(v => {
            if (v < 40) return 'rgba(16, 185, 129, 0.85)'; // Verde (Seguro)
            if (v < 60) return 'rgba(245, 158, 11, 0.85)'; // Ámbar (Moderado)
            return 'rgba(239, 68, 68, 0.85)';              // Rojo (Alto riesgo)
        });

        const coloresBorde = valores.map(v => {
            if (v < 40) return '#059669';
            if (v < 60) return '#d97706';
            return '#dc2626';
        });

        this.miGrafico = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Vulnerabilidad (%)',
                    data: valores,
                    backgroundColor: coloresFondo,
                    borderColor: coloresBorde,
                    borderWidth: 1.5,
                    borderRadius: 6,
                    barThickness: 24
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const val = context.parsed.x;
                                const nivel = val < 40 ? 'Riesgo Bajo' : (val < 60 ? 'Riesgo Moderado' : 'Riesgo Alto - Reforzar');
                                return ` ${val}% de vulnerabilidad (${nivel})`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) { return value + '%'; }
                        },
                        grid: { color: '#e2e8f0' }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { font: { weight: '600' } }
                    }
                }
            }
        });
    },

    actualizarDashboard: function(nuevoRiesgo) {
        const scoreText = document.getElementById('score-text');
        if(scoreText) scoreText.innerText = `${nuevoRiesgo}%`;
    },

    imprimirTerminal: function(logs) {
        const terminal = document.getElementById('terminal-output');
        if(!terminal) return;
        terminal.innerHTML = "";
        logs.forEach(log => terminal.innerHTML += `<p>> ${log}</p>`);
    }
};