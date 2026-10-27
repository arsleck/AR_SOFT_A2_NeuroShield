const GestionPage = {
    render: function() {
        const cursos = AppModel.catalogoCursos || [];

        return `
        <section id="gestion" class="view-section active">
            <div class="learning-hero mb-4">
                <div>
                    <span class="badge-pill" style="background: var(--cisco-green-bg); color: #2b5917;">
                        <i class="fa-solid fa-sliders"></i> Panel de Administración
                    </span>
                    <h1 style="font-size: 1.8rem; font-weight: 800; margin-top: 0.5rem;">Gestión de Cursos y Módulos</h1>
                    <p class="text-muted mt-2" style="max-width: 700px; line-height: 1.6;">
                        Crea nuevos microcursos, modifica la duración, las imágenes de portada, los módulos multimedia y las preguntas de examen desde un solo lugar.
                    </p>
                </div>
                <div>
                    <button type="button" id="btn-nuevo-curso" class="btn-cisco-primary">
                        <i class="fa-solid fa-plus"></i> Crear Nuevo Curso
                    </button>
                </div>
            </div>

            <div class="card" style="overflow-x: auto;">
                <h3 class="mb-3"><i class="fa-solid fa-list text-primary me-1"></i> Cursos Registrados en Base de Datos</h3>
                
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted);">
                            <th style="padding: 0.75rem;">ID</th>
                            <th style="padding: 0.75rem;">Título del Curso</th>
                            <th style="padding: 0.75rem;">Categoría / Vector</th>
                            <th style="padding: 0.75rem;">Nivel</th>
                            <th style="padding: 0.75rem;">Duración</th>
                            <th style="padding: 0.75rem; text-align: center;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${cursos.map(c => `
                            <tr style="border-bottom: 1px solid var(--border);">
                                <td style="padding: 0.85rem; font-weight: 700;">#${c.id_curso}</td>
                                <td style="padding: 0.85rem; font-weight: 700; color: var(--cisco-dark);">${c.titulo}</td>
                                <td style="padding: 0.85rem;"><span class="badge-pill">${c.categoria}</span></td>
                                <td style="padding: 0.85rem;">${c.nivel || 'Básico'}</td>
                                <td style="padding: 0.85rem;">${c.duracion || '5 min'}</td>
                                <td style="padding: 0.85rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
                                    <button type="button" class="btn btn-editar-curso" data-curso-id="${c.id_curso}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" title="Modificar curso">
                                        <i class="fa-solid fa-pen-to-square"></i> Editar
                                    </button>
                                    <button type="button" class="btn btn-danger btn-eliminar-curso" data-curso-id="${c.id_curso}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" title="Eliminar curso">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </section>
        `;
    }
};