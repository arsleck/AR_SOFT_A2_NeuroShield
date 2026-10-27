const TutorialComponent = {
    renderFormularioCurso: function(curso = null) {
        const esEdicion = curso !== null;
        const materiales = esEdicion && Array.isArray(curso.materiales) ? curso.materiales : [];
        const quizzes = esEdicion && Array.isArray(curso.quizzes) ? curso.quizzes : [];

        return `
        <div id="tutorial-overlay" class="tutorial-backdrop">
            <div class="quiz-modal" style="max-width: 820px; max-height: 92vh;">
                <div class="quiz-modal-header">
                    <div>
                        <span class="badge-pill"><i class="fa-solid fa-pen-nib"></i> ${esEdicion ? 'Editar Curso ID #' + curso.id_curso : 'Crear Nuevo Microcurso'}</span>
                        <h2>${esEdicion ? 'Modificar Contenido del Curso' : 'Constructor de Cursos con IA y Admin'}</h2>
                        <p class="text-muted">Personaliza la portada, el tiempo, la teoría, los módulos multimedia y el examen.</p>
                    </div>
                    <button type="button" id="btn-cerrar-modal-curso" class="icon-btn"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <form id="form-gestionar-curso" data-curso-id="${esEdicion ? curso.id_curso : ''}" class="quiz-modal-body" style="gap: 1.5rem;">
                    
                    <!-- Información Principal -->
                    <div>
                        <h4 class="mb-2"><i class="fa-solid fa-circle-info text-primary"></i> 1. Información General</h4>
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;" class="mb-2">
                            <div class="form-group mb-0">
                                <label>Título del Curso</label>
                                <input type="text" id="gc-titulo" class="form-input" value="${esEdicion ? curso.titulo : ''}" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>Categoría / Vector</label>
                                <select id="gc-categoria" class="form-input">
                                    <option value="Phishing" ${esEdicion && curso.categoria === 'Phishing' ? 'selected' : ''}>Phishing</option>
                                    <option value="Smishing" ${esEdicion && curso.categoria === 'Smishing' ? 'selected' : ''}>Smishing</option>
                                    <option value="Vishing" ${esEdicion && curso.categoria === 'Vishing' ? 'selected' : ''}>Vishing</option>
                                    <option value="Ing. Social" ${esEdicion && curso.categoria === 'Ing. Social' ? 'selected' : ''}>Ing. Social</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                            <div class="form-group mb-0">
                                <label>Nivel</label>
                                <select id="gc-nivel" class="form-input">
                                    <option value="Básico" ${esEdicion && curso.nivel === 'Básico' ? 'selected' : ''}>Básico</option>
                                    <option value="Intermedio" ${esEdicion && curso.nivel === 'Intermedio' ? 'selected' : ''}>Intermedio</option>
                                    <option value="Avanzado" ${esEdicion && curso.nivel === 'Avanzado' ? 'selected' : ''}>Avanzado</option>
                                </select>
                            </div>
                            <div class="form-group mb-0">
                                <label>Duración estimada</label>
                                <input type="text" id="gc-duracion" class="form-input" value="${esEdicion ? curso.duracion : '5 min'}" required>
                            </div>
                            <div class="form-group mb-0">
                                <label>URL Imagen de Portada</label>
                                <input type="url" id="gc-portada" class="form-input" value="${esEdicion && curso.portada_url ? curso.portada_url : ''}" placeholder="https://...">
                            </div>
                        </div>
                    </div>

                    <!-- Resumen y Mecánica -->
                    <div>
                        <h4 class="mb-2"><i class="fa-solid fa-book text-primary"></i> 2. Teoría y Mecánica del Ataque</h4>
                        <div class="form-group">
                            <label>Resumen Corto</label>
                            <textarea id="gc-resumen" class="form-input" rows="2" required>${esEdicion ? curso.resumen : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>¿Cómo opera el engaño? (Mecánica)</label>
                            <textarea id="gc-comofunciona" class="form-input" rows="3" required>${esEdicion ? curso.como_funciona : ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Protocolo de Prevención</label>
                            <textarea id="gc-prevencion" class="form-input" rows="2" required>${esEdicion ? curso.prevencion : ''}</textarea>
                        </div>
                    </div>

                    <div class="quiz-modal-footer">
                        <button type="submit" class="btn-cisco-primary w-100" style="justify-content: center;">
                            <i class="fa-solid fa-floppy-disk"></i> ${esEdicion ? 'Guardar Cambios del Curso' : 'Publicar Nuevo Curso en Neon'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
    }
};