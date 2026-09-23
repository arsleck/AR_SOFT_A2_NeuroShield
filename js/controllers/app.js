// === EL CONTROLADOR (MVC) ===
// Responsable del enrutamiento SPA real, escuchar clics y conectar la Vista con el Modelo.

const AppController = {
    timerInterval: null,

    init: function() {
        // Enrutamiento SPA
        window.addEventListener('hashchange', () => this.enrutador());
        
        // Eventos de botones
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.hash = '#/dashboard';
        });

        document.getElementById('btn-caer')?.addEventListener('click', () => this.procesarSimulacion('caer'));
        document.getElementById('btn-ignorar')?.addEventListener('click', () => this.procesarSimulacion('ignorar'));
        document.getElementById('btn-reportar')?.addEventListener('click', () => this.procesarSimulacion('reportar'));

        this.enrutador();
    },

    enrutador: function() {
        const rutaActual = window.location.hash || '#/login';
        
        // Ordena a la Vista mostrar la pantalla correcta
        UIView.cambiarVistaActiva(rutaActual);

        if (rutaActual === '#/dashboard') {
            this.detenerTimer();
            UIView.actualizarDashboard(AppModel.estadoUsuario.riesgoActual);
            UIView.renderizarGrafico(AppModel.estadoUsuario.historialPuntajes);
        } else if (rutaActual === '#/simulador') {
            this.iniciarTimer();
        }
    },

    procesarSimulacion: function(accion) {
        this.detenerTimer();
        
        // Mostrar pantalla de carga
        const loader = document.getElementById('ai-loader');
        if(loader) loader.classList.remove('hidden');

        // Simular tiempo de respuesta del servidor (1.5 segundos)
        setTimeout(() => {
            if(loader) loader.classList.add('hidden');
            
            // Lógica de Modelo y Vista
            const resultado = AppModel.calcularNuevoRiesgo(accion);
            UIView.imprimirTerminal(resultado.logs);
            
            const navRes = document.getElementById('nav-resultados');
            if(navRes) navRes.classList.remove('hidden');
            
            // Redirigir a resultados
            window.location.hash = '#/resultados';
        }, 1500);
    },

    iniciarTimer: function() {
        let tiempo = 180;
        this.detenerTimer();
        const display = document.getElementById('time-display');
        this.timerInterval = setInterval(() => {
            tiempo--;
            if(display) display.innerText = `Quedan ${tiempo}s`;
            if (tiempo <= 0) {
                this.detenerTimer();
                this.procesarSimulacion('tiempo');
            }
        }, 1000);
    },

    detenerTimer: function() {
        if(this.timerInterval) clearInterval(this.timerInterval);
        const display = document.getElementById('time-display');
        if(display) display.innerText = `Quedan 180s`;
    }
};

// Arrancar la app cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});