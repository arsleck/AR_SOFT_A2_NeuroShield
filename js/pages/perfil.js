const PerfilPage = {
    render: function() {
        const usuario = AppModel.estadoUsuario;
        const nombre = usuario.nombre || "Estudiante";
        const correo = usuario.correo || "usuario@institucion.edu.co";
        const rol = usuario.rol || "Estudiante";
        const iniciales = nombre.substring(0, 2).toUpperCase();
        const riesgo = usuario.riesgoActual;
        const diagCompletado = usuario.diagnosticoCompletado;
        const nivelConocimiento = usuario.nivelConocimiento;

        let estadoRiesgoTexto = "Riesgo Moderado";
        let estadoRiesgoClase = "status-warning";
        if (riesgo < 40) {
            estadoRiesgoTexto = "Riesgo Bajo (Seguro)";
            estadoRiesgoClase = "status-success";
        } else if (riesgo >= 60) {
            estadoRiesgoTexto = "Riesgo Alto (Atención)";
            estadoRiesgoClase = "status-danger";
        }

        const listaRecomendaciones = (usuario.recomendacionesActuales || [])
            .map(rec => `
                <li class="rec-item">
                    <i class="fa-solid ${rec.icono} ${rec.color}"></i>
                    <span>${rec.texto}</span>
                </li>
            `).join('');

        return `
        <section id="perfil" class="view-section active">
            
            <!-- Encabezado del Perfil -->
            <div class="learning-hero mb-4">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div class="avatar-large" style="background: var(--cisco-green); color: #0f172a;">${iniciales}</div>
                    <div>
                        <span class="badge-pill">
                            <i class="fa-solid fa-id-badge"></i> Cuenta de ${rol}
                        </span>
                        <h1 style="font-size: 1.75rem; font-weight: 800; margin-top: 0.35rem;">${nombre}</h1>
                        <p class="text-muted" style="font-size: 0.9rem;">${correo}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button id="btn-abrir-diagnostico-perfil" class="btn-cisco-primary">
                        <i class="fa-solid fa-clipboard-check"></i>
                        ${diagCompletado ? 'Repetir Diagnóstico' : 'Realizar Diagnóstico'}
                    </button>
                </div>
            </div>

            <div class="profile-layout-grid">
                
                <!-- COLUMNA IZQUIERDA: FORMULARIO PARA CONSULTAR Y ACTUALIZAR DATOS DEL USUARIO -->
                <div class="card">
                    <h3 class="mb-2"><i class="fa-solid fa-user-pen text-primary me-1"></i> Mis Datos Personales</h3>
                    <p class="text-muted mb-3" style="font-size: 0.85rem;">
                        Consulta o actualiza tu información registrada en la plataforma.
                    </p>

                    <div id="perfil-msg-box" style="display: none; padding: 0.8rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; font-weight: 600;"></div>

                    <form id="form-actualizar-perfil">
                        <div class="form-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="perfil-nombre" class="form-input" value="${nombre}" required minlength="3">
                        </div>

                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="perfil-correo" class="form-input" value="${correo}" required>
                        </div>

                        <div class="form-group">
                            <label>Rol en la Plataforma</label>
                            <input type="text" class="form-input" value="${rol}" disabled style="background: var(--bg-main); color: var(--text-muted); cursor: not-allowed;">
                        </div>

                        <div class="form-group">
                            <label>Nueva Contraseña <span class="text-muted" style="font-weight: 400;">(Opcional: déjalo en blanco para mantener la actual)</span></label>
                            <input type="password" id="perfil-password" class="form-input" minlength="6" placeholder="Mínimo 6 caracteres">
                        </div>

                        <button type="submit" id="btn-guardar-perfil" class="btn-cisco-primary w-100 mt-2" style="justify-content: center;">
                            <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
                        </button>
                    </form>
                </div>

                <!-- COLUMNA DERECHA: ESTADO DE SEGURIDAD Y RECOMENDACIONES PERSONALIZADAS -->
                <div style="display: grid; gap: 1.5rem;">
                    
                    <div class="card security-status-card">
                        <div class="flex-between mb-2" style="flex-wrap: wrap; gap: 0.5rem;">
                            <div>
                                <h3><i class="fa-solid fa-shield-halved text-primary me-1"></i> Mi Estado de Seguridad</h3>
                                <p class="text-muted" style="font-size: 0.84rem;">
                                    Diagnóstico: <strong>${nivelConocimiento}</strong>
                                </p>
                            </div>
                            <div class="security-score-badge ${estadoRiesgoClase}">
                                <i class="fa-solid fa-gauge-high"></i>
                                <span>Promedio: <strong id="score-text">${riesgo}%</strong> (${estadoRiesgoTexto})</span>
                            </div>
                        </div>

                        <div class="chart-legend-bar mb-2">
                            <span><i class="fa-solid fa-circle" style="color: #10b981;"></i> 0-39% Seguro</span>
                            <span><i class="fa-solid fa-circle" style="color: #f59e0b;"></i> 40-59% Moderado</span>
                            <span><i class="fa-solid fa-circle" style="color: #ef4444;"></i> 60-100% Alto Riesgo</span>
                        </div>

                        <div class="chart-container" style="height: 210px;">
                            <canvas id="vulnChart"></canvas>
                        </div>
                    </div>

                    <div class="card">
                        <h3><i class="fa-solid fa-compass text-primary me-1"></i> Mis Recomendaciones de Entrenamiento</h3>
                        <p class="text-muted mt-1 mb-3" style="font-size: 0.85rem;">
                            Sugerencias adaptadas según tus resultados en cuestionarios y simulaciones:
                        </p>
                        <ul class="rec-list">
                            ${listaRecomendaciones}
                        </ul>
                    </div>

                </div>

            </div>
        </section>
        `;
    }
};