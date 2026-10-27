const TopbarComponent = {
    render: function(titulo, rutaActual) {
        const nombre = AppModel.estadoUsuario.nombre || 'Estudiante';
        return `
        <header class="topbar">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
                <a href="#/dashboard" class="topbar-brand">
                    <i class="fa-solid fa-shield-halved" style="color: var(--cisco-green); font-size: 1.45rem;"></i>
                    <span style="font-size: 1.18rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.3px;">NeuroShield</span>
                </a>

                <button id="open-drawer" class="cisco-explore-btn" title="Abrir menú de navegación">
                    <i class="fa-solid fa-grip" style="color: var(--primary);"></i> Explorar <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem;"></i>
                </button>

                <nav class="topbar-links">
                    <a href="#/dashboard" class="top-link ${rutaActual === '#/dashboard' ? 'active' : ''}">Inicio</a>
                    <a href="#/aprendizaje" class="top-link ${rutaActual === '#/aprendizaje' ? 'active' : ''}">Catálogo de Cursos</a>
                    <a href="#/misiones" class="top-link ${rutaActual === '#/misiones' || rutaActual === '#/simulador' ? 'active' : ''}">Simuladores</a>
                </nav>
            </div>

            <div class="topbar-actions">
                <a href="#/perfil" class="user-pill" style="border-radius: 999px; padding: 0.4rem 0.95rem; border-color: ${rutaActual === '#/perfil' ? 'var(--cisco-green)' : 'var(--border)'}; background: ${rutaActual === '#/perfil' ? 'var(--cisco-green-bg)' : 'var(--bg-main)'};" title="Ir a Mi Perfil y Estado de Seguridad">
                    <i class="fa-solid fa-circle-user" style="font-size: 1.2rem; color: var(--primary);"></i>
                    <div style="line-height: 1.1; text-align: left;">
                        <div style="font-weight: 700; font-size: 0.8rem; color: var(--text-main);">${nombre}</div>
                        <div style="font-size: 0.68rem; color: var(--text-muted);">Mi Perfil</div>
                    </div>
                </a>
                <button class="icon-btn logout-btn" title="Cerrar Sesión" style="border-radius: 50%;">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </header>
        `;
    }
};