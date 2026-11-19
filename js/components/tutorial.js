const TutorialComponent = {
    // 1. Cuestionario Diagnóstico Inicial
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

    // =========================================================================
    // EDITORES POR PASOS DEL ADMINISTRADOR (cursos y misiones)
    // =========================================================================

    // Escapa texto para insertarlo en atributos y áreas de texto
    esc: function(valor) {
        return String(valor ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },

    // Menú lateral de pasos
    renderPasosNav: function(pasos, ayuda) {
        return `
        <nav class="cv-editor-pasos" aria-label="Pasos del editor">
            <ol>
                ${pasos.map((p, i) => `
                    <li>
                        <button type="button" class="cv-paso-btn ${i === 0 ? 'cv-activo' : ''}" data-paso="${i + 1}" ${i === 0 ? 'aria-current="step"' : ''}>
                            <span class="cv-paso-num">${i + 1}</span>
                            <span class="cv-paso-texto">
                                <strong>${p.titulo}</strong>
                                <span class="cv-paso-sub" data-sub-paso="${i + 1}">${p.sub}</span>
                            </span>
                        </button>
                    </li>
                `).join('')}
            </ol>
            <div class="cv-editor-ayuda-lateral"><i class="fa-solid fa-circle-info"></i> ${ayuda}</div>
        </nav>`;
    },

    // Pie fijo con navegación entre pasos y botón de guardar
    renderPieEditor: function(totalPasos, idSubmit, textoSubmit) {
        return `
        <footer class="cv-editor-pie">
            <span class="cv-pie-estado">Paso <strong class="cv-paso-actual">1</strong> de ${totalPasos}</span>
            <div class="cv-pie-botones">
                <button type="button" class="cv-btn cv-btn-anterior" disabled><i class="fa-solid fa-chevron-left"></i> Anterior</button>
                <button type="button" class="cv-btn cv-btn-siguiente">Siguiente <i class="fa-solid fa-chevron-right"></i></button>
                <button type="submit" id="${idSubmit}" class="cv-btn cv-btn-primario"><i class="fa-solid fa-circle-check"></i> ${textoSubmit}</button>
            </div>
        </footer>`;
    },

    // Recuadro que explica por qué la IA propone el borrador
    renderRecuadroIA: function(sugerencia, tipo) {
        if (!sugerencia || !sugerencia.analisis_grupal) return '';
        const g = sugerencia.analisis_grupal;
        const b = sugerencia.borrador || {};
        const vector = tipo === 'mision' ? b.vector : b.categoria;
        const riesgo = g.riesgo_promedio_por_vector || {};
        const color = v => v >= 60 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#10b981';
        const niveles = g.usuarios_por_nivel || {};
        const nivel = tipo === 'mision' ? (b.dificultad_recomendada || b.dificultad) : b.nivel;
        const explicacionNivel = nivel === 'Básico'
            ? 'el riesgo es alto, así que conviene empezar por lo esencial'
            : nivel === 'Intermedio' ? 'el riesgo es moderado' : 'el riesgo ya es bajo, así que conviene un reto mayor';
        const puntos = [
            `Analizó <strong>${g.usuarios_analizados} estudiante(s)</strong> con historial: ${niveles.Alto || 0} en riesgo alto, ${niveles.Medio || 0} medio y ${niveles.Bajo || 0} bajo.`,
            `El vector con más riesgo es <strong>${vector}</strong> (${riesgo[vector] ?? '—'} % en promedio), por eso ${tipo === 'mision' ? 'la misión' : 'el curso'} se enfoca ahí.`,
            `Propone nivel <strong>${nivel}</strong> porque ${explicacionNivel}.`
        ];
        if (tipo === 'mision') {
            if (b.dificultad && b.dificultad_recomendada && b.dificultad !== b.dificultad_recomendada) {
                puntos.push(`Ya existe una misión ${b.dificultad_recomendada} de ese vector, así que propone una de nivel ${b.dificultad}.`);
            }
            const t = b.patron_tiempo || {};
            if (t.caidas_con_tiempo > 0) {
                puntos.push(`El ${Math.round((t.proporcion_prisa || 0) * 100)} % de las caídas registradas fueron respuestas apresuradas; el tiempo límite propuesto es ${b.tiempo_limite} s.`);
            }
        }
        return `
        <div class="cv-recuadro-ia">
            <h4><i class="fa-solid fa-brain"></i> ¿Por qué la IA propone ${tipo === 'mision' ? 'esta misión' : 'este curso'}?</h4>
            <ul>${puntos.map(p => `<li>${p}</li>`).join('')}</ul>
            <div class="cv-barras-ia">
                ${Object.entries(riesgo).map(([v, r]) => `
                    <div class="cv-barra-ia ${v === vector ? 'cv-destacada' : ''}">
                        <span>${v}<b>${r}%</b></span>
                        <div><i style="width: ${r}%; background: ${color(r)};"></i></div>
                    </div>`).join('')}
            </div>
            <p class="cv-nota-ia"><i class="fa-solid fa-pen-to-square"></i> Los textos salen de plantillas revisables: léelos y ajústalos antes de publicar.</p>
        </div>`;
    },

    // 2. Bloque repetible: módulo adicional del curso
    renderItemMaterial: function(mat = {}, index = 0) {
        const e = v => this.esc(v);
        const tipo = mat.tipo_recurso || 'lectura';
        const url = mat.archivo_url || '';
        const esPost = Boolean(mat.es_post_quiz);

        return `
        <div class="curso-material-item cv-bloque" data-index="${index}">
            <div class="cv-bloque-cabecera">
                <strong><span class="cv-bloque-num">${index + 3}</span> <span class="cv-bloque-titulo">Módulo ${index + 3}</span></strong>
                <button type="button" class="cv-btn cv-btn-icono cv-peligro btn-quitar-material" title="Eliminar módulo" aria-label="Eliminar módulo">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="cv-bloque-cuerpo">
                <div class="cv-fila-3">
                    <div class="cv-campo">
                        <label>Título del módulo</label>
                        <input type="text" class="form-input mat-titulo" value="${e(mat.titulo)}" placeholder="Ej: Caso de estudio: suplantación bancaria" required>
                    </div>
                    <div class="cv-campo">
                        <label>Formato</label>
                        <select class="form-input mat-tipo">
                            <option value="lectura" ${tipo === 'lectura' ? 'selected' : ''}>Lectura</option>
                            <option value="imagen" ${tipo === 'imagen' ? 'selected' : ''}>Lectura + imagen</option>
                            <option value="video" ${tipo === 'video' ? 'selected' : ''}>Lectura + video</option>
                            <option value="audio" ${tipo === 'audio' ? 'selected' : ''}>Lectura + audio</option>
                            <option value="documento" ${tipo === 'documento' ? 'selected' : ''}>Lectura + PDF descargable</option>
                        </select>
                    </div>
                    <div class="cv-campo">
                        <label>¿Cuándo lo ve el estudiante?</label>
                        <select class="form-input mat-postquiz">
                            <option value="false" ${!esPost ? 'selected' : ''}>Antes del examen</option>
                            <option value="true" ${esPost ? 'selected' : ''}>Después del examen (refuerzo)</option>
                        </select>
                    </div>
                </div>
                <div class="cv-campo">
                    <label>Contenido del módulo</label>
                    <textarea class="form-input mat-texto" rows="5" style="resize: vertical; min-height: 110px; line-height: 1.55;" placeholder="Explicación, ejemplos paso a paso o análisis del caso...">${e(mat.contenido_texto)}</textarea>
                </div>
                <div class="cv-adjunto cv-campo">
                    <label>Archivo de apoyo <span class="cv-opcional">(opcional)</span></label>
                    <div style="display: flex; gap: 0.6rem; align-items: center;">
                        <input type="text" class="form-input mat-url" value="${e(url)}" placeholder="Pega una URL o sube un archivo">
                        <input type="hidden" class="mat-mime" value="${e(mat.mime_type)}">
                        <label class="cv-btn" style="margin: 0; white-space: nowrap;">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Subir archivo
                            <input type="file" class="input-upload-material" accept="image/*,video/*,audio/*,.pdf" style="display: none;">
                        </label>
                    </div>
                    <div class="mat-upload-status cv-pista">
                        ${url ? `<span style="color: var(--primary); font-weight: 700;"><i class="fa-solid fa-circle-check"></i> Archivo vinculado: ${e(url)}</span>` : 'Sin archivo: el módulo se mostrará solo como lectura.'}
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    // 3. Bloque repetible: pregunta del examen
    renderItemQuiz: function(quiz = {}, index = 0) {
        const e = v => this.esc(v);
        const tipoRecurso = quiz.tipo_recurso_apoyo || '';

        let opciones = [];
        try {
            opciones = Array.isArray(quiz.opciones) ? quiz.opciones : JSON.parse(quiz.opciones || '[]');
        } catch (err) {
            opciones = [];
        }

        let indiceCorrecta = 0;
        if (opciones[1]?.es_correcta) indiceCorrecta = 1;
        else if (opciones[2]?.es_correcta) indiceCorrecta = 2;

        const radioGroupName = `correcta_quiz_${Date.now()}_${index}_${Math.floor(Math.random() * 10000)}`;

        return `
        <div class="curso-quiz-item cv-bloque cv-bloque-quiz" data-index="${index}">
            <div class="cv-bloque-cabecera">
                <strong><span class="cv-bloque-num">${index + 1}</span> <span class="cv-bloque-titulo">Pregunta ${index + 1}</span></strong>
                <button type="button" class="cv-btn cv-btn-icono cv-peligro btn-quitar-quiz" title="Eliminar pregunta" aria-label="Eliminar pregunta">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="cv-bloque-cuerpo">
                <div class="cv-campo">
                    <label>Pregunta</label>
                    <textarea class="form-input quiz-pregunta" rows="2" placeholder="Ej: ¿Qué elemento confirma que el mensaje es un intento de estafa?" required>${e(quiz.pregunta)}</textarea>
                </div>

                <div class="cv-campo">
                    <label>Opciones de respuesta</label>
                    <span class="cv-pista" style="margin: -0.15rem 0 0.5rem;">Marca el círculo de la opción correcta; queda resaltada en verde.</span>
                    <div class="cv-opciones">
                        ${[0, 1, 2].map(i => `
                            <label class="cv-opcion">
                                <span class="cv-opcion-letra">${'ABC'[i]}</span>
                                <input type="radio" name="${radioGroupName}" class="quiz-radio-correcta" value="${i}" ${indiceCorrecta === i ? 'checked' : ''} aria-label="Marcar la opción ${'ABC'[i]} como correcta">
                                <input type="text" class="form-input quiz-op-${i}" value="${e(opciones[i]?.texto)}" placeholder="Opción ${'ABC'[i]}" required>
                                <span class="cv-opcion-marca"><i class="fa-solid fa-check"></i> Correcta</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="cv-campo">
                    <label>Retroalimentación</label>
                    <input type="text" class="form-input quiz-explicacion" value="${e(quiz.explicacion)}" placeholder="Explica por qué esa opción es la correcta..." required>
                    <span class="cv-pista">El estudiante la ve después de responder.</span>
                </div>

                <div class="cv-adjunto cv-fila-2-igual" style="grid-template-columns: 1fr 2fr;">
                    <div class="cv-campo">
                        <label>Apoyo multimedia <span class="cv-opcional">(opcional)</span></label>
                        <select class="form-input quiz-tipo-apoyo">
                            <option value="" ${!tipoRecurso ? 'selected' : ''}>Sin archivo</option>
                            <option value="imagen" ${tipoRecurso === 'imagen' ? 'selected' : ''}>Imagen</option>
                            <option value="audio" ${tipoRecurso === 'audio' ? 'selected' : ''}>Audio</option>
                            <option value="video" ${tipoRecurso === 'video' ? 'selected' : ''}>Video</option>
                        </select>
                    </div>
                    <div class="cv-campo">
                        <label>URL o archivo</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" class="form-input quiz-url-apoyo" value="${e(quiz.recurso_apoyo_url)}" placeholder="Pega una URL o sube un archivo">
                            <label class="cv-btn" style="margin: 0; white-space: nowrap;">
                                <i class="fa-solid fa-upload"></i> Subir
                                <input type="file" class="input-upload-quiz" accept="image/*,video/*,audio/*" style="display: none;">
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    // 4. Editor de cursos por pasos.
    //    curso: datos para precargar (edición o borrador de la IA)
    //    opciones.sugerenciaIA: respuesta del servicio de IA cuando es un borrador sugerido
    renderFormularioCurso: function(curso = null, opciones = {}) {
        const e = v => this.esc(v);
        const sugerencia = opciones.sugerenciaIA || null;
        const datos = curso || {};
        const tieneDatos = curso !== null;
        const esEdicion = tieneDatos && !sugerencia && datos.id_curso;
        const materiales = Array.isArray(datos.materiales) ? datos.materiales : [];
        const quizzes = Array.isArray(datos.quizzes) ? datos.quizzes : [];
        const senales = Array.isArray(datos.senales_alerta) && tieneDatos
            ? datos.senales_alerta.join('\n')
            : 'El dominio del remitente no coincide con la entidad oficial.\nSentido de urgencia extrema para presionar una acción rápida.\nEnlaces acortados o que dirigen a sitios externos desconocidos.';
        const habilidades = Array.isArray(datos.habilidades) && datos.habilidades.length > 0
            ? datos.habilidades.join(', ')
            : 'Detección de Fraude, Análisis de Amenazas, Verificación de Identidad, Respuesta a Incidentes';
        const sel = (campo, valor) => datos[campo] === valor ? 'selected' : '';

        const etiqueta = sugerencia
            ? '<span class="cv-editor-etiqueta cv-ia"><i class="fa-solid fa-brain"></i> Borrador sugerido por IA</span>'
            : `<span class="cv-editor-etiqueta"><i class="fa-solid fa-book-open"></i> ${esEdicion ? 'Editando curso #' + datos.id_curso : 'Nuevo curso'}</span>`;
        const textoSubmit = esEdicion ? 'Guardar cambios' : sugerencia ? 'Aprobar y publicar' : 'Publicar curso';

        return `
        <div id="tutorial-overlay" class="tutorial-backdrop">
            <div class="cv-editor" role="dialog" aria-modal="true" aria-labelledby="cv-editor-titulo">
                <header class="cv-editor-cabecera">
                    <div>
                        ${etiqueta}
                        <h2 id="cv-editor-titulo">${tieneDatos ? e(datos.titulo) : 'Crear un curso'}</h2>
                        <p>Completa los pasos en orden o salta entre ellos desde el menú. Puedes publicar cuando quieras: si falta algo, te llevamos al paso correspondiente.</p>
                    </div>
                    <button type="button" id="btn-cerrar-modal-curso" class="cv-editor-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </header>

                <div class="cv-editor-cuerpo">
                    ${this.renderPasosNav([
                        { titulo: 'Datos generales', sub: 'Título, vector y nivel' },
                        { titulo: 'Contenido', sub: 'Resumen, módulos 1 y 2' },
                        { titulo: 'Módulos adicionales', sub: `${materiales.length} módulos · opcional` },
                        { titulo: 'Examen', sub: `${quizzes.length} preguntas` },
                        { titulo: 'Revisar y publicar', sub: 'Vista previa' }
                    ], 'Los cursos tienen dos módulos base (cómo funciona el ataque y señales de alerta), módulos adicionales opcionales y un examen. El estudiante aprueba con 60 % o más.')}

                    <form id="form-gestionar-curso" data-curso-id="${esEdicion ? datos.id_curso : ''}" class="cv-editor-form" novalidate>
                        <div class="cv-editor-contenido">

                            <!-- PASO 1: DATOS GENERALES -->
                            <section class="cv-paso cv-activo" data-paso="1">
                                ${this.renderRecuadroIA(sugerencia, 'curso')}
                                <h3 class="cv-paso-titulo">Datos generales</h3>
                                <p class="cv-paso-desc">Así se identifica el curso en el catálogo. El vector decide en qué módulo aparece y qué riesgo ayuda a reducir.</p>
                                <div class="cv-campos">
                                    <div class="cv-fila-2">
                                        <div class="cv-campo">
                                            <label for="gc-titulo">Título del curso</label>
                                            <input type="text" id="gc-titulo" class="form-input" value="${e(datos.titulo)}" placeholder="Ej: Prevención de phishing financiero" required>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gc-categoria">Vector de ataque</label>
                                            <select id="gc-categoria" class="form-input">
                                                <option value="Phishing" ${sel('categoria', 'Phishing')}>Phishing (correo)</option>
                                                <option value="Smishing" ${sel('categoria', 'Smishing')}>Smishing (SMS)</option>
                                                <option value="Vishing" ${sel('categoria', 'Vishing')}>Vishing (llamadas)</option>
                                                <option value="Ing. Social" ${sel('categoria', 'Ing. Social')}>Ingeniería social</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="cv-fila-3">
                                        <div class="cv-campo">
                                            <label for="gc-nivel">Nivel</label>
                                            <select id="gc-nivel" class="form-input">
                                                <option value="Básico" ${sel('nivel', 'Básico')}>Básico</option>
                                                <option value="Intermedio" ${sel('nivel', 'Intermedio')}>Intermedio</option>
                                                <option value="Avanzado" ${sel('nivel', 'Avanzado')}>Avanzado</option>
                                            </select>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gc-duracion">Duración</label>
                                            <input type="text" id="gc-duracion" class="form-input" value="${e(tieneDatos ? datos.duracion : '10 min')}" placeholder="Ej: 10 min" required>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gc-icono">Icono</label>
                                            <select id="gc-icono" class="form-input">
                                                <option value="fa-envelope-open-text" ${sel('icono', 'fa-envelope-open-text')}>Correo</option>
                                                <option value="fa-comment-sms" ${sel('icono', 'fa-comment-sms')}>Mensaje SMS</option>
                                                <option value="fa-phone-volume" ${sel('icono', 'fa-phone-volume')}>Teléfono</option>
                                                <option value="fa-user-shield" ${sel('icono', 'fa-user-shield')}>Escudo de usuario</option>
                                                <option value="fa-shield-halved" ${sel('icono', 'fa-shield-halved')}>Escudo general</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gc-portada">Imagen de portada <span class="cv-opcional">(opcional)</span></label>
                                        <div style="display: flex; gap: 0.6rem; align-items: center;">
                                            <input type="text" id="gc-portada" class="form-input" value="${e(datos.portada_url)}" placeholder="Pega una URL o sube una imagen">
                                            <label class="cv-btn" style="margin: 0; white-space: nowrap;">
                                                <i class="fa-solid fa-image"></i> Subir imagen
                                                <input type="file" id="input-upload-portada" accept="image/*" style="display: none;">
                                            </label>
                                        </div>
                                        <div id="portada-preview-box" class="mt-2 ${datos.portada_url ? '' : 'hidden'}">
                                            <img id="portada-preview-img" src="${e(datos.portada_url)}" alt="Vista previa de la portada" style="max-height: 110px; border-radius: 8px; border: 1px solid var(--border); object-fit: cover;">
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- PASO 2: CONTENIDO BASE -->
                            <section class="cv-paso" data-paso="2">
                                <h3 class="cv-paso-titulo">Contenido del curso</h3>
                                <p class="cv-paso-desc">Todo curso tiene dos módulos base: cómo funciona el ataque y sus señales de alerta. Escribe en lenguaje sencillo, como si se lo explicaras a alguien que no es técnico.</p>
                                <div class="cv-campos">
                                    <div class="cv-campo">
                                        <label for="gc-resumen">Resumen</label>
                                        <textarea id="gc-resumen" class="form-input" rows="2" required>${e(datos.resumen)}</textarea>
                                        <span class="cv-pista">Aparece en la tarjeta del catálogo y en el encabezado del curso.</span>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gc-comofunciona">Módulo 1 · Cómo funciona el ataque</label>
                                        <textarea id="gc-comofunciona" class="form-input" rows="4" style="resize: vertical;" required>${e(datos.como_funciona)}</textarea>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gc-senales">Módulo 2 · Señales de alerta</label>
                                        <textarea id="gc-senales" class="form-input" rows="4" style="resize: vertical;" required>${e(senales)}</textarea>
                                        <span class="cv-pista">Una señal por línea.</span>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gc-prevencion">Cómo prevenirlo (regla de oro)</label>
                                        <textarea id="gc-prevencion" class="form-input" rows="3" required>${e(datos.prevencion)}</textarea>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gc-habilidades">Habilidades que desarrolla</label>
                                        <input type="text" id="gc-habilidades" class="form-input" value="${e(habilidades)}" required>
                                        <span class="cv-pista">Separadas por comas. Se muestran como insignias al aprobar.</span>
                                    </div>
                                </div>
                            </section>

                            <!-- PASO 3: MÓDULOS ADICIONALES -->
                            <section class="cv-paso" data-paso="3">
                                <h3 class="cv-paso-titulo">Módulos adicionales <span class="cv-opcional">(opcional)</span></h3>
                                <p class="cv-paso-desc">Agrega casos de estudio, lecturas o recursos multimedia. Se numeran a partir del módulo 3 y puedes decidir si se ven antes o después del examen.</p>
                                <div class="cv-lista-vacia" data-vacia-de="contenedor-materiales-curso"><i class="fa-solid fa-layer-group"></i>Este curso solo tiene los dos módulos base. Puedes publicarlo así o agregar más.</div>
                                <div id="contenedor-materiales-curso">
                                    ${materiales.map((m, idx) => this.renderItemMaterial(m, idx)).join('')}
                                </div>
                                <button type="button" id="btn-agregar-material" class="cv-boton-agregar"><i class="fa-solid fa-plus"></i> Agregar módulo</button>
                            </section>

                            <!-- PASO 4: EXAMEN -->
                            <section class="cv-paso" data-paso="4">
                                <h3 class="cv-paso-titulo">Examen</h3>
                                <p class="cv-paso-desc">Preguntas de opción múltiple con tres opciones y una correcta. El estudiante aprueba con 60 % o más y sus respuestas alimentan a la red neuronal.</p>
                                <div class="cv-lista-vacia" data-vacia-de="contenedor-quizzes-curso"><i class="fa-solid fa-list-check"></i>Aún no hay preguntas. Sin examen, el curso se aprueba automáticamente y la IA no recibe datos de él.</div>
                                <div id="contenedor-quizzes-curso">
                                    ${quizzes.map((q, idx) => this.renderItemQuiz(q, idx)).join('')}
                                </div>
                                <button type="button" id="btn-agregar-quiz" class="cv-boton-agregar"><i class="fa-solid fa-plus"></i> Agregar pregunta</button>
                            </section>

                            <!-- PASO 5: REVISIÓN -->
                            <section class="cv-paso" data-paso="5">
                                <h3 class="cv-paso-titulo">Revisar y publicar</h3>
                                <p class="cv-paso-desc">Comprueba que no falte nada. A la derecha ves cómo aparecerá el curso en el catálogo.</p>
                                <div class="cv-revision-contenedor"></div>
                            </section>
                        </div>
                        ${this.renderPieEditor(5, 'btn-submit-curso-completo', textoSubmit)}
                    </form>
                </div>
            </div>
        </div>
        `;
    },

    // Contenido del paso de revisión del curso (se calcula con los valores actuales del formulario)
    renderRevisionCurso: function(form) {
        const e = v => this.esc(v);
        const val = id => (form.querySelector('#' + id)?.value || '').trim();
        const materiales = form.querySelectorAll('.curso-material-item');
        const preguntas = [...form.querySelectorAll('.curso-quiz-item')];
        const incompletas = preguntas.filter(q => [...q.querySelectorAll('.quiz-pregunta, .quiz-op-0, .quiz-op-1, .quiz-op-2, .quiz-explicacion')].some(c => !c.value.trim())).length;
        const senales = val('gc-senales').split('\n').filter(s => s.trim()).length;
        const item = (estado, texto, detalle, paso) => `
            <li class="cv-${estado}">
                <i class="fa-solid ${estado === 'ok' ? 'fa-circle-check' : estado === 'aviso' ? 'fa-triangle-exclamation' : 'fa-circle-xmark'}"></i>
                <span>${texto}${detalle ? `<small>${detalle}</small>` : ''}</span>
                ${estado !== 'ok' ? `<button type="button" class="cv-ir-paso" data-ir-paso="${paso}">Corregir</button>` : ''}
            </li>`;
        const vector = val('gc-categoria');
        const meta = (typeof MisionesPage !== 'undefined') ? MisionesPage.metaDeVector(vector) : { icono: 'fa-shield-halved' };

        return `
        <div class="cv-revision">
            <ul class="cv-checklist">
                ${val('gc-titulo') ? item('ok', `Título: <strong>${e(val('gc-titulo'))}</strong>`, '', 1) : item('falta', 'Falta el título del curso', '', 1)}
                ${item('ok', `${e(vector)} · ${e(val('gc-nivel'))} · ${e(val('gc-duracion') || 'sin duración')}`, '', 1)}
                ${val('gc-resumen') && val('gc-comofunciona') && val('gc-prevencion') ? item('ok', 'Resumen, módulo 1 y prevención completos', '', 2) : item('falta', 'Falta contenido base', 'Revisa el resumen, el módulo 1 y la prevención.', 2)}
                ${senales > 0 ? item('ok', `${senales} señales de alerta en el módulo 2`, '', 2) : item('falta', 'El módulo 2 no tiene señales de alerta', '', 2)}
                ${item('ok', `${materiales.length} módulo(s) adicional(es)`, materiales.length === 0 ? 'Opcional: el curso tendrá solo los dos módulos base.' : '', 3)}
                ${preguntas.length === 0
                    ? item('aviso', 'El examen no tiene preguntas', 'Se aprobará automáticamente y la IA no recibirá datos de este curso.', 4)
                    : incompletas > 0 ? item('falta', `${incompletas} pregunta(s) incompletas`, 'Cada pregunta necesita enunciado, tres opciones y retroalimentación.', 4)
                    : item('ok', `${preguntas.length} pregunta(s) en el examen`, preguntas.length < 3 ? 'Se recomiendan al menos 3 para que la calificación sea confiable.' : '', 4)}
            </ul>
            <div class="cv-vista-previa">
                <h4>Así lo verá el estudiante</h4>
                <div class="cv-tarjeta-previa">
                    <div class="cv-tarjeta-previa-cabecera">
                        <span class="cv-modulo-icono"><i class="fa-solid ${e(val('gc-icono') || meta.icono)}"></i></span>
                        <span><small>${e(vector)} · ${e(val('gc-nivel'))}</small><strong>${e(val('gc-titulo') || 'Título del curso')}</strong></span>
                    </div>
                    <div class="cv-tarjeta-previa-cuerpo">
                        <span>${e(val('gc-resumen') || 'Aquí aparecerá el resumen del curso.')}</span>
                        <span><i class="fa-regular fa-clock"></i> ${e(val('gc-duracion') || '—')} · ${2 + materiales.length} módulos · ${preguntas.length} preguntas</span>
                    </div>
                </div>
            </div>
        </div>`;
    },

    // 5. Editor de misiones por pasos.
    //    mision: datos para precargar (edición o borrador de la IA)
    //    opciones.sugerenciaIA: respuesta del servicio de IA cuando es un borrador sugerido
    renderFormularioMision: function(mision = null, opciones = {}) {
        const e = v => this.esc(v);
        const sugerencia = opciones.sugerenciaIA || null;
        const datos = mision || {};
        const tieneDatos = mision !== null;
        const esEdicion = tieneDatos && !sugerencia && datos.id_mision;
        const pistas = Array.isArray(datos.pistas_forenses) && tieneDatos
            ? datos.pistas_forenses.join('\n')
            : 'El remitente no pertenece al dominio o línea oficial de la entidad.\nEl enlace redirige a un servidor externo no autorizado.\nUtiliza sentido de urgencia extrema para impedir que el usuario verifique.';
        const sel = (campo, valor) => datos[campo] === valor ? 'selected' : '';

        const etiqueta = sugerencia
            ? '<span class="cv-editor-etiqueta cv-ia"><i class="fa-solid fa-brain"></i> Borrador sugerido por IA</span>'
            : `<span class="cv-editor-etiqueta"><i class="fa-solid fa-crosshairs"></i> ${esEdicion ? 'Editando misión #' + datos.id_mision : 'Nueva misión'}</span>`;
        const textoSubmit = esEdicion ? 'Guardar cambios' : sugerencia ? 'Aprobar y publicar' : 'Publicar misión';

        return `
        <div id="tutorial-overlay" class="tutorial-backdrop">
            <div class="cv-editor" role="dialog" aria-modal="true" aria-labelledby="cv-editor-titulo">
                <header class="cv-editor-cabecera">
                    <div>
                        ${etiqueta}
                        <h2 id="cv-editor-titulo">${tieneDatos ? e(datos.titulo) : 'Crear una misión'}</h2>
                        <p>Una misión es un mensaje de ataque simulado. El estudiante debe detectarlo y reportarlo; funciona en las 5 dinámicas del simulador.</p>
                    </div>
                    <button type="button" id="btn-cerrar-modal-mision" class="cv-editor-cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
                </header>

                <div class="cv-editor-cuerpo">
                    ${this.renderPasosNav([
                        { titulo: 'Datos generales', sub: 'Vector, dificultad y tiempo' },
                        { titulo: 'Mensaje del ataque', sub: 'Remitente, texto y trampa' },
                        { titulo: 'Pistas forenses', sub: 'Lo que delata el engaño' },
                        { titulo: 'Revisar y publicar', sub: 'Vista previa' }
                    ], 'La misión aparece en el módulo de su vector. Se considera superada cuando el estudiante reporta la amenaza.')}

                    <form id="form-gestionar-mision" data-mision-id="${esEdicion ? datos.id_mision : ''}" class="cv-editor-form" novalidate>
                        <div class="cv-editor-contenido">

                            <!-- PASO 1: DATOS GENERALES -->
                            <section class="cv-paso cv-activo" data-paso="1">
                                ${this.renderRecuadroIA(sugerencia, 'mision')}
                                <h3 class="cv-paso-titulo">Datos generales</h3>
                                <p class="cv-paso-desc">El vector decide la interfaz que verá el estudiante: correo, celular, llamada o chat.</p>
                                <div class="cv-campos">
                                    <div class="cv-fila-2">
                                        <div class="cv-campo">
                                            <label for="gm-titulo">Título de la misión</label>
                                            <input type="text" id="gm-titulo" class="form-input" value="${e(datos.titulo)}" placeholder="Ej: Factura electrónica falsa de la DIAN" required>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gm-vector">Vector e interfaz</label>
                                            <select id="gm-vector" class="form-input">
                                                <option value="Phishing" ${sel('vector', 'Phishing')}>Phishing · correo</option>
                                                <option value="Smishing" ${sel('vector', 'Smishing')}>Smishing · celular SMS</option>
                                                <option value="Vishing" ${sel('vector', 'Vishing')}>Vishing · llamada con voz</option>
                                                <option value="Ing. Social" ${sel('vector', 'Ing. Social')}>Ingeniería social · chat</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="cv-fila-3" style="grid-template-columns: 1fr 1fr 2fr;">
                                        <div class="cv-campo">
                                            <label for="gm-dificultad">Dificultad</label>
                                            <select id="gm-dificultad" class="form-input">
                                                <option value="Básico" ${sel('dificultad', 'Básico')}>Básico</option>
                                                <option value="Intermedio" ${sel('dificultad', 'Intermedio')}>Intermedio</option>
                                                <option value="Avanzado" ${sel('dificultad', 'Avanzado')}>Avanzado</option>
                                            </select>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gm-tiempo">Tiempo límite (s)</label>
                                            <input type="number" id="gm-tiempo" class="form-input" value="${e(tieneDatos ? datos.tiempo_limite : 120)}" min="30" max="600" required>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gm-descripcion">Descripción corta</label>
                                            <input type="text" id="gm-descripcion" class="form-input" value="${e(datos.descripcion_corta)}" placeholder="Resumen del reto en una línea" required>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- PASO 2: MENSAJE -->
                            <section class="cv-paso" data-paso="2">
                                <h3 class="cv-paso-titulo">Mensaje del ataque</h3>
                                <p class="cv-paso-desc">Escribe el mensaje tal como lo enviaría el atacante. Usa datos ficticios y dominios inventados.</p>
                                <div class="cv-campos">
                                    <div class="cv-fila-2-igual">
                                        <div class="cv-campo">
                                            <label for="gm-remitente-nombre">Nombre que ve el estudiante</label>
                                            <input type="text" id="gm-remitente-nombre" class="form-input" value="${e(datos.remitente_nombre)}" placeholder="Ej: Soporte Bancario" required>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gm-remitente-id">Correo o número falso</label>
                                            <input type="text" id="gm-remitente-id" class="form-input" value="${e(datos.remitente_identificador)}" placeholder="Ej: alertas@banco-seguro.xyz" required>
                                        </div>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gm-asunto">Asunto o contexto</label>
                                        <input type="text" id="gm-asunto" class="form-input" value="${e(datos.asunto_o_contexto)}" placeholder="Ej: Su cuenta será bloqueada hoy" required>
                                    </div>
                                    <div class="cv-campo">
                                        <label for="gm-contenido">Mensaje principal</label>
                                        <textarea id="gm-contenido" class="form-input" rows="4" required>${e(datos.contenido_principal)}</textarea>
                                        <span class="cv-pista">En vishing este texto se lee en voz alta durante la llamada.</span>
                                    </div>
                                    <div class="cv-fila-2-igual">
                                        <div class="cv-campo">
                                            <label for="gm-boton">Acción trampa</label>
                                            <input type="text" id="gm-boton" class="form-input" value="${e(tieneDatos ? datos.texto_boton_trampa : 'Validar cuenta ahora')}" required>
                                            <span class="cv-pista">Lo que el atacante quiere que el estudiante haga.</span>
                                        </div>
                                        <div class="cv-campo">
                                            <label for="gm-url">Destino malicioso</label>
                                            <input type="text" id="gm-url" class="form-input" value="${e(tieneDatos ? datos.url_trampa : 'http://185.220.101.42/login-falso')}" required>
                                            <span class="cv-pista">URL falsa, número o canal al que lleva la trampa.</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <!-- PASO 3: PISTAS -->
                            <section class="cv-paso" data-paso="3">
                                <h3 class="cv-paso-titulo">Pistas forenses</h3>
                                <p class="cv-paso-desc">Son las señales que delatan el engaño. El estudiante las ve en el reporte al terminar la misión.</p>
                                <div class="cv-campo">
                                    <label for="gm-pistas">Pistas</label>
                                    <textarea id="gm-pistas" class="form-input" rows="6" required>${e(pistas)}</textarea>
                                    <span class="cv-pista">Una pista por línea. Se recomiendan tres.</span>
                                </div>
                            </section>

                            <!-- PASO 4: REVISIÓN -->
                            <section class="cv-paso" data-paso="4">
                                <h3 class="cv-paso-titulo">Revisar y publicar</h3>
                                <p class="cv-paso-desc">Comprueba que no falte nada. A la derecha ves un resumen del mensaje que recibirá el estudiante.</p>
                                <div class="cv-revision-contenedor"></div>
                            </section>
                        </div>
                        ${this.renderPieEditor(4, 'btn-submit-mision', textoSubmit)}
                    </form>
                </div>
            </div>
        </div>
        `;
    },

    // Contenido del paso de revisión de la misión
    renderRevisionMision: function(form) {
        const e = v => this.esc(v);
        const val = id => (form.querySelector('#' + id)?.value || '').trim();
        const pistas = val('gm-pistas').split('\n').filter(p => p.trim());
        const tiempo = parseInt(val('gm-tiempo'), 10);
        const item = (estado, texto, detalle, paso) => `
            <li class="cv-${estado}">
                <i class="fa-solid ${estado === 'ok' ? 'fa-circle-check' : estado === 'aviso' ? 'fa-triangle-exclamation' : 'fa-circle-xmark'}"></i>
                <span>${texto}${detalle ? `<small>${detalle}</small>` : ''}</span>
                ${estado !== 'ok' ? `<button type="button" class="cv-ir-paso" data-ir-paso="${paso}">Corregir</button>` : ''}
            </li>`;
        const mensajeCompleto = ['gm-remitente-nombre', 'gm-remitente-id', 'gm-asunto', 'gm-contenido', 'gm-boton', 'gm-url'].every(id => val(id));

        return `
        <div class="cv-revision">
            <ul class="cv-checklist">
                ${val('gm-titulo') ? item('ok', `Título: <strong>${e(val('gm-titulo'))}</strong>`, '', 1) : item('falta', 'Falta el título de la misión', '', 1)}
                ${item('ok', `${e(val('gm-vector'))} · ${e(val('gm-dificultad'))}`, '', 1)}
                ${tiempo >= 30 && tiempo <= 600 ? item('ok', `${tiempo} segundos para decidir`, '', 1) : item('falta', 'El tiempo límite debe estar entre 30 y 600 segundos', '', 1)}
                ${val('gm-descripcion') ? item('ok', 'Descripción corta lista', '', 1) : item('falta', 'Falta la descripción corta', '', 1)}
                ${mensajeCompleto ? item('ok', 'Mensaje del ataque completo', '', 2) : item('falta', 'Faltan datos del mensaje', 'Remitente, asunto, mensaje, acción trampa y destino son obligatorios.', 2)}
                ${pistas.length === 0 ? item('falta', 'No hay pistas forenses', '', 3)
                    : pistas.length < 3 ? item('aviso', `${pistas.length} pista(s) forense(s)`, 'Se recomiendan tres para que el reporte sea útil.', 3)
                    : item('ok', `${pistas.length} pistas forenses`, '', 3)}
            </ul>
            <div class="cv-vista-previa">
                <h4>Mensaje que recibirá el estudiante</h4>
                <div class="cv-mensaje-previo">
                    <div class="cv-mensaje-previo-cabecera">
                        <strong>${e(val('gm-remitente-nombre') || 'Remitente')}</strong>
                        <code>${e(val('gm-remitente-id') || 'identificador')}</code>
                    </div>
                    <div class="cv-mensaje-previo-cuerpo">
                        <strong>${e(val('gm-asunto') || 'Asunto del mensaje')}</strong>
                        <span>${e(val('gm-contenido') || 'Aquí aparecerá el mensaje principal.')}</span>
                        <span><span class="cv-boton-trampa">${e(val('gm-boton') || 'Acción trampa')}</span></span>
                        <span class="cv-pista">Destino: ${e(val('gm-url') || '—')}</span>
                    </div>
                </div>
            </div>
        </div>`;
    }
};
