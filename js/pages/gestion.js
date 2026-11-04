const GestionPage = {
    tabActiva: 'cursos', // 'cursos' | 'simuladores' | 'usuarios' | 'grupos'

    renderTablaCursos: function() {
        const cursos = AppModel.catalogoCursos || [];
        return `
        <div class="card" style="overflow-x: auto;">
            <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h3><i class="fa-solid fa-book-open text-primary me-1"></i> Catálogo de Cursos en Base de Datos</h3>
                    <p class="text-muted" style="font-size: 0.85rem;">Crea nuevos cursos multimedia o modifica los existentes.</p>
                </div>
                <button type="button" id="btn-nuevo-curso" class="btn-cisco-primary">
                    <i class="fa-solid fa-plus"></i> Crear Nuevo Curso
                </button>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted);">
                        <th style="padding: 0.75rem;">ID</th>
                        <th style="padding: 0.75rem;">Título del Curso</th>
                        <th style="padding: 0.75rem;">Vector</th>
                        <th style="padding: 0.75rem;">Nivel</th>
                        <th style="padding: 0.75rem;">Duración</th>
                        <th style="padding: 0.75rem;">Origen</th>
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
                            <td style="padding: 0.85rem;"><span class="badge-soft">${c.origen || 'Sistema'}</span></td>
                            <td style="padding: 0.85rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
                                <button type="button" class="btn btn-editar-curso" data-curso-id="${c.id_curso}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button type="button" class="btn btn-danger btn-eliminar-curso" data-curso-id="${c.id_curso}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    renderTablaSimuladores: function() {
        const misiones = AppModel.catalogoMisiones || [];
        return `
        <div class="card" style="overflow-x: auto;">
            <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h3><i class="fa-solid fa-crosshairs text-primary me-1"></i> Escenarios de Simulación por Tipo de Ataque</h3>
                    <p class="text-muted" style="font-size: 0.85rem;">Añade múltiples ejemplos de Phishing, Smishing, Vishing e Ingeniería Social, o modifica sus textos, remitentes y pistas forenses.</p>
                </div>
                <button type="button" id="btn-nueva-mision" class="btn-cisco-primary">
                    <i class="fa-solid fa-plus"></i> Crear Escenario de Ataque
                </button>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted);">
                        <th style="padding: 0.75rem;">ID</th>
                        <th style="padding: 0.75rem;">Título del Escenario</th>
                        <th style="padding: 0.75rem;">Vector</th>
                        <th style="padding: 0.75rem;">Remitente Simulado</th>
                        <th style="padding: 0.75rem;">Tiempo</th>
                        <th style="padding: 0.75rem;">Origen</th>
                        <th style="padding: 0.75rem; text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${misiones.map(m => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 0.85rem; font-weight: 700;">#${m.id_mision}</td>
                            <td style="padding: 0.85rem; font-weight: 700; color: var(--cisco-dark);">${m.titulo}</td>
                            <td style="padding: 0.85rem;"><span class="badge-pill">${m.vector}</span></td>
                            <td style="padding: 0.85rem;">
                                <div style="font-weight: 600;">${m.remitente_nombre}</div>
                                <div class="text-muted" style="font-size: 0.76rem;">${m.remitente_identificador}</div>
                            </td>
                            <td style="padding: 0.85rem;">${m.tiempo_limite || 120}s (${m.dificultad})</td>
                            <td style="padding: 0.85rem;"><span class="badge-soft">${m.origen || 'Sistema'}</span></td>
                            <td style="padding: 0.85rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
                                <button type="button" class="btn btn-editar-mision" data-mision-id="${m.id_mision}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button type="button" class="btn btn-danger btn-eliminar-mision" data-mision-id="${m.id_mision}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    renderTablaUsuarios: function() {
        const usuarios = AppModel.listaUsuariosAdmin || [];
        const grupos = AppModel.listaGruposAdmin || [];

        return `
        <div class="card" style="overflow-x: auto;">
            <div class="mb-3">
                <h3><i class="fa-solid fa-users-gear text-primary me-1"></i> Directorio de Usuarios y Asignación de Roles</h3>
                <p class="text-muted" style="font-size: 0.85rem;">Asigna usuarios a un grupo de capacitación o modifica sus permisos de acceso.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
                <thead>
                    <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted);">
                        <th style="padding: 0.75rem;">ID</th>
                        <th style="padding: 0.75rem;">Nombre y Correo</th>
                        <th style="padding: 0.75rem;">Vulnerabilidad</th>
                        <th style="padding: 0.75rem;">Rol del Sistema</th>
                        <th style="padding: 0.75rem;">Grupo Asignado</th>
                        <th style="padding: 0.75rem; text-align: center;">Guardar</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(u => `
                        <tr style="border-bottom: 1px solid var(--border);">
                            <td style="padding: 0.85rem; font-weight: 700;">#${u.id_usuario}</td>
                            <td style="padding: 0.85rem;">
                                <div style="font-weight: 700; color: var(--text-main);">${u.nombre}</div>
                                <div class="text-muted" style="font-size: 0.78rem;">${u.correo}</div>
                            </td>
                            <td style="padding: 0.85rem;">
                                <span class="badge-pill" style="background: ${u.nivel_vulnerabilidad >= 60 ? 'var(--danger-bg)' : 'var(--cisco-green-bg)'}; color: ${u.nivel_vulnerabilidad >= 60 ? '#991b1b' : '#2b5917'};">
                                    ${u.nivel_vulnerabilidad}%
                                </span>
                            </td>
                            <td style="padding: 0.85rem;">
                                <select class="form-input select-rol-usuario" data-user-id="${u.id_usuario}" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
                                    <option value="Estudiante" ${u.rol === 'Estudiante' ? 'selected' : ''}>Estudiante</option>
                                    <option value="Administrador" ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                                </select>
                            </td>
                            <td style="padding: 0.85rem;">
                                <select class="form-input select-grupo-usuario" data-user-id="${u.id_usuario}" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
                                    <option value="">-- Sin grupo asignado --</option>
                                    ${grupos.map(g => `
                                        <option value="${g.id_grupo}" ${u.id_grupo === g.id_grupo ? 'selected' : ''}>${g.nombre_grupo}</option>
                                    `).join('')}
                                </select>
                            </td>
                            <td style="padding: 0.85rem; text-align: center;">
                                <button type="button" class="btn-cisco-primary btn-guardar-usuario-admin" data-user-id="${u.id_usuario}" style="padding: 0.45rem 0.9rem; font-size: 0.8rem;">
                                    <i class="fa-solid fa-floppy-disk"></i> Aplicar
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    renderSeccionGrupos: function() {
        const grupos = AppModel.listaGruposAdmin || [];

        return `
        <div class="profile-layout-grid">
            <div class="card">
                <h3 class="mb-2"><i class="fa-solid fa-folder-plus text-primary me-1"></i> Crear Nuevo Grupo</h3>
                <p class="text-muted mb-3" style="font-size: 0.85rem;">
                    Organiza a los estudiantes o colaboradores por carrera, semestre o área corporativa.
                </p>

                <form id="form-crear-grupo">
                    <div class="form-group">
                        <label>Nombre del Grupo o Área</label>
                        <input type="text" id="grupo-nombre" class="form-input" placeholder="Ej: Ingeniería de Software - Semestre V" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Descripción / Objetivo de Capacitación</label>
                        <textarea id="grupo-desc" class="form-input" rows="3" placeholder="Describe el enfoque de entrenamiento para este grupo..."></textarea>
                    </div>
                    <button type="submit" class="btn-cisco-primary w-100" style="justify-content: center;">
                        <i class="fa-solid fa-plus"></i> Crear Grupo
                    </button>
                </form>
            </div>

            <div class="card">
                <h3 class="mb-3"><i class="fa-solid fa-layer-group text-primary me-1"></i> Grupos Activos (${grupos.length})</h3>
                <div style="display: grid; gap: 0.9rem;">
                    ${grupos.length > 0 ? grupos.map(g => `
                        <div style="border: 1px solid var(--border); border-radius: 10px; padding: 1.1rem; background: var(--bg-main); display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 0.6rem;">
                                    <h4 style="font-size: 1rem; font-weight: 800; color: var(--cisco-dark);">${g.nombre_grupo}</h4>
                                    <span class="badge-pill"><i class="fa-solid fa-users"></i> ${g.total_usuarios || 0} miembros</span>
                                    <span class="badge-soft">Riesgo Promedio: ${g.riesgo_promedio || 0}%</span>
                                </div>
                                <p class="text-muted mt-1" style="font-size: 0.84rem;">${g.descripcion || 'Sin descripción registrada.'}</p>
                            </div>
                            <button type="button" class="btn btn-danger btn-eliminar-grupo" data-grupo-id="${g.id_grupo}" style="padding: 0.45rem 0.75rem;" title="Eliminar grupo">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `).join('') : `<p class="text-muted">No hay grupos creados todavía.</p>`}
                </div>
            </div>
        </div>
        `;
    },

    render: function() {
        let contenidoTab = '';
        if (this.tabActiva === 'cursos') contenidoTab = this.renderTablaCursos();
        else if (this.tabActiva === 'simuladores') contenidoTab = this.renderTablaSimuladores();
        else if (this.tabActiva === 'usuarios') contenidoTab = this.renderTablaUsuarios();
        else if (this.tabActiva === 'grupos') contenidoTab = this.renderSeccionGrupos();

        return `
        <section id="gestion" class="view-section active">
            <div class="learning-hero mb-4">
                <div>
                    <span class="badge-pill">
                        <i class="fa-solid fa-user-shield"></i> Acceso Exclusivo Administrador
                    </span>
                    <h1 style="font-size: 1.8rem; font-weight: 800; margin-top: 0.5rem;">Centro de Administración NeuroShield</h1>
                    <p class="text-muted mt-1" style="max-width: 760px; line-height: 1.5;">
                        Gestiona el catálogo de cursos, personaliza los escenarios de simulación de ataques, administra usuarios y organiza grupos de entrenamiento.
                    </p>
                </div>
            </div>

            <!-- 4 Pestañas de Navegación del Administrador -->
            <div class="cisco-tabs-bar mb-4" style="gap: 0.75rem; flex-wrap: wrap;">
                <button type="button" class="btn btn-tab-admin ${this.tabActiva === 'cursos' ? 'btn-cisco-primary' : ''}" data-tab="cursos">
                    <i class="fa-solid fa-book-open"></i> Cursos (${(AppModel.catalogoCursos || []).length})
                </button>
                <button type="button" class="btn btn-tab-admin ${this.tabActiva === 'simuladores' ? 'btn-cisco-primary' : ''}" data-tab="simuladores">
                    <i class="fa-solid fa-crosshairs"></i> Simuladores / Ataques (${(AppModel.catalogoMisiones || []).length})
                </button>
                <button type="button" class="btn btn-tab-admin ${this.tabActiva === 'usuarios' ? 'btn-cisco-primary' : ''}" data-tab="usuarios">
                    <i class="fa-solid fa-users-gear"></i> Usuarios (${(AppModel.listaUsuariosAdmin || []).length})
                </button>
                <button type="button" class="btn btn-tab-admin ${this.tabActiva === 'grupos' ? 'btn-cisco-primary' : ''}" data-tab="grupos">
                    <i class="fa-solid fa-layer-group"></i> Grupos (${(AppModel.listaGruposAdmin || []).length})
                </button>
            </div>

            ${contenidoTab}
        </section>
        `;
    }
};