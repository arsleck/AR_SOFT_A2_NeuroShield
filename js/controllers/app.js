// === EL CONTROLADOR (MVC) ===
// Responsable del enrutamiento SPA, seguridad JWT, Diagnóstico Inicial, Perfil, Cursos y conexión con Backend.

const AppController = {
    timerInterval: null,

    init: async function() {
        // Restaurar datos básicos del usuario si recargó la página con sesión activa
        const usuarioGuardado = sessionStorage.getItem('neuroshield_usuario');
        if (usuarioGuardado) {
            try {
                const parsed = JSON.parse(usuarioGuardado);
                AppModel.estadoUsuario = { ...AppModel.estadoUsuario, ...parsed };
            } catch (e) {
                console.error('Error al restaurar sesión:', e);
            }
        }

        window.addEventListener('hashchange', () => this.enrutador());
        this.asignarEventosGlobales();
        // Cargamos los cursos desde PostgreSQL (Neon) si el backend está activo
        await AppModel.sincronizarCursosDesdeBD();
        this.enrutador();
    },

    enrutador: function() {
        const rutaActual = window.location.hash || '#/login';
        
        const token = sessionStorage.getItem('neuroshield_token');
        const rutasPublicas = ['#/login', '#/registro', ''];

        if (!rutasPublicas.includes(rutaActual) && !token) {
            alert('Acceso denegado: Por favor inicia sesión primero.');
            window.location.hash = '#/login';
            return; 
        }

        if (rutasPublicas.includes(rutaActual) && token) {
            window.location.hash = '#/dashboard';
            return;
        }

        const claveDiag = `neuroshield_diag_${AppModel.estadoUsuario.correo || 'default'}`;
        if (localStorage.getItem(claveDiag)) {
            AppModel.estadoUsuario.diagnosticoCompletado = true;
        }

        UIView.renderizarPagina(rutaActual);
        this.asignarEventos(rutaActual);

        if (rutaActual === '#/dashboard') {
            this.detenerTimer();
            if (!localStorage.getItem(claveDiag)) {
                this.mostrarModalDiagnostico();
            }
        } else if (rutaActual === '#/perfil') {
            this.detenerTimer();
            UIView.actualizarDashboard(AppModel.estadoUsuario.riesgoActual);
            UIView.renderizarGrafico();
        } else if (rutaActual === '#/aprendizaje' && AprendizajePage.cursoSeleccionadoId) {
            this.detenerTimer();
            this.activarEventosDetalleCurso(AprendizajePage.cursoSeleccionadoId);
        } else if (rutaActual === '#/simulador') {
            this.iniciarTimer();
        } else {
            this.detenerTimer();
        }
    },

    mostrarModalDiagnostico: function() {
        if (document.getElementById('tutorial-overlay')) return;

        document.body.insertAdjacentHTML('beforeend', TutorialComponent.render());

        const cerrarModal = () => {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.remove();
        };

        document.getElementById('btn-saltar-diagnostico')?.addEventListener('click', cerrarModal);

        document.getElementById('form-diagnostico')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const respuestasPorVector = {};

            for (let [vector, valor] of formData.entries()) {
                respuestasPorVector[vector] = parseInt(valor, 10);
            }

            AppModel.evaluarDiagnostico(respuestasPorVector);

            const claveDiag = `neuroshield_diag_${AppModel.estadoUsuario.correo || 'default'}`;
            localStorage.setItem(claveDiag, 'true');
            sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));

            cerrarModal();

            // Redirigir o refrescar la vista de perfil para que vea su nuevo estado de seguridad
            window.location.hash = '#/perfil';
            UIView.renderizarPagina('#/perfil');
            this.asignarEventos('#/perfil');
            UIView.actualizarDashboard(AppModel.estadoUsuario.riesgoActual);
            UIView.renderizarGrafico();
        });
    },

    mostrarModalCurso: function(idCurso) {
        const curso = AppModel.catalogoCursos.find(c => String(c.id_curso) === String(idCurso));
        if (!curso) return;

        AprendizajePage.cursoSeleccionadoId = curso.id_curso;
        if (window.location.hash !== '#/aprendizaje') {
            window.location.hash = '#/aprendizaje';
        } else {
            UIView.renderizarPagina('#/aprendizaje');
            this.asignarEventos('#/aprendizaje');
            this.activarEventosDetalleCurso(curso.id_curso);
        }
    },

    activarEventosFormularioCurso: function(cursoExistente) {
        const cerrarModal = () => {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.remove();
        };

        document.getElementById('btn-cerrar-modal-curso')?.addEventListener('click', cerrarModal);

        document.getElementById('form-gestionar-curso')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const esEdicion = cursoExistente !== null;
            const idCurso = esEdicion ? cursoExistente.id_curso : null;

            const datosCurso = {
                titulo: document.getElementById('gc-titulo').value.trim(),
                categoria: document.getElementById('gc-categoria').value,
                nivel: document.getElementById('gc-nivel').value,
                duracion: document.getElementById('gc-duracion').value.trim(),
                portada_url: document.getElementById('gc-portada').value.trim() || null,
                resumen: document.getElementById('gc-resumen').value.trim(),
                como_funciona: document.getElementById('gc-comofunciona').value.trim(),
                prevencion: document.getElementById('gc-prevencion').value.trim(),
                senales_alerta: esEdicion ? cursoExistente.senales_alerta : ["Verificar siempre remitente oficial", "Desconfiar de urgencias inusuales"],
                materiales: esEdicion ? cursoExistente.materiales : [],
                quizzes: esEdicion ? cursoExistente.quizzes : []
            };

            try {
                const url = esEdicion ? `http://localhost:3000/api/cursos/${idCurso}` : 'http://localhost:3000/api/cursos';
                const metodo = esEdicion ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosCurso)
                });

                if (res.ok) {
                    await AppModel.sincronizarCursosDesdeBD();
                    cerrarModal();
                    window.location.hash = '#/gestion';
                    UIView.renderizarPagina('#/gestion');
                    this.asignarEventos('#/gestion');
                } else {
                    alert('Error al guardar el curso en la base de datos.');
                }
            } catch (err) {
                alert('Error de conexión con el servidor.');
            }
        });
    },

    activarEventosDetalleCurso: function(idCurso) {
        const curso = AppModel.catalogoCursos.find(c => String(c.id_curso) === String(idCurso));
        if (!curso) return;

        const wrapper = document.querySelector('.main-wrapper');
        if (wrapper) wrapper.scrollTop = 0;

        document.getElementById('btn-volver-catalogo')?.addEventListener('click', () => {
            AprendizajePage.cursoSeleccionadoId = null;
            UIView.renderizarPagina('#/aprendizaje');
            this.asignarEventos('#/aprendizaje');
        });

        document.getElementById('btn-empezar-acordeon')?.addEventListener('click', () => {
            document.getElementById('lista-acordeones-curso')?.scrollIntoView({ behavior: 'smooth' });
        });

        document.querySelectorAll('.cisco-accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.closest('.cisco-accordion-item');
                if (item) item.classList.toggle('open');
            });
        });

        const formQuiz = document.getElementById('form-quiz-curso');
        if (formQuiz) {
            formQuiz.addEventListener('submit', async (e) => {
                e.preventDefault();
                const quizzes = Array.isArray(curso.quizzes) ? curso.quizzes : [];
                let aciertos = 0;

                quizzes.forEach((q, qIndex) => {
                    const opciones = Array.isArray(q.opciones) ? q.opciones : JSON.parse(q.opciones || '[]');
                    const seleccionada = formQuiz.querySelector(`input[name="quiz_preg_${qIndex}"]:checked`);
                    const indiceSeleccionado = seleccionada ? parseInt(seleccionada.value, 10) : -1;
                    const esCorrecta = opciones[indiceSeleccionado]?.es_correcta === true;

                    if (esCorrecta) aciertos++;

                    const cajaFeedback = document.getElementById(`feedback-quiz-${qIndex}`);
                    if (cajaFeedback) {
                        cajaFeedback.classList.remove('hidden');
                        if (esCorrecta) {
                            cajaFeedback.style.background = 'var(--success-bg)';
                            cajaFeedback.style.border = '1px solid #a7f3d0';
                            cajaFeedback.style.color = '#065f46';
                            cajaFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>Respuesta correcta:</strong> ${q.explicacion || ''}`;
                        } else {
                            cajaFeedback.style.background = 'var(--danger-bg)';
                            cajaFeedback.style.border = '1px solid #fecaca';
                            cajaFeedback.style.color = '#991b1b';
                            cajaFeedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <strong>Respuesta incorrecta:</strong> ${q.explicacion || ''}`;
                        }
                    }
                });

                const porcentaje = quizzes.length > 0 ? Math.round((aciertos / quizzes.length) * 100) : 100;
                const resGlobal = document.getElementById('resultado-global-quiz');
                if (resGlobal) {
                    resGlobal.classList.remove('hidden');
                    resGlobal.style.background = porcentaje >= 60 ? 'var(--success-bg)' : 'var(--warning-bg)';
                    resGlobal.style.border = porcentaje >= 60 ? '1px solid #a7f3d0' : '1px solid #fde68a';
                    resGlobal.style.color = porcentaje >= 60 ? '#065f46' : '#92400e';
                    resGlobal.innerHTML = `<i class="fa-solid fa-award"></i> Calificación obtenida: ${porcentaje}% (${aciertos} de ${quizzes.length} respuestas correctas).`;
                }

                document.querySelectorAll('.seccion-post-quiz').forEach(el => {
                    el.classList.remove('hidden');
                    el.classList.add('open');
                });

                const vectorCurso = curso.categoria;
                if (AppModel.estadoUsuario.riesgoPorVector[vectorCurso] !== undefined) {
                    const ajuste = porcentaje >= 60 ? -10 : 5;
                    AppModel.estadoUsuario.riesgoPorVector[vectorCurso] = Math.max(
                        10,
                        Math.min(95, AppModel.estadoUsuario.riesgoPorVector[vectorCurso] + ajuste)
                    );
                    const valores = Object.values(AppModel.estadoUsuario.riesgoPorVector);
                    AppModel.estadoUsuario.riesgoActual = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
                    sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
                }

                if (AppModel.estadoUsuario.id) {
                    try {
                        await fetch(`http://localhost:3000/api/cursos/${curso.id_curso}/progreso`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id_usuario: AppModel.estadoUsuario.id,
                                puntaje_quiz: porcentaje,
                                nuevo_riesgo: AppModel.estadoUsuario.riesgoActual
                            })
                        });
                    } catch (err) {
                        console.error('No se pudo guardar el progreso del curso:', err);
                    }
                }
            });
        }
    },

    asignarEventosGlobales: function() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-btn')) {
                sessionStorage.removeItem('neuroshield_token');
                sessionStorage.removeItem('neuroshield_usuario');
                AprendizajePage.cursoSeleccionadoId = null;
                AppModel.estadoUsuario = {
                    id: null,
                    nombre: "Estudiante",
                    correo: "",
                    rol: "Estudiante",
                    riesgoActual: 55,
                    riesgoPorVector: { Phishing: 65, Smishing: 50, Vishing: 60, "Ing. Social": 45 },
                    diagnosticoCompletado: false,
                    nivelConocimiento: "Sin evaluar",
                    recomendacionesActuales: [
                        {
                            icono: "fa-clipboard-check",
                            color: "text-primary",
                            texto: "Realiza la evaluación diagnóstica inicial para medir tu nivel de exposición en cada tipo de amenaza."
                        },
                        {
                            icono: "fa-graduation-cap",
                            color: "text-warning",
                            texto: "Completa los microcursos del catálogo antes de iniciar tu entrenamiento en el simulador."
                        }
                    ]
                };
                window.location.hash = '#/login';
                return;
            }

            // Si hace clic en el enlace de navegación hacia #/aprendizaje, mostramos el catálogo general
            const linkAprendizaje = e.target.closest('a[href="#/aprendizaje"]');
            if (linkAprendizaje) {
                AprendizajePage.cursoSeleccionadoId = null;
                if (window.location.hash === '#/aprendizaje') {
                    UIView.renderizarPagina('#/aprendizaje');
                    this.asignarEventos('#/aprendizaje');
                }
                return;
            }

            // Abrir vista de detalle del curso al hacer clic en cualquier tarjeta de curso
            const btnCurso = e.target.closest('.btn-ver-curso');
            if (btnCurso) {
                const idCurso = btnCurso.getAttribute('data-curso-id');
                this.mostrarModalCurso(idCurso);
            }
        });
    },

    asignarEventos: function(rutaActual) {
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
        const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        document.getElementById('btn-abrir-diagnostico')?.addEventListener('click', () => this.mostrarModalDiagnostico());
        document.getElementById('btn-abrir-diagnostico-aprendizaje')?.addEventListener('click', () => this.mostrarModalDiagnostico());
        document.getElementById('btn-abrir-diagnostico-perfil')?.addEventListener('click', () => this.mostrarModalDiagnostico());

        // === LÓGICA DE ACTUALIZACIÓN DE PERFIL (#/perfil) ===
        if (rutaActual === '#/perfil') {
            document.getElementById('form-actualizar-perfil')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nombreInput = document.getElementById('perfil-nombre').value.trim();
                const correoInput = document.getElementById('perfil-correo').value.trim();
                const passwordInput = document.getElementById('perfil-password').value;
                const msgBox = document.getElementById('perfil-msg-box');
                const btnGuardar = document.getElementById('btn-guardar-perfil');

                const mostrarMensaje = (texto, exito = false) => {
                    msgBox.style.display = 'block';
                    msgBox.style.background = exito ? 'var(--success-bg)' : 'var(--danger-bg)';
                    msgBox.style.color = exito ? '#065f46' : '#991b1b';
                    msgBox.style.border = exito ? '1px solid #a7f3d0' : '1px solid #fecaca';
                    msgBox.innerHTML = `<i class="fa-solid ${exito ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${texto}`;
                };

                if (!regexNombre.test(nombreInput)) return mostrarMensaje('El nombre solo debe contener letras (mínimo 3).');
                if (!regexCorreo.test(correoInput)) return mostrarMensaje('El correo ingresado no es válido.');

                btnGuardar.disabled = true;
                btnGuardar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

                try {
                    const userId = AppModel.estadoUsuario.id;
                    if (!userId) {
                        AppModel.estadoUsuario.nombre = nombreInput;
                        AppModel.estadoUsuario.correo = correoInput;
                        sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
                        mostrarMensaje('Datos actualizados en la sesión actual.', true);
                    } else {
                        const respuesta = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nombre: nombreInput,
                                correo: correoInput,
                                nuevaPassword: passwordInput
                            })
                        });
                        const datos = await respuesta.json();
                        if (!respuesta.ok) {
                            btnGuardar.disabled = false;
                            btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
                            return mostrarMensaje(datos.error || 'No se pudo actualizar.');
                        }
                        AppModel.estadoUsuario.nombre = datos.usuario.nombre;
                        AppModel.estadoUsuario.correo = datos.usuario.correo;
                        sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
                        mostrarMensaje('Información actualizada exitosamente en la base de datos.', true);
                    }

                    setTimeout(() => {
                        UIView.renderizarPagina('#/perfil');
                        this.asignarEventos('#/perfil');
                        UIView.actualizarDashboard(AppModel.estadoUsuario.riesgoActual);
                        UIView.renderizarGrafico();
                    }, 900);
                } catch (err) {
                    mostrarMensaje('Error de conexión con el servidor.');
                } finally {
                    btnGuardar.disabled = false;
                    btnGuardar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
                }
            });

        // === LÓGICA DE LOGIN ===
        } else if (rutaActual === '#/login' || rutaActual === '') {
            document.getElementById('login-form')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const correoInput = document.getElementById('login-correo').value.trim();
                const passwordInput = document.getElementById('login-password').value;
                const btnSubmit = e.target.querySelector('button');
                
                const errorBox = document.getElementById('login-error-box');
                const errorText = document.getElementById('login-error-text');
                
                const mostrarError = (mensaje) => {
                    errorText.innerText = mensaje;
                    errorBox.style.display = 'block';
                    btnSubmit.innerHTML = 'Ingresar al Sistema <i class="fa-solid fa-arrow-right ms-2"></i>';
                    btnSubmit.disabled = false;
                };

                errorBox.style.display = 'none';
                if (!regexCorreo.test(correoInput)) return mostrarError('El formato del correo es inválido.');

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

                    sessionStorage.setItem('neuroshield_token', datos.token);
                    AppModel.estadoUsuario.id = datos.usuario.id;
                    AppModel.estadoUsuario.nombre = datos.usuario.nombre;
                    AppModel.estadoUsuario.correo = datos.usuario.correo;
                    AppModel.estadoUsuario.rol = datos.usuario.rol || 'Estudiante';
                    AppModel.estadoUsuario.riesgoActual = datos.usuario.riesgoActual;
                    sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));

                    await AppModel.sincronizarCursosDesdeBD();
                    window.location.hash = '#/dashboard';
                } catch (error) {
                    mostrarError('Error de conexión. Verifica que el servidor backend esté encendido.');
                }
            });

        }
        // === LÓGICA DEL PANEL DE GESTIÓN (CRUD DE CURSOS) ===
        else if (rutaActual === '#/gestion') {
            document.getElementById('btn-nuevo-curso')?.addEventListener('click', () => {
                document.body.insertAdjacentHTML('beforeend', TutorialComponent.renderFormularioCurso(null));
                this.activarEventosFormularioCurso(null);
            });

            document.querySelectorAll('.btn-editar-curso').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-curso-id');
                    const curso = AppModel.catalogoCursos.find(c => String(c.id_curso) === String(id));
                    if (curso) {
                        document.body.insertAdjacentHTML('beforeend', TutorialComponent.renderFormularioCurso(curso));
                        this.activarEventosFormularioCurso(curso);
                    }
                });
            });

            document.querySelectorAll('.btn-eliminar-curso').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-curso-id');
                    if (confirm('¿Estás seguro de desactivar/eliminar este curso?')) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/cursos/${id}`, { method: 'DELETE' });
                            if (res.ok) {
                                await AppModel.sincronizarCursosDesdeBD();
                                UIView.renderizarPagina('#/gestion');
                                this.asignarEventos('#/gestion');
                            } else {
                                alert('No se pudo eliminar el curso.');
                            }
                        } catch (err) {
                            alert('Error de conexión con el servidor.');
                        }
                    }
                });
            });
        }// === LÓGICA DE REGISTRO ===
         else if (rutaActual === '#/registro') {
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
                if (!regexNombre.test(nombreInput)) return mostrarError('El nombre solo debe contener letras (mínimo 3).');
                if (!regexCorreo.test(correoInput)) return mostrarError('El correo ingresado no es válido.');
                if (passwordInput.length < 6) return mostrarError('La contraseña debe tener al menos 6 caracteres.');

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

                    sessionStorage.setItem('neuroshield_token', datos.token);
                    AppModel.estadoUsuario.id = datos.usuario.id;
                    AppModel.estadoUsuario.nombre = datos.usuario.nombre;
                    AppModel.estadoUsuario.correo = datos.usuario.correo;
                    AppModel.estadoUsuario.rol = datos.usuario.rol || 'Estudiante';
                    AppModel.estadoUsuario.riesgoActual = datos.usuario.riesgoActual;
                    sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));

                    await AppModel.sincronizarCursosDesdeBD();
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
        // === LÓGICA DEL PANEL DE GESTIÓN (CRUD DE CURSOS) ===
        else if (rutaActual === '#/gestion') {
            document.getElementById('btn-nuevo-curso')?.addEventListener('click', () => {
                document.body.insertAdjacentHTML('beforeend', TutorialComponent.renderFormularioCurso(null));
                this.activarEventosFormularioCurso(null);
            });

            document.querySelectorAll('.btn-editar-curso').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-curso-id');
                    const curso = AppModel.catalogoCursos.find(c => String(c.id_curso) === String(id));
                    if (curso) {
                        document.body.insertAdjacentHTML('beforeend', TutorialComponent.renderFormularioCurso(curso));
                        this.activarEventosFormularioCurso(curso);
                    }
                });
            });

            document.querySelectorAll('.btn-eliminar-curso').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-curso-id');
                    if (confirm('¿Estás seguro de desactivar/eliminar este curso?')) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/cursos/${id}`, { method: 'DELETE' });
                            if (res.ok) {
                                await AppModel.sincronizarCursosDesdeBD();
                                UIView.renderizarPagina('#/gestion');
                                this.asignarEventos('#/gestion');
                            } else {
                                alert('No se pudo eliminar el curso.');
                            }
                        } catch (err) {
                            alert('Error de conexión con el servidor.');
                        }
                    }
                });
            });
        }
    },

    procesarSimulacion: function(accion) {
        this.detenerTimer();
        const loader = document.getElementById('ai-loader');
        if(loader) loader.classList.remove('hidden');

        setTimeout(() => {
            if(loader) loader.classList.add('hidden');
            
            const resultado = AppModel.calcularNuevoRiesgo(accion);
            sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
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