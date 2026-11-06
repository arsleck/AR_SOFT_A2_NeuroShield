// === EL CONTROLADOR (MVC) ===
// Responsable del enrutamiento SPA, seguridad JWT, Diagnóstico Inicial, Perfil, Cursos, Simuladores (5 Dinámicas), Gestión Admin y conexión con Backend.

const AppController = {
    timerInterval: null,

    init: async function() {
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
        
        if (rutaActual === '#/gestion' && AppModel.estadoUsuario.rol !== 'Administrador') {
            alert('Acceso restringido: Solo los administradores pueden ingresar al módulo de Gestión.');
            window.location.hash = '#/dashboard';
            return;
        }

        if (rutaActual !== '#/simulador' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        const claveDiag = `neuroshield_diag_${AppModel.estadoUsuario.correo || 'default'}`;
        if (localStorage.getItem(claveDiag)) {
            AppModel.estadoUsuario.diagnosticoCompletado = true;
        }

        if (rutaActual === '#/gestion') {
            this.detenerTimer();
            Promise.all([
                AppModel.sincronizarDatosAdminDesdeBD(),
                AppModel.sincronizarMisionesDesdeBD()
            ]).then(() => {
                if (!document.getElementById('tutorial-overlay')) {
                    UIView.renderizarPagina('#/gestion');
                    this.asignarEventos('#/gestion');
                }
            });
            return;
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
            const mision = AppModel.catalogoMisiones.find(m => String(m.id_mision) === String(AppModel.misionActivaId)) || AppModel.catalogoMisiones[0];
            this.iniciarTimer(mision ? mision.tiempo_limite : 120);
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

    subirArchivoServidor: async function(archivo) {
        const mime = archivo.type || 'application/octet-stream';
        let tipoRecurso = 'documento';
        if (mime.startsWith('image/')) tipoRecurso = 'imagen';
        else if (mime.startsWith('video/')) tipoRecurso = 'video';
        else if (mime.startsWith('audio/')) tipoRecurso = 'audio';

        if (archivo.size <= 12 * 1024 * 1024) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve({
                        archivo_url: reader.result,
                        mime_type: mime,
                        tipo_recurso: tipoRecurso,
                        nombre_original: archivo.name
                    });
                };
                reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado'));
                reader.readAsDataURL(archivo);
            });
        }

        const formData = new FormData();
        formData.append('archivo', archivo);

        const res = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Error al subir el archivo al servidor');
        return await res.json();
    },

    activarEventosFormularioCurso: function(cursoExistente) {
        const cerrarModal = () => {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.remove();
        };

        document.getElementById('btn-cerrar-modal-curso')?.addEventListener('click', cerrarModal);

        const contenedorMateriales = document.getElementById('contenedor-materiales-curso');
        const contenedorQuizzes = document.getElementById('contenedor-quizzes-curso');

        document.getElementById('input-upload-portada')?.addEventListener('change', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const file = e.target.files[0];
            if (!file) return;

            const inputUrl = document.getElementById('gc-portada');
            const previewBox = document.getElementById('portada-preview-box');
            const previewImg = document.getElementById('portada-preview-img');

            try {
                const data = await this.subirArchivoServidor(file);
                inputUrl.value = data.archivo_url;
                if (previewBox && previewImg) {
                    previewImg.src = data.archivo_url;
                    previewBox.classList.remove('hidden');
                }
            } catch (err) {
                inputUrl.value = '';
                alert('No se pudo procesar la imagen seleccionada.');
            }
        });

        document.getElementById('gc-portada')?.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            const previewBox = document.getElementById('portada-preview-box');
            const previewImg = document.getElementById('portada-preview-img');
            if (val && previewBox && previewImg) {
                previewImg.src = val;
                previewBox.classList.remove('hidden');
            }
        });

        document.getElementById('btn-agregar-material')?.addEventListener('click', (e) => {
            e.preventDefault();
            const nuevoIndex = contenedorMateriales.querySelectorAll('.curso-material-item').length;
            contenedorMateriales.insertAdjacentHTML('beforeend', TutorialComponent.renderItemMaterial({}, nuevoIndex));
        });

        document.getElementById('btn-agregar-quiz')?.addEventListener('click', (e) => {
            e.preventDefault();
            const nuevoIndex = contenedorQuizzes.querySelectorAll('.curso-quiz-item').length;
            contenedorQuizzes.insertAdjacentHTML('beforeend', TutorialComponent.renderItemQuiz({}, nuevoIndex));
        });

        const formModal = document.getElementById('form-gestionar-curso');
        formModal?.addEventListener('click', (e) => {
            const btnQuitarMat = e.target.closest('.btn-quitar-material');
            if (btnQuitarMat) {
                e.preventDefault();
                btnQuitarMat.closest('.curso-material-item')?.remove();
                return;
            }

            const btnQuitarQuiz = e.target.closest('.btn-quitar-quiz');
            if (btnQuitarQuiz) {
                e.preventDefault();
                btnQuitarQuiz.closest('.curso-quiz-item')?.remove();
            }
        });

        formModal?.addEventListener('change', async (e) => {
            if (e.target.classList.contains('input-upload-material')) {
                e.preventDefault();
                e.stopPropagation();

                const file = e.target.files[0];
                if (!file) return;
                const bloque = e.target.closest('.curso-material-item');
                const inputUrl = bloque.querySelector('.mat-url');
                const inputMime = bloque.querySelector('.mat-mime');
                const selectTipo = bloque.querySelector('.mat-tipo');
                const statusBox = bloque.querySelector('.mat-upload-status');

                try {
                    const data = await this.subirArchivoServidor(file);
                    inputUrl.value = data.archivo_url;
                    inputMime.value = data.mime_type || '';
                    if (data.tipo_recurso) selectTipo.value = data.tipo_recurso;
                    if (statusBox) {
                        statusBox.innerHTML = `
                            <div style="color: var(--primary); font-weight: 700; margin-top: 4px;">
                                <i class="fa-solid fa-circle-check"></i> Archivo cargado correctamente (${file.name})
                            </div>
                            ${data.tipo_recurso === 'imagen' ? `<img src="${data.archivo_url}" style="max-height: 95px; border-radius: 6px; margin-top: 6px; border: 1px solid var(--border);">` : ''}
                        `;
                    }
                } catch (err) {
                    inputUrl.value = '';
                    alert('Error al cargar el archivo multimedia.');
                }
            }

            if (e.target.classList.contains('input-upload-quiz')) {
                e.preventDefault();
                e.stopPropagation();

                const file = e.target.files[0];
                if (!file) return;
                const bloque = e.target.closest('.curso-quiz-item');
                const inputUrl = bloque.querySelector('.quiz-url-apoyo');
                const selectTipo = bloque.querySelector('.quiz-tipo-apoyo');

                try {
                    const data = await this.subirArchivoServidor(file);
                    inputUrl.value = data.archivo_url;
                    if (['imagen', 'audio', 'video'].includes(data.tipo_recurso)) {
                        selectTipo.value = data.tipo_recurso;
                    }
                } catch (err) {
                    inputUrl.value = '';
                    alert('Error al cargar el archivo para la pregunta del quiz.');
                }
            }
        });

        formModal?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const esEdicion = cursoExistente !== null;
            const idCurso = esEdicion ? cursoExistente.id_curso : null;
            const token = sessionStorage.getItem('neuroshield_token');

            const senalesTexto = document.getElementById('gc-senales').value;
            const senales_alerta = senalesTexto
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const categoriaSeleccionada = document.getElementById('gc-categoria').value;
            const inputHabilidades = document.getElementById('gc-habilidades');
            const habilidades = inputHabilidades && inputHabilidades.value.trim().length > 0
                ? inputHabilidades.value.split(',').map(h => h.trim()).filter(h => h.length > 0)
                : (esEdicion && Array.isArray(cursoExistente.habilidades) && cursoExistente.habilidades.length > 0
                    ? cursoExistente.habilidades
                    : AppModel.obtenerHabilidadesPorDefecto(categoriaSeleccionada));

            const materiales = [];
            contenedorMateriales.querySelectorAll('.curso-material-item').forEach((item, idx) => {
                materiales.push({
                    orden: idx + 1,
                    titulo: item.querySelector('.mat-titulo').value.trim(),
                    tipo_recurso: item.querySelector('.mat-tipo').value,
                    archivo_url: item.querySelector('.mat-url').value.trim() || null,
                    mime_type: item.querySelector('.mat-mime').value.trim() || null,
                    contenido_texto: item.querySelector('.mat-texto').value.trim(),
                    es_post_quiz: item.querySelector('.mat-postquiz').value === 'true'
                });
            });

            const quizzes = [];
            contenedorQuizzes.querySelectorAll('.curso-quiz-item').forEach((item, idx) => {
                const radioMarcado = item.querySelector('.quiz-radio-correcta:checked');
                const correctaIdx = radioMarcado ? parseInt(radioMarcado.value, 10) : 0;

                const opciones = [
                    { texto: item.querySelector('.quiz-op-0').value.trim(), es_correcta: correctaIdx === 0 },
                    { texto: item.querySelector('.quiz-op-1').value.trim(), es_correcta: correctaIdx === 1 },
                    { texto: item.querySelector('.quiz-op-2').value.trim(), es_correcta: correctaIdx === 2 }
                ];

                quizzes.push({
                    orden: idx + 1,
                    pregunta: item.querySelector('.quiz-pregunta').value.trim(),
                    tipo_recurso_apoyo: item.querySelector('.quiz-tipo-apoyo').value || null,
                    recurso_apoyo_url: item.querySelector('.quiz-url-apoyo').value.trim() || null,
                    opciones: opciones,
                    explicacion: item.querySelector('.quiz-explicacion').value.trim(),
                    puntos_riesgo_fallo: 15
                });
            });

            const datosCurso = {
                titulo: document.getElementById('gc-titulo').value.trim(),
                categoria: categoriaSeleccionada,
                nivel: document.getElementById('gc-nivel').value,
                duracion: document.getElementById('gc-duracion').value.trim(),
                icono: document.getElementById('gc-icono').value,
                portada_url: document.getElementById('gc-portada').value.trim() || null,
                resumen: document.getElementById('gc-resumen').value.trim(),
                como_funciona: document.getElementById('gc-comofunciona').value.trim(),
                prevencion: document.getElementById('gc-prevencion').value.trim(),
                senales_alerta: senales_alerta,
                habilidades: habilidades,
                materiales: materiales,
                quizzes: quizzes
            };

            const btnSubmit = document.getElementById('btn-submit-curso-completo');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando curso en Neon...';

            try {
                const url = esEdicion ? `http://localhost:3000/api/cursos/${idCurso}` : 'http://localhost:3000/api/cursos';
                const metodo = esEdicion ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: metodo,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datosCurso)
                });

                if (res.ok) {
                    await AppModel.sincronizarCursosDesdeBD();
                    cerrarModal();
                    UIView.renderizarPagina('#/gestion');
                    this.asignarEventos('#/gestion');
                } else {
                    const errData = await res.json();
                    alert(errData.error || 'Error al guardar el curso en la base de datos.');
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Reintentar Guardado';
                }
            } catch (err) {
                alert('Error de conexión con el servidor.');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Reintentar Guardado';
            }
        });
    },

    activarEventosFormularioMision: function(misionExistente) {
        const cerrarModal = () => {
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.remove();
        };

        document.getElementById('btn-cerrar-modal-mision')?.addEventListener('click', cerrarModal);

        document.getElementById('form-gestionar-mision')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const esEdicion = misionExistente !== null;
            const idMision = esEdicion ? misionExistente.id_mision : null;
            const token = sessionStorage.getItem('neuroshield_token');

            const pistas_forenses = document.getElementById('gm-pistas').value
                .split('\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);

            const datosMision = {
                titulo: document.getElementById('gm-titulo').value.trim(),
                vector: document.getElementById('gm-vector').value,
                dificultad: document.getElementById('gm-dificultad').value,
                tiempo_limite: parseInt(document.getElementById('gm-tiempo').value, 10) || 120,
                descripcion_corta: document.getElementById('gm-descripcion').value.trim(),
                remitente_nombre: document.getElementById('gm-remitente-nombre').value.trim(),
                remitente_identificador: document.getElementById('gm-remitente-id').value.trim(),
                asunto_o_contexto: document.getElementById('gm-asunto').value.trim(),
                contenido_principal: document.getElementById('gm-contenido').value.trim(),
                texto_boton_trampa: document.getElementById('gm-boton').value.trim(),
                url_trampa: document.getElementById('gm-url').value.trim(),
                pistas_forenses: pistas_forenses
            };

            const btnSubmit = document.getElementById('btn-submit-mision');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

            try {
                const url = esEdicion ? `http://localhost:3000/api/misiones/${idMision}` : 'http://localhost:3000/api/misiones';
                const metodo = esEdicion ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: metodo,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(datosMision)
                });

                if (res.ok) {
                    await AppModel.sincronizarMisionesDesdeBD();
                    cerrarModal();
                    UIView.renderizarPagina('#/gestion');
                    this.asignarEventos('#/gestion');
                } else {
                    const errData = await res.json();
                    alert(errData.error || 'No se pudo guardar el simulador.');
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Reintentar';
                }
            } catch (err) {
                alert('Error de conexión con el servidor.');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Reintentar';
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

                if (porcentaje >= 60) {
                    if (!AppModel.estadoUsuario.progresoCursos) {
                        AppModel.estadoUsuario.progresoCursos = {};
                    }
                    AppModel.estadoUsuario.progresoCursos[curso.id_curso] = {
                        completado: true,
                        puntaje_quiz: porcentaje
                    };
                    const badgeLogros = document.getElementById('badge-estado-logros');
                    if (badgeLogros) {
                        badgeLogros.style.background = 'var(--cisco-green-bg)';
                        badgeLogros.style.color = '#2b5917';
                        badgeLogros.innerHTML = `<i class="fa-solid fa-circle-check"></i> Desbloqueados (${porcentaje}%)`;
                    }
                    const textoLogros = document.getElementById('texto-estado-logros');
                    if (textoLogros) {
                        textoLogros.innerText = '¡Felicidades! Has aprobado el examen y desbloqueado las insignias de este módulo:';
                    }
                    document.querySelectorAll('#contenedor-medallas-curso .cisco-achievement-badge').forEach(medalla => {
                        medalla.style.border = '2px solid var(--cisco-green)';
                        medalla.style.background = 'var(--cisco-green-bg)';
                        medalla.style.color = '#2b5917';
                        medalla.style.opacity = '1';
                    });
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
                    progresoCursos: {},
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

            const linkAprendizaje = e.target.closest('a[href="#/aprendizaje"]');
            if (linkAprendizaje) {
                AprendizajePage.cursoSeleccionadoId = null;
                if (window.location.hash === '#/aprendizaje') {
                    UIView.renderizarPagina('#/aprendizaje');
                    this.asignarEventos('#/aprendizaje');
                }
                return;
            }

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

        // === 1. PERFIL DEL USUARIO (#/perfil) ===
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

        // === 2. LOGIN (#/login) ===
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

                    await AppModel.sincronizarCursosDesdeBD();
                    sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
                    window.location.hash = '#/dashboard';
                } catch (error) {
                    mostrarError('Error de conexión. Verifica que el servidor backend esté encendido.');
                }
            });

        // === 3. REGISTRO (#/registro) ===
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

                    await AppModel.sincronizarCursosDesdeBD();
                    sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
                    window.location.hash = '#/dashboard';
                } catch (error) {
                    mostrarError('Error de conexión con el servidor.');
                }
            });

        // === 4. CENTRO DE SIMULADORES EN 4 RECUADROS (#/misiones) ===
        } else if (rutaActual === '#/misiones') {
            document.querySelectorAll('.select-ejemplo-vector').forEach(select => {
                select.addEventListener('change', (e) => {
                    const idElegido = e.target.value;
                    const vector = e.target.getAttribute('data-vector');
                    const mision = AppModel.catalogoMisiones.find(m => String(m.id_mision) === String(idElegido));
                    const cajaPreview = document.getElementById(`preview-vector-${vector.replace(/\s+/g, '')}`);
                    if (mision && cajaPreview) {
                        const spanTexto = cajaPreview.querySelector('.preview-desc-texto');
                        if (spanTexto) spanTexto.innerText = mision.descripcion_corta;
                    }
                });
            });

            document.querySelectorAll('.btn-practicar-seleccionado').forEach(btn => {
                btn.addEventListener('click', () => {
                    const vector = btn.getAttribute('data-vector');
                    const selectCaso = document.querySelector(`.select-ejemplo-vector[data-vector="${vector}"]`);
                    const selectModo = document.querySelector(`.select-modo-vector[data-vector="${vector}"]`);
                    if (selectCaso && selectCaso.value) {
                        AppModel.misionActivaId = parseInt(selectCaso.value, 10);
                        SimuladorPage.modoActivo = selectModo ? selectModo.value : 'reaccion';
                        window.location.hash = '#/simulador';
                    }
                });
            });

            document.querySelectorAll('.btn-azar-vector').forEach(btn => {
                btn.addEventListener('click', () => {
                    const vector = btn.getAttribute('data-vector');
                    const ejemplos = AppModel.catalogoMisiones.filter(m => m.vector === vector);
                    const modos = ['reaccion', 'redflags', 'urlinspector', 'dialogo', 'protocolo'];
                    if (ejemplos.length > 0) {
                        const azarCaso = ejemplos[Math.floor(Math.random() * ejemplos.length)];
                        AppModel.misionActivaId = azarCaso.id_mision;
                        SimuladorPage.modoActivo = modos[Math.floor(Math.random() * modos.length)];
                        window.location.hash = '#/simulador';
                    }
                });
            });

            document.getElementById('btn-mision-aleatoria')?.addEventListener('click', () => {
                const todas = AppModel.catalogoMisiones || [];
                const modos = ['reaccion', 'redflags', 'urlinspector', 'dialogo', 'protocolo'];
                if (todas.length > 0) {
                    const azar = todas[Math.floor(Math.random() * todas.length)];
                    AppModel.misionActivaId = azar.id_mision;
                    SimuladorPage.modoActivo = modos[Math.floor(Math.random() * modos.length)];
                    window.location.hash = '#/simulador';
                }
            });

        // === 5. SIMULADOR PRÁCTICO CON 5 DINÁMICAS E INTERFAZ REALISTA (#/simulador) ===
        } else if (rutaActual === '#/simulador') {
            document.querySelectorAll('.btn-cambiar-modo-sim').forEach(btn => {
                btn.addEventListener('click', () => {
                    SimuladorPage.modoActivo = btn.getAttribute('data-modo');
                    UIView.renderizarPagina('#/simulador');
                    this.asignarEventos('#/simulador');
                });
            });

            // Síntesis de voz realista para Vishing
            document.getElementById('btn-reproducir-vishing')?.addEventListener('click', () => {
                const mision = AppModel.catalogoMisiones.find(m => String(m.id_mision) === String(AppModel.misionActivaId));
                if (mision && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const locucion = new SpeechSynthesisUtterance(mision.contenido_principal);
                    locucion.lang = 'es-CO';
                    locucion.rate = 1.02;
                    window.speechSynthesis.speak(locucion);
                }
            });

            // Sincronización visual en Modo 2 (Cazador de Red Flags): clic en el mensaje <-> checkbox inferior
            const actualizarContadorRedFlags = () => {
                const marcados = document.querySelectorAll('.chk-redflag:checked').length;
                const badge = document.getElementById('contador-redflags-vivo');
                if (badge) badge.innerText = `${marcados} / 3 fallos marcados`;

                document.querySelectorAll('.zona-redflag-clicable').forEach(zona => {
                    const idx = zona.getAttribute('data-flag-index');
                    const chk = document.querySelector(`.chk-redflag[data-flag-index="${idx}"]`);
                    if (chk && chk.checked) {
                        zona.style.outline = '2px solid #ef4444';
                        zona.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                    } else {
                        zona.style.outline = 'none';
                        zona.style.backgroundColor = '';
                    }
                });
            };

            if (SimuladorPage.modoActivo === 'redflags') {
                document.querySelectorAll('.zona-redflag-clicable').forEach(zona => {
                    zona.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const idx = zona.getAttribute('data-flag-index');
                        const chk = document.querySelector(`.chk-redflag[data-flag-index="${idx}"]`);
                        if (chk) {
                            chk.checked = !chk.checked;
                            actualizarContadorRedFlags();
                        }
                    });
                });

                document.querySelectorAll('.chk-redflag').forEach(chk => {
                    chk.addEventListener('change', actualizarContadorRedFlags);
                });
            }

            // Dinámica 1: Reacción Táctica
            document.getElementById('btn-caer')?.addEventListener('click', () => this.procesarSimulacion('caer'));
            document.getElementById('btn-trampa-interna')?.addEventListener('click', () => {
                if (SimuladorPage.modoActivo !== 'redflags') {
                    this.procesarSimulacion('caer');
                }
            });
            document.getElementById('btn-ignorar')?.addEventListener('click', () => this.procesarSimulacion('ignorar'));
            document.getElementById('btn-reportar')?.addEventListener('click', () => this.procesarSimulacion('reportar'));

            // Dinámica 2: Cazador de Red Flags
            document.getElementById('btn-evaluar-redflags')?.addEventListener('click', () => {
                const checks = document.querySelectorAll('.chk-redflag');
                let fallosDetectados = 0;
                let falsosPositivos = 0;

                checks.forEach(chk => {
                    const esFalloReal = chk.getAttribute('data-es-fallo') === 'true';
                    if (chk.checked && esFalloReal) fallosDetectados++;
                    if (chk.checked && !esFalloReal) falsosPositivos++;
                });

                if (fallosDetectados === 3 && falsosPositivos === 0) {
                    this.procesarSimulacion('reportar');
                } else if (fallosDetectados >= 2 && falsosPositivos <= 1) {
                    this.procesarSimulacion('ignorar');
                } else {
                    this.procesarSimulacion('caer');
                }
            });

            // Dinámica 3: Auditoría Forense de URLs y Cabeceras
            document.getElementById('btn-evaluar-url')?.addEventListener('click', () => {
                const r1 = document.getElementById('url-audit-1')?.value;
                const r2 = document.getElementById('url-audit-2')?.value;
                if (!r1 || !r2) return alert('Por favor responde ambas preguntas de auditoría técnica.');

                if (r1 === 'correcto' && r2 === 'correcto') {
                    this.procesarSimulacion('reportar');
                } else if (r1 === 'correcto' || r2 === 'correcto') {
                    this.procesarSimulacion('ignorar');
                } else {
                    this.procesarSimulacion('caer');
                }
            });

            // Dinámica 4: Escudo de Diálogo
            document.getElementById('btn-evaluar-dialogo')?.addEventListener('click', () => {
                const seleccionado = document.querySelector('input[name="radio_dialogo_sim"]:checked');
                if (!seleccionado) return alert('Selecciona una opción de respuesta para continuar.');
                this.procesarSimulacion(seleccionado.value);
            });

            // Dinámica 5: Protocolo SOC
            document.getElementById('btn-evaluar-protocolo')?.addEventListener('click', () => {
                const selects = document.querySelectorAll('.soc-step-select');
                let correctos = 0;
                selects.forEach(s => {
                    if (s.value === s.getAttribute('data-correct-order')) correctos++;
                });

                if (correctos === 4) {
                    this.procesarSimulacion('reportar');
                } else if (correctos >= 2) {
                    this.procesarSimulacion('ignorar');
                } else {
                    this.procesarSimulacion('caer');
                }
            });

        // === 6. PANEL DE GESTIÓN ADMINISTRATIVA (#/gestion) ===
        } else if (rutaActual === '#/gestion') {
            const token = sessionStorage.getItem('neuroshield_token');
            const authHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            document.querySelectorAll('.btn-tab-admin').forEach(btn => {
                btn.addEventListener('click', () => {
                    GestionPage.tabActiva = btn.getAttribute('data-tab');
                    UIView.renderizarPagina('#/gestion');
                    this.asignarEventos('#/gestion');
                });
            });

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
                            const res = await fetch(`http://localhost:3000/api/cursos/${id}`, {
                                method: 'DELETE',
                                headers: authHeaders
                            });
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

            document.getElementById('btn-nueva-mision')?.addEventListener('click', () => {
                document.body.insertAdjacentHTML('beforeend', TutorialComponent.renderFormularioMision(null));
                this.activarEventosFormularioMision(null);
            });

            document.querySelectorAll('.btn-editar-mision').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-mision-id');
                    const mision = AppModel.catalogoMisiones.find(m => String(m.id_mision) === String(id));
                    if (mision) {
                        document.body.insertAdjacentHTML('beforeend', TutorialComponent.renderFormularioMision(mision));
                        this.activarEventosFormularioMision(mision);
                    }
                });
            });

            document.querySelectorAll('.btn-eliminar-mision').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const id = btn.getAttribute('data-mision-id');
                    if (confirm('¿Estás seguro de eliminar este escenario de simulación?')) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/misiones/${id}`, {
                                method: 'DELETE',
                                headers: authHeaders
                            });
                            if (res.ok) {
                                await AppModel.sincronizarMisionesDesdeBD();
                                UIView.renderizarPagina('#/gestion');
                                this.asignarEventos('#/gestion');
                            }
                        } catch (err) {
                            alert('Error al eliminar el simulador.');
                        }
                    }
                });
            });

            document.querySelectorAll('.btn-guardar-usuario-admin').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.getAttribute('data-user-id');
                    const selectRol = document.querySelector(`.select-rol-usuario[data-user-id="${userId}"]`);
                    const selectGrupo = document.querySelector(`.select-grupo-usuario[data-user-id="${userId}"]`);

                    const nuevoRol = selectRol ? selectRol.value : 'Estudiante';
                    const nuevoGrupo = selectGrupo ? selectGrupo.value : null;

                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

                    try {
                        const res = await fetch(`http://localhost:3000/api/admin/usuarios/${userId}`, {
                            method: 'PUT',
                            headers: authHeaders,
                            body: JSON.stringify({ rol: nuevoRol, id_grupo: nuevoGrupo })
                        });
                        if (res.ok) {
                            if (String(userId) === String(AppModel.estadoUsuario.id)) {
                                AppModel.estadoUsuario.rol = nuevoRol;
                                sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));
                            }
                            await AppModel.sincronizarDatosAdminDesdeBD();
                            UIView.renderizarPagina('#/gestion');
                            this.asignarEventos('#/gestion');
                        } else {
                            const errData = await res.json();
                            alert(errData.error || 'Error al actualizar el usuario.');
                        }
                    } catch (err) {
                        alert('Error de conexión al actualizar usuario.');
                    }
                });
            });

            document.getElementById('form-crear-grupo')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nombre_grupo = document.getElementById('grupo-nombre').value.trim();
                const descripcion = document.getElementById('grupo-desc').value.trim();

                try {
                    const res = await fetch('http://localhost:3000/api/admin/grupos', {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({ nombre_grupo, descripcion })
                    });
                    if (res.ok) {
                        await AppModel.sincronizarDatosAdminDesdeBD();
                        UIView.renderizarPagina('#/gestion');
                        this.asignarEventos('#/gestion');
                    } else {
                        const errData = await res.json();
                        alert(errData.error || 'No se pudo crear el grupo.');
                    }
                } catch (err) {
                    alert('Error de conexión al crear el grupo.');
                }
            });

            document.querySelectorAll('.btn-eliminar-grupo').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const idGrupo = btn.getAttribute('data-grupo-id');
                    if (confirm('¿Eliminar este grupo? Los usuarios asignados no se borrarán, solo quedarán sin grupo.')) {
                        try {
                            const res = await fetch(`http://localhost:3000/api/admin/grupos/${idGrupo}`, {
                                method: 'DELETE',
                                headers: authHeaders
                            });
                            if (res.ok) {
                                await AppModel.sincronizarDatosAdminDesdeBD();
                                UIView.renderizarPagina('#/gestion');
                                this.asignarEventos('#/gestion');
                            }
                        } catch (err) {
                            alert('Error al eliminar el grupo.');
                        }
                    }
                });
            });
        }
    },

    procesarSimulacion: function(accion) {
        this.detenerTimer();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        const loader = document.getElementById('ai-loader');
        if(loader) loader.classList.remove('hidden');

        setTimeout(async () => {
            if(loader) loader.classList.add('hidden');
            
            const resultado = AppModel.calcularNuevoRiesgo(accion);
            sessionStorage.setItem('neuroshield_usuario', JSON.stringify(AppModel.estadoUsuario));

            if (AppModel.estadoUsuario.id) {
                try {
                    await fetch(`http://localhost:3000/api/misiones/${resultado.misionId}/evaluar`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_usuario: AppModel.estadoUsuario.id,
                            decision: accion,
                            impacto_riesgo: resultado.impacto,
                            nuevo_riesgo_global: resultado.nuevoRiesgo
                        })
                    });
                } catch (e) {
                    console.error('Error guardando simulación en BD:', e);
                }
            }

            window.location.hash = '#/resultados';
            
            setTimeout(() => {
                UIView.imprimirTerminal(resultado.logs);
            }, 50);
            
        }, 1200);
    },

    iniciarTimer: function(segundosIniciales = 120) {
        let tiempo = segundosIniciales;
        this.detenerTimer();
        const display = document.getElementById('time-display');
        if(display) display.innerText = `Quedan ${tiempo}s`;
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
    }
};

document.addEventListener('DOMContentLoaded', () => {
    AppController.init();
});