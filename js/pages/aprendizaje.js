const AprendizajePage = {
    cursoSeleccionadoId: null,

    // Imágenes de respaldo estilo corporativo/ciberseguridad cuando un curso no tiene portada personalizada
    obtenerPortadaCurso: function(curso) {
        if (curso.portada_url) return curso.portada_url;
        const cat = (curso.categoria || '').toLowerCase();
        if (cat.includes('phishing') || cat.includes('correo')) {
            return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80';
        }
        if (cat.includes('smishing') || cat.includes('sms')) {
            return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80';
        }
        if (cat.includes('vishing') || cat.includes('llamada')) {
            return 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80';
        }
        return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=900&q=80';
    },

    // 1. Renderiza el Grid de Tarjetas Estilo Cisco (Imagen 2)
    renderTarjetasCursos: function() {
        if (!AppModel.catalogoCursos || AppModel.catalogoCursos.length === 0) {
            return `<div class="card text-center"><p class="text-muted">No hay cursos disponibles en este momento.</p></div>`;
        }

        return `
        <div class="cisco-courses-grid">
            ${AppModel.catalogoCursos.map(curso => {
                const imgPortada = this.obtenerPortadaCurso(curso);
                const numQuizzes = Array.isArray(curso.quizzes) ? curso.quizzes.length : 1;

                return `
                <article class="cisco-course-card btn-ver-curso" data-curso-id="${curso.id_curso}">
                    <div class="cisco-card-thumb" style="background-image: linear-gradient(rgba(15,23,42,0.15), rgba(15,23,42,0.35)), url('${imgPortada}');">
                        <span class="cisco-level-badge">${curso.nivel || 'Básico'}</span>
                        <div class="cisco-card-action-icon" title="Abrir detalles del curso">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </div>
                    </div>

                    <div class="cisco-card-body">
                        <div class="cisco-provider">NeuroShield <strong>Cyber Academy</strong></div>
                        <div class="cisco-course-type">
                            <i class="fa-solid fa-book-open"></i> Curso &nbsp;|&nbsp; Autoaprendizaje, Interactivo
                        </div>
                        <h3 class="cisco-card-title">${curso.titulo}</h3>
                        <p class="cisco-card-desc">${curso.resumen}</p>

                        <div class="cisco-card-footer">
                            <span><i class="fa-regular fa-clock"></i> ${curso.duracion || '5 min'}</span>
                            <span><i class="fa-solid fa-unlock"></i> Libre (${numQuizzes} Quiz)</span>
                        </div>
                    </div>
                </article>
                `;
            }).join('')}
        </div>
        `;
    },

    // 2. Renderiza cualquier archivo multimedia dentro de los acordeones
    renderVisorMultimedia: function(mat) {
        let mediaHTML = '';
        if (mat.archivo_url) {
            if (mat.tipo_recurso === 'imagen') {
                mediaHTML = `<img src="${mat.archivo_url}" alt="${mat.titulo}" style="width:100%; max-height:360px; object-fit:cover; border-radius:8px; margin-top:0.75rem; border:1px solid var(--border);">`;
            } else if (mat.tipo_recurso === 'video') {
                mediaHTML = `<video src="${mat.archivo_url}" controls style="width:100%; max-height:360px; border-radius:8px; margin-top:0.75rem; background:#000;"></video>`;
            } else if (mat.tipo_recurso === 'audio') {
                mediaHTML = `<audio src="${mat.archivo_url}" controls style="width:100%; margin-top:0.75rem;"></audio>`;
            } else {
                mediaHTML = `<a href="${mat.archivo_url}" target="_blank" class="btn mt-2"><i class="fa-solid fa-file-arrow-down"></i> Descargar Material Adjunto</a>`;
            }
        }

        return `
        <div>
            ${mat.contenido_texto ? `<p>${mat.contenido_texto}</p>` : ''}
            ${mediaHTML}
        </div>
        `;
    },

    // 3. Renderiza la Página de Detalle del Curso Estilo Cisco (Imagen 3)
    renderVistaDetalleCurso: function(curso) {
        const imgPortada = this.obtenerPortadaCurso(curso);
        const materiales = Array.isArray(curso.materiales) ? curso.materiales : [];
        const materialesPre = materiales.filter(m => !m.es_post_quiz);
        const materialesPost = materiales.filter(m => m.es_post_quiz);
        const quizzes = Array.isArray(curso.quizzes) ? curso.quizzes : [];

        return `
        <section id="aprendizaje-detalle" class="view-section active">
            <!-- Migas de pan / Botón Volver -->
            <div class="mb-3">
                <button type="button" id="btn-volver-catalogo" class="btn" style="padding: 0.5rem 1rem;">
                    <i class="fa-solid fa-arrow-left"></i> Volver al catálogo de cursos
                </button>
            </div>

            <!-- Banner Superior de 2 Columnas (Imagen 3 de Cisco) -->
            <div class="cisco-detail-banner">
                <div class="cisco-detail-left">
                    <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted);">NEUROSHIELD</span>
                        <span class="cisco-detail-tag">Curso Oficial</span>
                    </div>
                    <h1 class="cisco-detail-title">${curso.titulo}</h1>
                    <p style="font-size: 0.84rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem;">
                        Este módulo forma parte de la Ruta de Prevención en <strong>${curso.categoria}</strong>
                    </p>
                    <p class="text-muted" style="line-height: 1.6; font-size: 0.94rem;">
                        ${curso.resumen}
                    </p>

                    <div class="cisco-mode-box">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-main);">
                                    <i class="fa-solid fa-laptop-code" style="color: var(--cisco-green);"></i> Modalidad Autoaprendizaje Online
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                                    Idioma: Español &nbsp;|&nbsp; Origen: ${curso.origen || 'Sistema'}
                                </div>
                            </div>
                            <button type="button" id="btn-empezar-acordeon" class="btn-cisco-primary">
                                Empezar con Autoaprendizaje <i class="fa-solid fa-arrow-down"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="cisco-detail-right" style="background-image: linear-gradient(rgba(15,23,42,0.2), rgba(15,23,42,0.7)), url('${imgPortada}');">
                    <div style="padding: 1.5rem; color: white;">
                        <span style="background: rgba(0,0,0,0.65); padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.78rem; font-weight: 700;">
                            <i class="fa-solid ${curso.icono || 'fa-shield-halved'}"></i> Vector: ${curso.categoria}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Cuerpo Inferior de 2 Columnas: Izquierda (Acordeones y Examen) / Derecha (Specs e Insignias) -->
            <div class="cisco-detail-body-grid">
                
                <!-- Columna Principal Izquierda -->
                <div>
                    <div class="cisco-tabs-bar">
                        <span class="cisco-tab-item active">Descripción y Currículo</span>
                        <span class="cisco-tab-item">Módulos Multimedia (${materiales.length})</span>
                        <span class="cisco-tab-item">Evaluación (${quizzes.length})</span>
                    </div>

                    <p style="color: var(--text-main); line-height: 1.7; font-size: 0.94rem; margin-bottom: 1.75rem;">
                        En este curso estudiarás el funcionamiento real de <strong>${curso.titulo}</strong>, analizando los mecanismos psicológicos y técnicos empleados por los atacantes, revisando evidencia multimedia y validando tu criterio mediante un examen práctico.
                    </p>

                    <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--cisco-dark);">
                        Lo que aprenderás en este curso
                    </h2>

                    <!-- LISTA DE ACORDEONES ESTILO CISCO -->
                    <div class="cisco-accordion-list" id="lista-acordeones-curso">
                        
                        <!-- Módulo 1: ¿Cómo funciona el ataque? -->
                        <div class="cisco-accordion-item open">
                            <button type="button" class="cisco-accordion-header">
                                <div class="cisco-acc-left">
                                    <div class="cisco-acc-circle"><i class="fa-solid fa-list-ul"></i></div>
                                    <span>Módulo 1: Mecánica del Ataque y Operación del Engaño</span>
                                </div>
                                <div class="cisco-acc-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                            </button>
                            <div class="cisco-accordion-content">
                                <p>${curso.como_funciona}</p>
                            </div>
                        </div>

                        <!-- Módulo 2: Señales de Alerta y Protocolo de Prevención -->
                        <div class="cisco-accordion-item">
                            <button type="button" class="cisco-accordion-header">
                                <div class="cisco-acc-left">
                                    <div class="cisco-acc-circle"><i class="fa-solid fa-triangle-exclamation"></i></div>
                                    <span>Módulo 2: Indicadores de Alerta Temprana y Prevención</span>
                                </div>
                                <div class="cisco-acc-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                            </button>
                            <div class="cisco-accordion-content">
                                <strong style="display:block; margin-bottom:0.5rem;">Señales clave que debes vigilar:</strong>
                                <ul class="course-alert-list mb-3">
                                    ${(curso.senales_alerta || []).map(senal => `
                                        <li><i class="fa-solid fa-check" style="color: var(--cisco-green);"></i> <span>${senal}</span></li>
                                    `).join('')}
                                </ul>
                                <div class="threat-prevention">
                                    <i class="fa-solid fa-shield-halved" style="color: var(--success); font-size: 1.1rem; margin-top: 2px;"></i>
                                    <div>
                                        <strong>Regla de oro de seguridad:</strong>
                                        <p style="margin-top: 4px;">${curso.prevencion}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Módulos Dinámicos Multimedia Pre-Quiz -->
                        ${materialesPre.map((mat, idx) => `
                            <div class="cisco-accordion-item">
                                <button type="button" class="cisco-accordion-header">
                                    <div class="cisco-acc-left">
                                        <div class="cisco-acc-circle"><i class="fa-solid fa-photo-film"></i></div>
                                        <span>Módulo ${idx + 3}: ${mat.titulo} (${mat.tipo_recurso.toUpperCase()})</span>
                                    </div>
                                    <div class="cisco-acc-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                                </button>
                                <div class="cisco-accordion-content">
                                    ${this.renderVisorMultimedia(mat)}
                                </div>
                            </div>
                        `).join('')}

                        <!-- Acordeón del Examen Final del Curso (Quiz) -->
                        <div class="cisco-accordion-item" id="acordeon-quiz-final">
                            <button type="button" class="cisco-accordion-header">
                                <div class="cisco-acc-left">
                                    <div class="cisco-acc-circle"><i class="fa-solid fa-clipboard-check"></i></div>
                                    <span>Examen Final del Curso (${quizzes.length} Pregunta${quizzes.length === 1 ? '' : 's'})</span>
                                </div>
                                <div class="cisco-acc-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                            </button>
                            <div class="cisco-accordion-content">
                                ${quizzes.length > 0 ? `
                                    <form id="form-quiz-curso" data-curso-id="${curso.id_curso}">
                                        ${quizzes.map((q, qIndex) => {
                                            const opciones = Array.isArray(q.opciones) ? q.opciones : JSON.parse(q.opciones || '[]');
                                            return `
                                            <div class="quiz-question-block mb-3">
                                                <div class="quiz-topic-badge">Pregunta ${qIndex + 1}</div>
                                                <p class="quiz-question-title">${q.pregunta}</p>
                                                <div class="quiz-options">
                                                    ${opciones.map((op, opIndex) => `
                                                        <label class="quiz-option-label">
                                                            <input type="radio" name="quiz_preg_${qIndex}" value="${opIndex}" ${opIndex === 0 ? 'required' : ''}>
                                                            <span>${op.texto}</span>
                                                        </label>
                                                    `).join('')}
                                                </div>
                                                <div id="feedback-quiz-${qIndex}" class="hidden mt-2" style="padding: 0.75rem; border-radius: 8px; font-size: 0.85rem;"></div>
                                            </div>
                                            `;
                                        }).join('')}

                                        <div id="resultado-global-quiz" class="hidden mb-3" style="padding: 1rem; border-radius: 8px; font-weight: 600;"></div>

                                        <button type="submit" class="btn-cisco-primary">
                                            <i class="fa-solid fa-check-double"></i> Enviar y Calificar Examen
                                        </button>
                                    </form>
                                ` : `<p class="text-muted">Este curso aún no tiene preguntas registradas.</p>`}
                            </div>
                        </div>

                        <!-- Acordeones Post-Quiz (Refuerzo) -->
                        ${materialesPost.map(mat => `
                            <div class="cisco-accordion-item seccion-post-quiz ${quizzes.length > 0 ? 'hidden' : ''}">
                                <button type="button" class="cisco-accordion-header">
                                    <div class="cisco-acc-left">
                                        <div class="cisco-acc-circle"><i class="fa-solid fa-award"></i></div>
                                        <span>Material de Refuerzo Desbloqueado: ${mat.titulo}</span>
                                    </div>
                                    <div class="cisco-acc-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                                </button>
                                <div class="cisco-accordion-content">
                                    ${this.renderVisorMultimedia(mat)}
                                </div>
                            </div>
                        `).join('')}

                    </div>
                </div>

                <!-- Columna Derecha: Especificaciones, Logros y Habilidades (Imagen 3 de Cisco) -->
                <aside>
                    <div class="cisco-sidebar-card">
                        <div class="cisco-specs-row">
                            <div class="cisco-spec-box">
                                <i class="fa-solid fa-unlock"></i>
                                <span>Libre</span>
                            </div>
                            <div class="cisco-spec-box">
                                <i class="fa-regular fa-clock"></i>
                                <span>${curso.duracion || '5 MIN'}</span>
                            </div>
                            <div class="cisco-spec-box">
                                <i class="fa-solid fa-signal"></i>
                                <span>${curso.nivel || 'BÁSICO'}</span>
                            </div>
                            <div class="cisco-spec-box">
                                <i class="fa-solid fa-flask"></i>
                                <span>${quizzes.length} LAB/QUIZ</span>
                            </div>
                        </div>

                        <h4 style="font-size: 0.92rem; font-weight: 800; color: var(--cisco-dark);">Logros del Curso</h4>
                        <p class="text-muted" style="font-size: 0.78rem;">Insignias que desbloqueas al aprobar este módulo:</p>
                        <div class="cisco-badges-row">
                            <div class="cisco-achievement-badge" title="Analista de Amenazas"><i class="fa-solid ${curso.icono || 'fa-shield-halved'}"></i></div>
                            <div class="cisco-achievement-badge" title="Defensor Digital"><i class="fa-solid fa-user-check"></i></div>
                            <div class="cisco-achievement-badge" title="Criterio Forense"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
                        </div>

                        <hr style="border: none; border-top: 1px solid var(--border); margin: 1.25rem 0;">

                        <h4 style="font-size: 0.92rem; font-weight: 800; color: var(--cisco-dark);">Habilidades que desarrollarás</h4>
                        <div class="cisco-skill-tags">
                            <span class="cisco-skill-tag">${curso.categoria}</span>
                            <span class="cisco-skill-tag">Análisis de Cabeceras</span>
                            <span class="cisco-skill-tag">Prevención de Fraude</span>
                            <span class="cisco-skill-tag">Respuesta a Incidentes</span>
                        </div>

                        <div class="mt-4">
                            <a href="#/simulador" class="btn-cisco-outline w-100" style="justify-content: center;">
                                <i class="fa-solid fa-crosshairs"></i> Pasar al Simulador Práctico
                            </a>
                        </div>
                    </div>
                </aside>

            </div>
        </section>
        `;
    },

    // 4. Render principal de la ruta #/aprendizaje
    render: function() {
        if (this.cursoSeleccionadoId) {
            const curso = AppModel.catalogoCursos.find(c => String(c.id_curso) === String(this.cursoSeleccionadoId));
            if (curso) return this.renderVistaDetalleCurso(curso);
        }

        return `
        <section id="aprendizaje" class="view-section active">
            <div class="learning-hero mb-4">
                <div>
                    <span class="badge-pill" style="background: var(--cisco-green-bg); color: #2b5917;">
                        <i class="fa-solid fa-graduation-cap"></i> NeuroShield Cyber Academy
                    </span>
                    <h1 style="font-size: 1.9rem; font-weight: 800; margin-top: 0.5rem;">Catálogo de Cursos Interactivos</h1>
                    <p class="text-muted mt-2" style="max-width: 700px; line-height: 1.6;">
                        Explora nuestra colección de cursos autoformativos con soporte multimedia y evaluaciones integradas para fortalecer tu postura de ciberseguridad.
                    </p>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button class="btn-cisco-outline" id="btn-abrir-diagnostico-aprendizaje">
                        <i class="fa-solid fa-clipboard-question"></i> Diagnóstico Inicial
                    </button>
                    <a href="#/misiones" class="btn-cisco-primary">
                        <i class="fa-solid fa-play"></i> Ir a Simuladores
                    </a>
                </div>
            </div>

            ${this.renderTarjetasCursos()}
        </section>
        `;
    }
};