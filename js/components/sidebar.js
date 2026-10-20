const SidebarComponent = {
    render: function(rutaActual) {
        // Se valida la ruta para pintar el botón activo
        const isDash = rutaActual === '#/dashboard' ? 'active' : '';
        const isSim = rutaActual === '#/simulador' ? 'active' : '';
        const isRes = rutaActual === '#/resultados' ? 'active' : '';
        const isGest = rutaActual === '#/gestion' ? 'active' : '';

        return `
        <aside class="sidebar">
            <div class="logo">
                <div class="logo-icon"><i class="fa-solid fa-shield-virus"></i></div>
                <span class="logo-text">NeuroShield</span>
            </div>
            
            <nav class="nav-menu mt-4">
                <p class="nav-label">Capacitación</p>
                <a href="#/dashboard" class="nav-btn ${isDash}"><i class="fa-solid fa-chart-pie"></i> Mi Progreso</a>
                <a href="#/simulador" class="nav-btn ${isSim}"><i class="fa-solid fa-gamepad"></i> Simulador</a>
                <a href="#/resultados" class="nav-btn ${isRes}" id="nav-resultados"><i class="fa-solid fa-file-shield"></i> Último Reporte</a>
                
                <p class="nav-label mt-4">Administración</p>
                <a href="#" class="nav-btn locked" onclick="alert('Acceso denegado: Privilegios insuficientes.')">
                    <i class="fa-solid fa-users-gear"></i> Gestión
                    <i class="fa-solid fa-lock ms-auto lock-icon"></i>
                </a>
            </nav>

            <div class="user-profile-bot mt-4">
                <div class="avatar-sm"><img src="https://ui-avatars.com/api/?name=Usuario+Ejemplo&background=6366f1&color=fff&bold=true" alt="Avatar"></div>
                <div class="user-info-text">
                    <span class="user-name">Usuario Ejemplo</span>
                    <span class="user-role">Estudiante</span>
                </div>
            </div>
        </aside>
        `;
    }
};