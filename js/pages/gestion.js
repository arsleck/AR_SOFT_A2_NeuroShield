const GestionPage = {
    render: function() {
        return `
        <section id="gestion" class="view-section active">
            <div class="flex-between mb-4">
                <div>
                    <h1 style="font-size: 1.8rem; color: var(--text-main); font-weight: 700; letter-spacing: -0.5px;">Gestión de Usuarios</h1>
                    <p class="text-muted mt-1">Administración del sistema, roles y métricas de estudiantes.</p>
                </div>
                <button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuevo Usuario</button>
            </div>

            <div class="card" style="padding: 0; overflow: hidden; border-radius: 16px;">
                <!-- Barra de herramientas de la tabla -->
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; gap: 1rem; background: var(--bg-main);">
                    <input type="text" class="form-input" placeholder="Buscar por nombre o correo..." style="max-width: 350px; background: var(--surface);">
                    <button class="btn" style="background: var(--surface); border: 1px solid var(--border);"><i class="fa-solid fa-filter"></i> Filtrar</button>
                </div>
                
                <!-- Tabla de datos -->
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--surface-hover); font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
                            <tr>
                                <th style="padding: 1.2rem 1.5rem; font-weight: 600;">Usuario</th>
                                <th style="padding: 1.2rem 1.5rem; font-weight: 600;">Rol</th>
                                <th style="padding: 1.2rem 1.5rem; font-weight: 600;">Vulnerabilidad</th>
                                <th style="padding: 1.2rem 1.5rem; font-weight: 600;">Estado</th>
                                <th style="padding: 1.2rem 1.5rem; font-weight: 600; text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody style="font-size: 0.9rem;">
                            <!-- Fila 1: Estudiante -->
                            <tr style="border-bottom: 1px solid var(--border); transition: background 0.2s;">
                                <td style="padding: 1rem 1.5rem;">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div class="avatar-sm"><img src="https://ui-avatars.com/api/?name=Usuario+Ejemplo&background=f4f4f5&color=09090b" alt="Avatar"></div>
                                        <div>
                                            <div style="font-weight: 600; color: var(--text-main);">Usuario Ejemplo</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">usuario@institucion.edu.co</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 1rem 1.5rem;"><span class="badge-soft">Estudiante</span></td>
                                <td style="padding: 1rem 1.5rem;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <div style="width: 60px; height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; border: 1px solid var(--border);">
                                            <div style="width: 65%; height: 100%; background: var(--warning);"></div>
                                        </div>
                                        <span style="font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">65%</span>
                                    </div>
                                </td>
                                <td style="padding: 1rem 1.5rem;"><span style="color: var(--success); font-weight: 600; font-size: 0.8rem;"><i class="fa-solid fa-circle" style="font-size: 0.4rem; margin-right: 5px; vertical-align: middle;"></i>Activo</span></td>
                                <td style="padding: 1rem 1.5rem; text-align: right;">
                                    <button class="icon-btn" style="display: inline-flex;"><i class="fa-solid fa-pen"></i></button>
                                    <button class="icon-btn" style="display: inline-flex; color: var(--danger);"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>

                            <!-- Fila 2: Administrador -->
                            <tr>
                                <td style="padding: 1rem 1.5rem;">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div class="avatar-sm"><img src="https://ui-avatars.com/api/?name=Admin+SOC&background=10b981&color=fff" alt="Avatar"></div>
                                        <div>
                                            <div style="font-weight: 600; color: var(--text-main);">Admin SOC</div>
                                            <div style="font-size: 0.8rem; color: var(--text-muted);">admin.secops@institucion.edu.co</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 1rem 1.5rem;"><span class="badge-soft" style="background: var(--text-main); color: var(--surface);">Administrador</span></td>
                                <td style="padding: 1rem 1.5rem;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <div style="width: 60px; height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; border: 1px solid var(--border);">
                                            <div style="width: 10%; height: 100%; background: var(--success);"></div>
                                        </div>
                                        <span style="font-weight: 600; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">10%</span>
                                    </div>
                                </td>
                                <td style="padding: 1rem 1.5rem;"><span style="color: var(--success); font-weight: 600; font-size: 0.8rem;"><i class="fa-solid fa-circle" style="font-size: 0.4rem; margin-right: 5px; vertical-align: middle;"></i>Activo</span></td>
                                <td style="padding: 1rem 1.5rem; text-align: right;">
                                    <button class="icon-btn" style="display: inline-flex;"><i class="fa-solid fa-pen"></i></button>
                                    <button class="icon-btn" style="display: inline-flex; color: var(--text-muted); opacity: 0.5; cursor: not-allowed;"><i class="fa-solid fa-trash"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        `;
    }
};