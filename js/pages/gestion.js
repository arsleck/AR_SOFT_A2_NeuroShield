// === PANEL DEL ADMINISTRADOR (#/gestion) ===
// Organización tipo LMS desde la perspectiva del docente: navegación lateral del curso
// (Cursos, Simuladores, Personas, Grupos, Calificaciones), tablas con acciones y un libro
// de calificaciones con el riesgo que estima la red neuronal para cada estudiante.

const GestionPage = {
    tabActiva: 'cursos', // 'cursos' | 'simuladores' | 'usuarios' | 'grupos' | 'calificaciones'
    filtroGrupoLibro: '',

    VECTORES: ['Phishing', 'Smishing', 'Vishing', 'Ing. Social'],

    chipOrigen: function(origen) {
        const valor = origen || 'Sistema';
        return valor === 'Servicio IA'
            ? '<span class="cv-chip cv-chip-ia"><i class="fa-solid fa-brain"></i> Servicio IA</span>'
            : `<span class="cv-chip">${valor}</span>`;
    },

    selectorGrupos: function(id, titulo) {
        return `
            <select id="${id}" class="cv-select" title="${titulo}">
                <option value="">Todos los usuarios</option>
                ${(AppModel.listaGruposAdmin || []).map(g => `<option value="${g.id_grupo}">${g.nombre_grupo}</option>`).join('')}
            </select>`;
    },

    encabezado: function(titulo, descripcion, acciones = '') {
        return `
            <header class="cv-page-header" style="margin-bottom: 1.25rem;">
                <div>
                    <h1>${titulo}</h1>
                    <p>${descripcion}</p>
                </div>
                <div class="cv-acciones">${acciones}</div>
            </header>`;
    },

    renderTablaCursos: function() {
        const cursos = AppModel.catalogoCursos || [];
        return `
        ${this.encabezado('Cursos', 'Microcursos con módulos teóricos, recursos multimedia y examen. La IA puede proponer un borrador según el vector más débil del grupo.', `
            <button type="button" id="btn-sugerir-curso-ia" class="cv-btn" title="Responde unas preguntas y la red neuronal propone un curso con su examen">
                <i class="fa-solid fa-brain"></i> Generar curso con IA
            </button>
            <button type="button" id="btn-nuevo-curso" class="cv-btn cv-btn-primario">
                <i class="fa-solid fa-plus"></i> Curso
            </button>`)}

        <div class="cv-tabla-marco">
            <table class="cv-tabla">
                <thead>
                    <tr>
                        <th>Curso</th>
                        <th>Vector</th>
                        <th>Nivel</th>
                        <th>Contenido</th>
                        <th>Origen</th>
                        <th style="text-align: right;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${cursos.length === 0 ? '<tr><td colspan="6" class="cv-secundario">No hay cursos publicados.</td></tr>' : cursos.map(c => `
                        <tr>
                            <td>
                                <div class="cv-principal">${c.titulo}</div>
                                <div class="cv-secundario">#${c.id_curso} · ${c.duracion || ''}</div>
                            </td>
                            <td><span class="cv-chip"><i class="fa-solid ${MisionesPage.metaDeVector(c.categoria).icono}"></i> ${c.categoria}</span></td>
                            <td>${c.nivel || 'Básico'}</td>
                            <td class="cv-secundario">${(c.materiales || []).length} módulos · ${(c.quizzes || []).length} preguntas</td>
                            <td>${this.chipOrigen(c.origen)}</td>
                            <td class="cv-celda-acciones">
                                <button type="button" class="cv-btn btn-editar-curso" data-curso-id="${c.id_curso}">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button type="button" class="cv-btn cv-btn-icono cv-peligro btn-eliminar-curso" data-curso-id="${c.id_curso}" title="Eliminar curso" aria-label="Eliminar curso ${c.titulo}">
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
        const misiones = (AppModel.catalogoMisiones || []).slice().sort((a, b) =>
            this.VECTORES.indexOf(a.vector) - this.VECTORES.indexOf(b.vector) ||
            (MisionesPage.ordenDificultad[a.dificultad] ?? 9) - (MisionesPage.ordenDificultad[b.dificultad] ?? 9) ||
            a.id_mision - b.id_mision);

        return `
        ${this.encabezado('Simuladores', 'Escenarios de ataque por vector. Los estudiantes los ven como módulos y pueden practicar cada uno en las 5 dinámicas.', `
            <button type="button" id="btn-sugerir-mision-ia" class="cv-btn" title="Responde unas preguntas y la red neuronal propone un escenario de simulación">
                <i class="fa-solid fa-brain"></i> Generar misión con IA
            </button>
            <button type="button" id="btn-nueva-mision" class="cv-btn cv-btn-primario">
                <i class="fa-solid fa-plus"></i> Misión
            </button>`)}

        <div class="cv-tabla-marco">
            <table class="cv-tabla">
                <thead>
                    <tr>
                        <th>Misión</th>
                        <th>Módulo</th>
                        <th>Dificultad</th>
                        <th>Remitente simulado</th>
                        <th>Origen</th>
                        <th style="text-align: right;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${misiones.length === 0 ? '<tr><td colspan="6" class="cv-secundario">No hay misiones publicadas.</td></tr>' : misiones.map(m => `
                        <tr>
                            <td>
                                <div class="cv-principal">${m.titulo}</div>
                                <div class="cv-secundario cv-truncar" style="max-width: 260px;" title="${(m.descripcion_corta || '').replace(/"/g, '&quot;')}">#${m.id_mision} · ${m.descripcion_corta || ''}</div>
                            </td>
                            <td><span class="cv-chip"><i class="fa-solid ${MisionesPage.metaDeVector(m.vector).icono}"></i> ${m.vector}</span></td>
                            <td class="cv-nowrap">${m.dificultad || 'Básico'}<div class="cv-secundario">${m.tiempo_limite || 120} s</div></td>
                            <td>
                                <div class="cv-truncar" style="max-width: 190px;" title="${(m.remitente_nombre || '').replace(/"/g, '&quot;')}">${m.remitente_nombre}</div>
                                <div class="cv-secundario cv-truncar" style="max-width: 190px;" title="${(m.remitente_identificador || '').replace(/"/g, '&quot;')}">${m.remitente_identificador}</div>
                            </td>
                            <td>${this.chipOrigen(m.origen)}</td>
                            <td class="cv-celda-acciones">
                                <button type="button" class="cv-btn btn-editar-mision" data-mision-id="${m.id_mision}">
                                    <i class="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button type="button" class="cv-btn cv-btn-icono cv-peligro btn-eliminar-mision" data-mision-id="${m.id_mision}" title="Eliminar misión" aria-label="Eliminar misión ${m.titulo}">
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
        ${this.encabezado('Personas', 'Asigna a cada persona un rol y un grupo de capacitación. La vulnerabilidad es la última estimada por la red neuronal.')}

        <div class="cv-tabla-marco">
            <table class="cv-tabla">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Vulnerabilidad</th>
                        <th>Rol</th>
                        <th>Grupo</th>
                        <th style="text-align: right;">Guardar</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios.map(u => {
                        const v = u.nivel_vulnerabilidad;
                        const clase = v >= 60 ? 'cv-chip-alto' : v >= 40 ? 'cv-chip-medio' : 'cv-chip-bajo';
                        return `
                        <tr>
                            <td>
                                <div class="cv-principal">${u.nombre}</div>
                                <div class="cv-secundario">${u.correo}</div>
                            </td>
                            <td><span class="cv-chip ${clase}">${v}%</span></td>
                            <td>
                                <select class="cv-select select-rol-usuario" data-user-id="${u.id_usuario}" aria-label="Rol de ${u.nombre}">
                                    <option value="Estudiante" ${u.rol === 'Estudiante' ? 'selected' : ''}>Estudiante</option>
                                    <option value="Administrador" ${u.rol === 'Administrador' ? 'selected' : ''}>Administrador</option>
                                </select>
                            </td>
                            <td>
                                <select class="cv-select select-grupo-usuario" data-user-id="${u.id_usuario}" aria-label="Grupo de ${u.nombre}">
                                    <option value="">Sin grupo</option>
                                    ${grupos.map(g => `
                                        <option value="${g.id_grupo}" ${u.id_grupo === g.id_grupo ? 'selected' : ''}>${g.nombre_grupo}</option>
                                    `).join('')}
                                </select>
                            </td>
                            <td class="cv-celda-acciones">
                                <button type="button" class="cv-btn btn-guardar-usuario-admin" data-user-id="${u.id_usuario}">
                                    <i class="fa-solid fa-floppy-disk"></i> Aplicar
                                </button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        `;
    },

    renderSeccionGrupos: function() {
        const grupos = AppModel.listaGruposAdmin || [];

        return `
        ${this.encabezado('Grupos', 'Organiza a los estudiantes por carrera, semestre o área. Las sugerencias de la IA se pueden calcular por grupo.')}

        <div class="cv-con-lateral" style="grid-template-columns: minmax(0, 1fr) 320px;">
            <div class="cv-tabla-marco">
                <table class="cv-tabla">
                    <thead>
                        <tr>
                            <th>Grupo</th>
                            <th>Miembros</th>
                            <th>Riesgo promedio</th>
                            <th style="text-align: right;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grupos.length === 0 ? '<tr><td colspan="4" class="cv-secundario">No hay grupos creados todavía.</td></tr>' : grupos.map(g => `
                            <tr>
                                <td>
                                    <div class="cv-principal">${g.nombre_grupo}</div>
                                    <div class="cv-secundario">${g.descripcion || 'Sin descripción registrada.'}</div>
                                </td>
                                <td>${g.total_usuarios || 0}</td>
                                <td>${g.riesgo_promedio || 0}%</td>
                                <td class="cv-celda-acciones">
                                    <button type="button" class="cv-btn cv-btn-icono cv-peligro btn-eliminar-grupo" data-grupo-id="${g.id_grupo}" title="Eliminar grupo" aria-label="Eliminar grupo ${g.nombre_grupo}">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="cv-panel">
                <h3><i class="fa-solid fa-folder-plus"></i> Nuevo grupo</h3>
                <form id="form-crear-grupo">
                    <div class="form-group">
                        <label for="grupo-nombre">Nombre del grupo o área</label>
                        <input type="text" id="grupo-nombre" class="form-input" placeholder="Ej: Ingeniería de Software - Semestre V" required minlength="3">
                    </div>
                    <div class="form-group">
                        <label for="grupo-desc">Objetivo de capacitación</label>
                        <textarea id="grupo-desc" class="form-input" rows="3" placeholder="Describe el enfoque de entrenamiento para este grupo..."></textarea>
                    </div>
                    <button type="submit" class="cv-btn cv-btn-primario" style="width: 100%; justify-content: center;">
                        <i class="fa-solid fa-plus"></i> Crear grupo
                    </button>
                </form>
            </div>
        </div>
        `;
    },

    claseNota: function(valor) {
        if (valor === undefined || valor === null) return 'cv-nota-vacia';
        return valor >= 60 ? 'cv-nota-alto' : valor >= 40 ? 'cv-nota-medio' : 'cv-nota-bajo';
    },

    filasLibro: function() {
        const filtro = this.filtroGrupoLibro;
        return (AppModel.libroCalificaciones || []).filter(f => !filtro || String(f.id_grupo) === String(filtro));
    },

    renderCalificaciones: function() {
        const filas = this.filasLibro();
        const conAnalisis = filas.filter(f => f.puntaje !== null && f.puntaje !== undefined);
        const promedio = (valores) => valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : null;
        const nota = (valor, sinPractica) => valor === undefined || valor === null
            ? '<span class="cv-nota cv-nota-vacia">—</span>'
            : `<span class="cv-nota ${this.claseNota(valor)} ${sinPractica ? 'cv-nota-sp' : ''}" title="${sinPractica ? 'Sin práctica en este vector: la red solo puede suponer el valor' : 'Riesgo estimado por la red'}">${valor}%</span>`;

        return `
        ${this.encabezado('Calificaciones', 'Riesgo estimado por la red neuronal para cada estudiante y vector, a partir de su último análisis. Más bajo es mejor.', `
            <select id="filtro-grupo-libro" class="cv-select" title="Filtrar por grupo">
                <option value="">Todos los grupos</option>
                ${(AppModel.listaGruposAdmin || []).map(g => `<option value="${g.id_grupo}" ${String(this.filtroGrupoLibro) === String(g.id_grupo) ? 'selected' : ''}>${g.nombre_grupo}</option>`).join('')}
            </select>
            <button type="button" id="btn-exportar-libro" class="cv-btn"><i class="fa-solid fa-file-csv"></i> Exportar CSV</button>`)}

        <div class="cv-tabla-marco">
            <table class="cv-tabla cv-libro">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        ${this.VECTORES.map(v => `<th class="cv-col-num">${v}</th>`).join('')}
                        <th class="cv-col-num">Global</th>
                        <th>Refuerzo sugerido por la red</th>
                        <th class="cv-col-num">Simulaciones</th>
                        <th class="cv-col-num">Cursos</th>
                    </tr>
                </thead>
                <tbody>
                    ${filas.length === 0 ? `<tr><td colspan="${this.VECTORES.length + 5}" class="cv-secundario">No hay estudiantes en este grupo.</td></tr>` : filas.map(f => {
                        const riesgo = f.riesgo_por_vector || {};
                        const sinPractica = Array.isArray(f.vectores_sin_practica) ? f.vectores_sin_practica : [];
                        const refuerzos = Array.isArray(f.refuerzos) ? f.refuerzos : [];
                        return `
                        <tr>
                            <td>
                                <div class="cv-principal">${f.nombre}</div>
                                <div class="cv-secundario">${f.nombre_grupo || 'Sin grupo'} · ${f.fecha_analisis ? 'análisis ' + new Date(f.fecha_analisis).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : 'sin análisis'}${f.modelo === 'reglas-v1' ? ' · <span title="El servicio de IA no estaba disponible; se calculó con la tasa de fallos">por reglas</span>' : ''}</div>
                            </td>
                            ${this.VECTORES.map(v => `<td class="cv-col-num">${nota(riesgo[v], sinPractica.includes(v))}</td>`).join('')}
                            <td class="cv-col-num">${nota(f.puntaje, false)}</td>
                            <td style="max-width: 190px;">${refuerzos.length ? refuerzos.map(r => `<span class="cv-chip cv-chip-ia" title="Confianza ${r.confianza}" style="margin: 2px;">${(AnalisisIAComponent.REFUERZOS[r.tipo] || {}).titulo || r.tipo}</span>`).join('') : '<span class="cv-secundario">—</span>'}</td>
                            <td class="cv-col-num cv-nowrap" title="Simulaciones realizadas y cuántas terminaron reportando la amenaza">${f.simulaciones} <span class="cv-secundario">(${f.simulaciones_reportadas} rep.)</span></td>
                            <td class="cv-col-num" title="Cursos aprobados">${f.cursos_aprobados}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
                ${conAnalisis.length > 0 ? `
                <tfoot>
                    <tr>
                        <td>Promedio (${conAnalisis.length} con análisis)</td>
                        ${this.VECTORES.map(v => `<td class="cv-col-num">${nota(promedio(conAnalisis.map(f => (f.riesgo_por_vector || {})[v]).filter(x => typeof x === 'number')), false)}</td>`).join('')}
                        <td class="cv-col-num">${nota(promedio(conAnalisis.map(f => f.puntaje)), false)}</td>
                        <td colspan="3"></td>
                    </tr>
                </tfoot>` : ''}
            </table>
            <div class="cv-leyenda">
                <span><i class="cv-muestra" style="background: #dcfce7;"></i> Bajo (menos de 40 %)</span>
                <span><i class="cv-muestra" style="background: #fef3c7;"></i> Medio (40 a 59 %)</span>
                <span><i class="cv-muestra" style="background: #fee2e2;"></i> Alto (60 % o más)</span>
                <span><i class="cv-muestra" style="background: #dcfce7; opacity: 0.55;"></i> Atenuado: vector sin práctica, valor supuesto por la red</span>
            </div>
        </div>
        `;
    },

    // CSV del libro de calificaciones con el filtro actual
    generarCSV: function() {
        const encabezado = ['Estudiante', 'Correo', 'Grupo', ...this.VECTORES, 'Global', 'Nivel', 'Refuerzos', 'Simulaciones', 'Reportadas', 'Cursos aprobados', 'Ultimo analisis'];
        const celda = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const filas = this.filasLibro().map(f => [
            f.nombre, f.correo, f.nombre_grupo || '',
            ...this.VECTORES.map(v => (f.riesgo_por_vector || {})[v] ?? ''),
            f.puntaje ?? '', f.nivel || '',
            (f.refuerzos || []).map(r => (AnalisisIAComponent.REFUERZOS[r.tipo] || {}).titulo || r.tipo).join(' | '),
            f.simulaciones, f.simulaciones_reportadas, f.cursos_aprobados,
            f.fecha_analisis ? new Date(f.fecha_analisis).toISOString().slice(0, 10) : ''
        ]);
        return [encabezado, ...filas].map(fila => fila.map(celda).join(',')).join('\r\n');
    },

    render: function() {
        const secciones = [
            { id: 'cursos', icono: 'fa-book-open', texto: 'Cursos', conteo: (AppModel.catalogoCursos || []).length },
            { id: 'simuladores', icono: 'fa-crosshairs', texto: 'Simuladores', conteo: (AppModel.catalogoMisiones || []).length },
            { id: 'usuarios', icono: 'fa-users', texto: 'Personas', conteo: (AppModel.listaUsuariosAdmin || []).length },
            { id: 'grupos', icono: 'fa-layer-group', texto: 'Grupos', conteo: (AppModel.listaGruposAdmin || []).length },
            { id: 'calificaciones', icono: 'fa-table-cells', texto: 'Calificaciones', conteo: (AppModel.libroCalificaciones || []).length }
        ];
        const activa = secciones.find(s => s.id === this.tabActiva) || secciones[0];

        let contenidoTab = '';
        if (activa.id === 'cursos') contenidoTab = this.renderTablaCursos();
        else if (activa.id === 'simuladores') contenidoTab = this.renderTablaSimuladores();
        else if (activa.id === 'usuarios') contenidoTab = this.renderTablaUsuarios();
        else if (activa.id === 'grupos') contenidoTab = this.renderSeccionGrupos();
        else contenidoTab = this.renderCalificaciones();

        return `
        <section id="gestion" class="view-section active cv-page">
            <nav class="cv-breadcrumb" aria-label="Ruta">
                <a href="#/dashboard">NeuroShield</a><i class="fa-solid fa-chevron-right cv-sep"></i>
                <span>Administración</span><i class="fa-solid fa-chevron-right cv-sep"></i>
                <span class="cv-actual">${activa.texto}</span>
            </nav>

            <div class="cv-curso">
                <nav class="cv-curso-nav" aria-label="Secciones de administración">
                    <div class="cv-curso-nav-titulo">Administración</div>
                    ${secciones.map(s => `
                        <button type="button" class="btn-tab-admin ${s.id === activa.id ? 'cv-activa' : ''}" data-tab="${s.id}" ${s.id === activa.id ? 'aria-current="page"' : ''}>
                            <span><i class="fa-solid ${s.icono}" style="width: 18px;"></i> ${s.texto}</span>
                            <span class="cv-conteo">${s.conteo}</span>
                        </button>
                    `).join('')}
                </nav>

                <div>${contenidoTab}</div>
            </div>
        </section>
        `;
    }
};
