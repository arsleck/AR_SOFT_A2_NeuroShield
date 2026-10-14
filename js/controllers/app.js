const AppController = {
    timerInterval: null,

    init: function() {
        window.addEventListener('hashchange', () => this.enrutador());
        this.enrutador();
    },

    enrutador: function() {
        const rutaActual = window.location.hash || '#/login';
        
        // 1. Renderizar la página visualmente
        UIView.renderizarPagina(rutaActual);

        // 2. Asignar los eventos de botones porque el HTML se acaba de inyectar
        this.asignarEventos(rutaActual);

        // 3. Ejecutar lógica si corresponde
        if (rutaActual === '#/dashboard') {
            this.detenerTimer();
            UIView.actualizarDashboard(AppModel.estadoUsuario.riesgoActual);
            UIView.renderizarGrafico(AppModel.estadoUsuario.historialPuntajes);
        } else if (rutaActual === '#/simulador') {
            this.iniciarTimer();
        }
    },

    asignarEventos: function(rutaActual) {
        if (rutaActual === '#/login' || rutaActual === '') {
            document.getElementById('login-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                window.location.hash = '#/dashboard';
            });
        } else if (rutaActual === '#/simulador') {
            document.getElementById('btn-caer')?.addEventListener('click', () => this.procesarSimulacion('caer'));
            document.getElementById('btn-ignorar')?.addEventListener('click', () => this.procesarSimulacion('ignorar'));
            document.getElementById('btn-reportar')?.addEventListener('click', () => this.procesarSimulacion('reportar'));
        }
    },

    procesarSimulacion: function(accion) {
        this.detenerTimer();
        const loader = document.getElementById('ai-loader');
        if(loader) loader.classList.remove('hidden');

        setTimeout(() => {
            if(loader) loader.classList.add('hidden');
            
            const resultado = AppModel.calcularNuevoRiesgo(accion);
            
            // Cambiar de pantalla primero
            window.location.hash = '#/resultados';
            
            // Esperar una fracción de segundo a que la UI se dibuje, e imprimir los resultados
            setTimeout(() => {
                UIView.imprimirTerminal(resultado.logs);
            }, 50);
            
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

document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});