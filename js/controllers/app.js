// === EL CONTROLADOR (MVC) ===
// Responsable del enrutamiento SPA real, escuchar clics y conectar la Vista con el Backend/Modelo.

const AppController = {
    timerInterval: null,

    init: function() {
        window.addEventListener('hashchange', () => this.enrutador());
        this.enrutador();
    },

    enrutador: function() {
        const rutaActual = window.location.hash || '#/login';
        UIView.renderizarPagina(rutaActual);
        this.asignarEventos(rutaActual);

        if (rutaActual === '#/dashboard') {
            this.detenerTimer();
            UIView.actualizarDashboard(AppModel.estadoUsuario.riesgoActual);
            UIView.renderizarGrafico(AppModel.estadoUsuario.historialPuntajes);
        } else if (rutaActual === '#/simulador') {
            this.iniciarTimer();
        }
    },

    asignarEventos: function(rutaActual) {
        
        // Expresiones regulares para validación Frontend
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // === LÓGICA DE LOGIN ===
        if (rutaActual === '#/login' || rutaActual === '') {
            document.getElementById('login-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const correoInput = document.getElementById('login-correo').value.trim();
                const passwordInput = document.getElementById('login-password').value;
                const btnSubmit = e.target.querySelector('button');
                
                const errorBox = document.getElementById('login-error-box');
                const errorText = document.getElementById('login-error-text');
                
                // Función rápida para mostrar error visual
                const mostrarError = (mensaje) => {
                    errorText.innerText = mensaje;
                    errorBox.style.display = 'block';
                    btnSubmit.innerHTML = 'Ingresar al Sistema <i class="fa-solid fa-arrow-right ms-2"></i>';
                    btnSubmit.disabled = false;
                };

                errorBox.style.display = 'none'; // Ocultar caja al reintentar
                
                if (!regexCorreo.test(correoInput)) return mostrarError('El formato del correo es inválido.');

                const textoOriginal = btnSubmit.innerHTML;
                btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando...';
                btnSubmit.disabled = true;

                try {
                    const respuesta = await fetch('http://localhost:3000/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ correo: correoInput, password: passwordInput })
                    });

                    const datos = await respuesta.json();

                    if (!respuesta.ok) return mostrarError(datos.error);

                    // Login exitoso
                    AppModel.estadoUsuario.nombre = datos.usuario.nombre;
                    AppModel.estadoUsuario.correo = datos.usuario.correo;
                    AppModel.estadoUsuario.riesgoActual = datos.usuario.riesgoActual;
                    
                    window.location.hash = '#/dashboard';

                } catch (error) {
                    mostrarError('Error de conexión. Verifica que el servidor backend esté encendido.');
                }
            });

        // === LÓGICA DE REGISTRO ===
        } else if (rutaActual === '#/registro') {
            document.getElementById('registro-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const nombreInput = document.getElementById('reg-nombre').value.trim();
                const correoInput = document.getElementById('reg-correo').value.trim();
                const passwordInput = document.getElementById('reg-password').value;
                const btnSubmit = e.target.querySelector('button');

                const errorBox = document.getElementById('reg-error-box');
                const errorText = document.getElementById('reg-error-text');

                const mostrarError = (mensaje) => {
                    errorText.innerText = mensaje;
                    errorBox.style.display = 'block';
                    btnSubmit.innerHTML = 'Registrarse <i class="fa-solid fa-arrow-right ms-2"></i>';
                    btnSubmit.disabled = false;
                };

                errorBox.style.display = 'none';

                // Validaciones visuales inmediatas (Front-end)
                if (!regexNombre.test(nombreInput)) return mostrarError('El nombre solo debe contener letras (mínimo 3).');
                if (!regexCorreo.test(correoInput)) return mostrarError('El correo ingresado no es válido.');
                if (passwordInput.length < 6) return mostrarError('La contraseña debe tener al menos 6 caracteres.');

                const textoOriginal = btnSubmit.innerHTML;
                btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creando cuenta...';
                btnSubmit.disabled = true;

                try {
                    const respuesta = await fetch('http://localhost:3000/api/registro', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ nombre: nombreInput, correo: correoInput, password: passwordInput })
                    });

                    const datos = await respuesta.json();

                    if (!respuesta.ok) return mostrarError(datos.error);

                    AppModel.estadoUsuario.nombre = datos.usuario.nombre;
                    AppModel.estadoUsuario.correo = datos.usuario.correo;
                    AppModel.estadoUsuario.riesgoActual = datos.usuario.riesgoActual;
                    
                    window.location.hash = '#/dashboard';

                } catch (error) {
                    mostrarError('Error de conexión con el servidor.');
                }
            });

        // === LÓGICA DEL SIMULADOR ===
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
            window.location.hash = '#/resultados';
            
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