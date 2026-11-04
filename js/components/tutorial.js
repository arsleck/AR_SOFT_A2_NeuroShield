const TutorialComponent = {
    // 1. Cuestionario Diagnóstico Inicial para nuevos usuarios
    render: function() {
        const preguntasHTML = AppModel.preguntasDiagnostico.map((p, index) => `
            <div class="quiz-question-block">
                <div class="quiz-topic-badge">
                    <i class="fa-solid fa-circle-question"></i> Pregunta ${index + 1} • ${p.tema}
                </div>
                <p class="quiz-question-title">${p.pregunta}</p>
                <div class="quiz-options">
                    ${p.opciones.map((op, opIndex) => `
                        <label class="quiz-option-label">
                            <input type="radio" name="${p.vector}" value="${op.puntosRiesgo}" ${opIndex === 0 ? 'required' : ''}>
                            <span>${op.texto}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        return `
        <div id="tutorial-overlay" class="tutorial-backdrop">
            <div class="quiz-modal">
                <div class="quiz-modal-header">
                    <div>
                        <span class="badge-pill"><i class="fa-solid fa-clipboard-list"></i> Diagnóstico Inicial</span>
                        <h2>Evaluación Rápida de Conocimientos</h2>
                        <p class="text-muted">Responde estas 4 situaciones para calcular tu estado de seguridad por tipo de ataque y personalizar tus recomendaciones.</p>
                    </div>
                    <button type="button" id="btn-saltar-diagnostico" class="icon-btn" title="Cerrar">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form id="form-diagnostico" class="quiz-modal-body">
                    ${preguntasHTML}
                    <div class="quiz-modal-footer">
                        <button type="submit" class="btn-cisco-primary">
                            <i class="fa-solid fa-chart-simple"></i> Calcular mi estado de seguridad
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
    },

    // 2. Plantilla HTML para un bloque de Módulo Multimedia (Pre o Post Quiz)
    renderItemMaterial: function(mat = {}, index = 0) {
        const titulo = mat.titulo || '';
        const tipo = mat.tipo_recurso || 'imagen';
        const url = mat.archivo_url || '';
        const mime = mat.mime_type || '';
        const texto = mat.contenido_texto || '';
        const esPost = Boolean(mat.es_post_quiz);

        return `
        <div class="curso-material-item" data-index="${index}" style="background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--cisco-green); border-radius: 8px; padding: 1.15rem; margin-bottom: 0.9rem;">
            <div class="flex-between mb-2">
                <strong style="font-size: 0.88rem; color: var(--cisco-dark);">
                    <i class="fa-solid fa-photo-film text-primary me-1"></i> Módulo de Apoyo / Multimedia
                </strong>
                <button type="button" class="btn btn-danger btn-quitar-material" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
                    <i class="fa-solid fa-trash"></i> Quitar módulo
                </button>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 0.75rem;" class="mb-2">
                <div class="form-group mb-0">
                    <label>Título del Módulo</label>
                    <input type="text" class="form-input mat-titulo" value="${titulo}" placeholder="Ej: Análisis de cabecera de correo" required>
                </div>
                <div class="form-group mb-0">
                    <label>Tipo de Recurso</label>
                    <select class="form-input mat-tipo">
                        <option value="imagen" ${tipo === 'imagen' ? 'selected' : ''}>Imagen / Infografía</option>
                        <option value="video" ${tipo === 'video' ? 'selected' : ''}>Video (MP4 / WebM)</option>
                        <option value="audio" ${tipo === 'audio' ? 'selected' : ''}>Audio / Llamada (MP3 / WAV)</option>
                        <option value="documento" ${tipo === 'documento' ? 'selected' : ''}>Documento / PDF</option>
                        <option value="lectura" ${tipo === 'lectura' ? 'selected' : ''}>Solo Lectura de Texto</option>
                    </select>
                </div>
                <div class="form-group mb-0">
                    <label>Ubicación en el Curso</label>
                    <select class="form-input mat-postquiz">
                        <option value="false" ${!esPost ? 'selected' : ''}>Antes del Examen (Teoría)</option>
                        <option value="true" ${esPost ? 'selected' : ''}>Después del Examen (Refuerzo)</option>
                    </select>
                </div>
            </div>

            <div class="form-group mb-2">
                <label>Archivo Multimedia (Pega una URL o sube un archivo desde tu PC)</label>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" class="form-input mat-url" value="${url}" placeholder="https://... o sube un archivo con el botón derecho">
                    <input type="hidden" class="mat-mime" value="${mime}">
                    <label class="btn" style="margin: 0; white-space: nowrap; cursor: pointer; background: var(--primary-bg); color: #2b5917; border-color: var(--cisco-green);">
                        <i class="fa-solid fa-upload"></i> Subir Archivo
                        <input type="file" class="input-upload-material" accept="image/*,video/*,audio/*,.pdf" style="display: none;">
                    </label>
                </div>
            </div>

            <div class="form-group mb-0">
                <label>Explicación o Transcripción del Módulo</label>
                <textarea class="form-input mat-texto" rows="2" placeholder="Describe lo que el estudiante debe observar o analizar en este módulo...">${texto}</textarea>
            </div>
        </div>
        `;
    },

    // 3. Plantilla HTML para un bloque de Pregunta de Quiz
    renderItemQuiz: function(quiz = {}, index = 0) {
        const pregunta = quiz.pregunta || '';
        const explicacion = quiz.explicacion || '';
        const recursoUrl = quiz.recurso_apoyo_url || '';
        const tipoRecurso = quiz.tipo_recurso_apoyo || '';

        let opciones = [];
        try {
            opciones = Array.isArray(quiz.opciones) ? quiz.opciones : JSON.parse(quiz.opciones || '[]');
        } catch (e) {
            opciones = [];
        }

        const op0 = opciones[0]?.texto || '';
        const op1 = opciones[1]?.texto || '';
        const op2 = opciones[2]?.texto || '';

        let indiceCorrecta = 0;
        if (opciones[1]?.es_correcta) indiceCorrecta = 1;
        else if (opciones[2]?.es_correcta) indiceCorrecta = 2;

        const radioGroupName = `correcta_quiz_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`;

        return `
        <div class="curso-quiz-item" data-index="${index}" style="background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--secondary); border-radius: 8px; padding: 1.15rem; margin-bottom: 0.9rem;">
            <div class="flex-between mb-2">
                <strong style="font-size: 0.88rem; color: var(--cisco-dark);">
                    <i class="fa-solid fa-clipboard-question text-primary me-1"></i> Pregunta de Evaluación (Quiz)
                </strong>
                <button type="button" class="btn btn-danger btn-quitar-quiz" style="padding: 0.3rem 0.65rem; font-size: 0.75rem;">
                    <i class="fa-solid fa-trash"></i> Quitar pregunta
                </button>
            </div>

            <div class="form-group mb-2">
                <label>Enunciado de la Pregunta</label>
                <textarea class="form-input quiz-pregunta" rows="2" placeholder="Escribe la situación o pregunta para el estudiante..." required>${pregunta}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.75rem;" class="mb-2">
                <div class="form-group mb-0">
                    <label>Multimedia en la pregunta (Opcional)</label>
                    <select class="form-input quiz-tipo-apoyo">
                        <option value="" ${!tipoRecurso ? 'selected' : ''}>Sin archivo adjunto</option>
                        <option value="imagen" ${tipoRecurso === 'imagen' ? 'selected' : ''}>Imagen</option>
                        <option value="audio" ${tipoRecurso === 'audio' ? 'selected' : ''}>Audio</option>
                        <option value="video" ${tipoRecurso === 'video' ? 'selected' : ''}>Video</option>
                    </select>
                </div>
                <div class="form-group mb-0">
                    <label>URL o Subida de Archivo para la Pregunta</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" class="form-input quiz-url-apoyo" value="${recursoUrl}" placeholder="Opcional: URL o sube imagen/audio del caso">
                        <label class="btn" style="margin: 0; white-space: nowrap; cursor: pointer;">
                            <i class="fa-solid fa-upload"></i> Subir
                            <input type="file" class="input-upload-quiz" accept="image/*,video/*,audio/*" style="display: none;">
                        </label>
                    </div>
                </div>
            </div>

            <div class="form-group mb-2">
                <label>Opciones de Respuesta (Marca con el círculo cuál es la opción CORRECTA)</label>
                <div style="display: grid; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <input type="radio" name="${radioGroupName}" class="quiz-radio-correcta" value="0" ${indiceCorrecta === 0 ? 'checked' : ''}>
                        <input type="text" class="form-input quiz-op-0" value="${op0}" placeholder="Opción A" required>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <input type="radio" name="${radioGroupName}" class="quiz-radio-correcta" value="1" ${indiceCorrecta === 1 ? 'checked' : ''}>
                        <input type="text" class="form-input quiz-op-1" value="${op1}" placeholder="Opción B" required>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <input type="radio" name="${radioGroupName}" class="quiz-radio-correcta" value="2" ${indiceCorrecta === 2 ? 'checked' : ''}>
                        <input type="text" class="form-input quiz-op-2" value="${op2}" placeholder="Opción C" required>
                    </div>
                </div>
            </div>

            <div class="form-group mb-0">
                <label>Explicación / Retroalimentación (Se muestra al calificar el examen)</label>
                <input type="text" class="form-input quiz-explicacion" value="${explicacion}" placeholder="Explica por qué esa es la respuesta correcta..." required>
            </div>
        </div>
        `;
    },

    // 4. Modal Completo del Constructor de Cursos (Admin e IA)
    renderFormularioCurso: function(curso = null) {
        const esEdicion = curso !== null;
        const materiales = esEdicion && Array.isArray(curso.materiales) ? curso.materiales : [];
        const quizzes = esEdicion && Array.isArray(curso.quizzes) ? curso.quizzes : [];
        const senales = esEdicion && Array.isArray(curso.senales_alerta)
            ? curso.senales_alerta.join('\n')
            : 'El dominio del remitente no coincide con la entidad oficial.\nSentido de urgencia extrema para presionar una acción rápida.\nEnlaces acortados o que dirigen a sitios externos desconocidos.';

        return `
        <div id="tutorial-overlay" class="tutorial-backdrop">
            <div class="quiz-modal" style="max-width: 920px; max-height: 92vh;">
                <div class="quiz-modal-header">
                    <div>
                        <span class="badge-pill">
                            <i class="fa-solid fa-pen-nib"></i> ${esEdicion ? 'Editando Curso #' + curso.id_curso : 'Nuevo Curso Interactivo'}
                        </span>
                        <h2>${esEdicion ? curso.titulo : 'Constructor Completo de Cursos'}</h2>
                        <p class="text-muted">Personaliza la portada, tiempo de duración, teoría, módulos multimedia (fotos, videos, audios) y preguntas de evaluación.</p>
                    </div>
                    <button type="button" id="btn-cerrar-modal-curso" class="icon-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <form id="form-gestionar-curso" data-curso-id="${esEdicion ? curso.id_curso : ''}" class="quiz-modal-body" style="gap: 1.5rem;">
                    
                    <!-- SECCIÓN 1: METADATOS, TIEMPO E IMAGEN DE PORTADA -->
                    <div class="course-lesson-block">
                        <h4 class="mb-3"><i class="fa-solid fa-sliders text-primary"></i> 1. Configuración General e Imagen de Portada</h4>
                        
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;" class="mb-2">
                            <div class="form-group mb-0">
                                <label>Título del Curso</label>
                                <input type="text" id="gc-titulo" class="form-input" value="${esEdicion ? curso.titulo : ''}" placeholder="Ej: Detección de Phishing Bancario" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>Vector / Categoría</label>
                                <select id="gc-categoria" class="form-input">
                                    <option value="Phishing" ${esEdicion && curso.categoria === 'Phishing' ? 'selected' : ''}>Phishing (Correo)</option>
                                    <option value="Smishing" ${esEdicion && curso.categoria === 'Smishing' ? 'selected' : ''}>Smishing (SMS)</option>
                                    <option value="Vishing" ${esEdicion && curso.categoria === 'Vishing' ? 'selected' : ''}>Vishing (Llamadas)</option>
                                    <option value="Ing. Social" ${esEdicion && curso.categoria === 'Ing. Social' ? 'selected' : ''}>Ingeniería Social</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;" class="mb-2">
                            <div class="form-group mb-0">
                                <label>Nivel de Dificultad</label>
                                <select id="gc-nivel" class="form-input">
                                    <option value="Básico" ${esEdicion && curso.nivel === 'Básico' ? 'selected' : ''}>Básico</option>
                                    <option value="Intermedio" ${esEdicion && curso.nivel === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                                    <option value="Avanzado" ${esEdicion && curso.nivel === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
                                </select>
                            </div>
                            <div class="form-group mb-0">
                                <label>Tiempo de Duración</label>
                                <input type="text" id="gc-duracion" class="form-input" value="${esEdicion ? curso.duracion : '6 min'}" placeholder="Ej: 6 min o 2 horas" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>Icono del Curso</label>
                                <select id="gc-icono" class="form-input">
                                    <option value="fa-envelope-open-text" ${esEdicion && curso.icono === 'fa-envelope-open-text' ? 'selected' : ''}>Correo (Phishing)</option>
                                    <option value="fa-comment-sms" ${esEdicion && curso.icono === 'fa-comment-sms' ? 'selected' : ''}>Mensaje SMS (Smishing)</option>
                                    <option value="fa-phone-volume" ${esEdicion && curso.icono === 'fa-phone-volume' ? 'selected' : ''}>Teléfono (Vishing)</option>
                                    <option value="fa-user-shield" ${esEdicion && curso.icono === 'fa-user-shield' ? 'selected' : ''}>Escudo Usuario (Ing. Social)</option>
                                    <option value="fa-shield-halved" ${esEdicion && curso.icono === 'fa-shield-halved' ? 'selected' : ''}>Escudo General</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group mb-0">
                            <label>Imagen de Portada del Curso (Pega una URL o sube una foto desde tu PC)</label>
                            <div style="display: flex; gap: 0.6rem; align-items: center;">
                                <input type="text" id="gc-portada" class="form-input" value="${esEdicion && curso.portada_url ? curso.portada_url : ''}" placeholder="https://... (Si lo dejas vacío se usará la portada por defecto de la categoría)">
                                <label class="btn-cisco-outline" style="margin: 0; padding: 0.65rem 1.1rem; white-space: nowrap; cursor: pointer; font-size: 0.85rem;">
                                    <i class="fa-solid fa-image"></i> Subir Portada
                                    <input type="file" id="input-upload-portada" accept="image/*" style="display: none;">
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- SECCIÓN 2: CONTENIDO TEÓRICO BASE Y SEÑALES DE ALERTA -->
                    <div class="course-lesson-block">
                        <h4 class="mb-3"><i class="fa-solid fa-book-open text-primary"></i> 2. Contenido Teórico Principal</h4>
                        
                        <div class="form-group mb-2">
                            <label>Resumen Ejecutivo (Aparece en la tarjeta del catálogo y en el banner)</label>
                            <textarea id="gc-resumen" class="form-input" rows="2" required>${esEdicion ? curso.resumen : ''}</textarea>
                        </div>

                        <div class="form-group mb-2">
                            <label>Módulo 1: ¿Cómo opera el engaño? (Mecánica detallada del ataque)</label>
                            <textarea id="gc-comofunciona" class="form-input" rows="3" required>${esEdicion ? curso.como_funciona : ''}</textarea>
                        </div>

                        <div class="form-group mb-2">
                            <label>Módulo 2: Señales de Alerta (Escribe una señal por cada línea)</label>
                            <textarea id="gc-senales" class="form-input" rows="3" required>${senales}</textarea>
                        </div>

                        <div class="form-group mb-0">
                            <label>Regla de Oro / Protocolo de Prevención</label>
                            <textarea id="gc-prevencion" class="form-input" rows="2" required>${esEdicion ? curso.prevencion : ''}</textarea>
                        </div>
                    </div>

                    <!-- SECCIÓN 3: MÓDULOS MULTIMEDIA DINÁMICOS (CANTIDAD ILIMITADA) -->
                    <div class="course-lesson-block">
                        <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
                            <div>
                                <h4 class="mb-0"><i class="fa-solid fa-photo-film text-primary"></i> 3. Módulos Multimedia y Material de Apoyo</h4>
                                <p class="text-muted" style="font-size: 0.82rem;">Agrega tantos módulos con fotos, videos, audios o lecturas como necesites.</p>
                            </div>
                            <button type="button" id="btn-agregar-material" class="btn-cisco-outline" style="padding: 0.5rem 1rem; font-size: 0.82rem;">
                                <i class="fa-solid fa-plus"></i> Añadir Módulo Multimedia
                            </button>
                        </div>

                        <div id="contenedor-materiales-curso">
                            ${materiales.map((m, idx) => this.renderItemMaterial(m, idx)).join('')}
                        </div>
                    </div>

                    <!-- SECCIÓN 4: PREGUNTAS DE QUIZ DINÁMICAS (CANTIDAD ILIMITADA) -->
                    <div class="course-lesson-block">
                        <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
                            <div>
                                <h4 class="mb-0"><i class="fa-solid fa-list-check text-primary"></i> 4. Examen del Curso (Quizzes)</h4>
                                <p class="text-muted" style="font-size: 0.82rem;">Añade todas las preguntas de opción múltiple que conformarán el examen final.</p>
                            </div>
                            <button type="button" id="btn-agregar-quiz" class="btn-cisco-outline" style="padding: 0.5rem 1rem; font-size: 0.82rem;">
                                <i class="fa-solid fa-plus"></i> Añadir Pregunta de Quiz
                            </button>
                        </div>

                        <div id="contenedor-quizzes-curso">
                            ${quizzes.map((q, idx) => this.renderItemQuiz(q, idx)).join('')}
                        </div>
                    </div>

                    <div class="quiz-modal-footer" style="border-top: 1px solid var(--border); padding-top: 1rem;">
                        <button type="submit" id="btn-submit-curso-completo" class="btn-cisco-primary w-100" style="justify-content: center; font-size: 1rem;">
                            <i class="fa-solid fa-floppy-disk"></i> ${esEdicion ? 'Guardar Todos los Cambios del Curso' : 'Publicar Nuevo Curso Completo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
    },
    
    // 5. Modal Constructor / Editor de Escenarios de Simulación (Phishing, Smishing, Vishing, Ing. Social)
    renderFormularioMision: function(mision = null) {
        const esEdicion = mision !== null;
        const pistas = esEdicion && Array.isArray(mision.pistas_forenses)
            ? mision.pistas_forenses.join('\n')
            : 'El remitente no pertenece al dominio o línea oficial de la entidad.\nEl enlace redirige a un servidor externo no autorizado.\nUtiliza sentido de urgencia extrema para impedir que el usuario verifique.';

        return `
        <div id="tutorial-overlay" class="tutorial-backdrop">
            <div class="quiz-modal" style="max-width: 820px; max-height: 92vh;">
                <div class="quiz-modal-header">
                    <div>
                        <span class="badge-pill">
                            <i class="fa-solid fa-crosshairs"></i> ${esEdicion ? 'Editando Simulador #' + mision.id_mision : 'Nuevo Escenario de Simulación'}
                        </span>
                        <h2>${esEdicion ? mision.titulo : 'Constructor de Escenarios de Ataque'}</h2>
                        <p class="text-muted">Configura el vector, el remitente falso, el mensaje trampa y las pistas forenses que verá el estudiante.</p>
                    </div>
                    <button type="button" id="btn-cerrar-modal-mision" class="icon-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <form id="form-gestionar-mision" data-mision-id="${esEdicion ? mision.id_mision : ''}" class="quiz-modal-body" style="gap: 1.25rem;">
                    
                    <div class="course-lesson-block">
                        <h4 class="mb-2"><i class="fa-solid fa-sliders text-primary"></i> 1. Clasificación y Tiempo Límite</h4>
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.85rem;" class="mb-2">
                            <div class="form-group mb-0">
                                <label>Título del Escenario</label>
                                <input type="text" id="gm-titulo" class="form-input" value="${esEdicion ? mision.titulo : ''}" placeholder="Ej: Caso Phishing: Factura Electrónica DIAN" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>Tipo de Ataque (Cambia la interfaz del simulador)</label>
                                <select id="gm-vector" class="form-input">
                                    <option value="Phishing" ${esEdicion && mision.vector === 'Phishing' ? 'selected' : ''}>Phishing (Interfaz Correo)</option>
                                    <option value="Smishing" ${esEdicion && mision.vector === 'Smishing' ? 'selected' : ''}>Smishing (Interfaz Celular SMS)</option>
                                    <option value="Vishing" ${esEdicion && mision.vector === 'Vishing' ? 'selected' : ''}>Vishing (Interfaz Llamada con Voz)</option>
                                    <option value="Ing. Social" ${esEdicion && mision.vector === 'Ing. Social' ? 'selected' : ''}>Ing. Social (Interfaz Chat WhatsApp)</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 0.85rem;">
                            <div class="form-group mb-0">
                                <label>Dificultad</label>
                                <select id="gm-dificultad" class="form-input">
                                    <option value="Básico" ${esEdicion && mision.dificultad === 'Básico' ? 'selected' : ''}>Básico</option>
                                    <option value="Intermedio" ${esEdicion && mision.dificultad === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                                    <option value="Avanzado" ${esEdicion && mision.dificultad === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
                                </select>
                            </div>
                            <div class="form-group mb-0">
                                <label>Tiempo Límite (Segundos)</label>
                                <input type="number" id="gm-tiempo" class="form-input" value="${esEdicion ? mision.tiempo_limite : 120}" min="30" max="600" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>Descripción Corta (Visible en la tarjeta)</label>
                                <input type="text" id="gm-descripcion" class="form-input" value="${esEdicion ? mision.descripcion_corta : ''}" placeholder="Resumen breve del reto..." required>
                            </div>
                        </div>
                    </div>

                    <div class="course-lesson-block">
                        <h4 class="mb-2"><i class="fa-solid fa-envelope-open-text text-primary"></i> 2. Contenido del Engaño Simulado</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;" class="mb-2">
                            <div class="form-group mb-0">
                                <label>Nombre Visible del Remitente / Contacto</label>
                                <input type="text" id="gm-remitente-nombre" class="form-input" value="${esEdicion ? mision.remitente_nombre : ''}" placeholder="Ej: Soporte Bancario / División Cartera" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>Correo Falso o Número Telefónico Mostrado</label>
                                <input type="text" id="gm-remitente-id" class="form-input" value="${esEdicion ? mision.remitente_identificador : ''}" placeholder="Ej: alerta@banco-seguro.org o +57 315..." required>
                            </div>
                        </div>

                        <div class="form-group mb-2">
                            <label>Asunto del Correo / Contexto de la Llamada o SMS</label>
                            <input type="text" id="gm-asunto" class="form-input" value="${esEdicion ? mision.asunto_o_contexto : ''}" placeholder="Ej: URGENTE: Bloqueo preventivo de cuenta" required>
                        </div>

                        <div class="form-group mb-2">
                            <label>Mensaje Principal (Cuerpo del correo, texto del SMS o guion que leerá la voz en Vishing)</label>
                            <textarea id="gm-contenido" class="form-input" rows="3" required>${esEdicion ? mision.contenido_principal : ''}</textarea>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                            <div class="form-group mb-0">
                                <label>Texto del Botón o Acción Trampa</label>
                                <input type="text" id="gm-boton" class="form-input" value="${esEdicion ? mision.texto_boton_trampa : 'Validar Cuenta Ahora'}" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>URL Falsa / Destino Malicioso Mostrado</label>
                                <input type="text" id="gm-url" class="form-input" value="${esEdicion ? mision.url_trampa : 'http://185.220.101.42/login-falso'}" required>
                            </div>
                        </div>
                    </div>

                    <div class="course-lesson-block">
                        <h4 class="mb-2"><i class="fa-solid fa-fingerprint text-primary"></i> 3. Pistas Forenses (Explicación Post-Simulación)</h4>
                        <div class="form-group mb-0">
                            <label>Indicadores que revelaban el ataque (Escribe una pista por línea)</label>
                            <textarea id="gm-pistas" class="form-input" rows="3" required>${pistas}</textarea>
                        </div>
                    </div>

                    <div class="quiz-modal-footer">
                        <button type="submit" id="btn-submit-mision" class="btn-cisco-primary w-100" style="justify-content: center;">
                            <i class="fa-solid fa-floppy-disk"></i> ${esEdicion ? 'Guardar Cambios del Simulador' : 'Publicar Nuevo Escenario de Simulación'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
    }
};