const SidebarComponent = {
    render: function(rutaActual) {
        const isDash = rutaActual === '#/dashboard' ? 'active' : '';
        const isApr = rutaActual === '#/aprendizaje' ? 'active' : '';
        const isSim = rutaActual === '#/simulador' || rutaActual === '#/misiones' ? 'active' : '';
        const isRes = rutaActual === '#/resultados' ? 'active' : '';
        const isPerf = rutaActual === '#/perfil' ? 'active' : '';
        const isGest = rutaActual === '#/gestion' ? 'active' : '';

        return `
        <div id="drawer-overlay" class="drawer-overlay"></div>
        <aside id="side-drawer" class="drawer">
            <div class="drawer-header">
                <div class="logo-title">
                    <i class="fa-solid fa-shield-halved" style="color: var(--cisco-green);"></i> NeuroShield
                </div>
                <button id="close-drawer" class="icon-btn" style="border:none;"><i class="fa-solid fa-xmark"></i></button>
            </div>
            
            <nav class="nav-menu">
                <p class="nav-label">Plataforma</p>
                <a href="#/dashboard" class="nav-btn ${isDash}"><i class="fa-solid fa-house"></i> Inicio</a>
                <a href="#/aprendizaje" class="nav-btn ${isApr}"><i class="fa-solid fa-book-open"></i> Catálogo de Cursos</a>
                <a href="#/misiones" class="nav-btn ${isSim}"><i class="fa-solid fa-crosshairs"></i> Simuladores Prácticos</a>
                <a href="#/resultados" class="nav-btn ${isRes}"><i class="fa-solid fa-file-shield"></i> Análisis Forense</a>
                
                <p class="nav-label mt-4">Cuenta y Administración</p>
                <a href="#/perfil" class="nav-btn ${isPerf}"><i class="fa-solid fa-user-gear"></i> Mi Perfil y Seguridad</a>
                <a href="#/gestion" class="nav-btn ${isGest}"><i class="fa-solid fa-Sliders"></i> Gestión</a>
            </nav>

            <div style="margin-top:auto; padding-top:1rem; border-top: 1px solid var(--border);">
                <button class="nav-btn logout-btn w-100" style="color: var(--danger);">
                    <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
                </button>
            </div>
        </aside>
        `;
    }
};