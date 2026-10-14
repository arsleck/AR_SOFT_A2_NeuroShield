const TopbarComponent = {
    render: function(tituloPagina) {
        return `
        <header class="topbar">
            <div class="topbar-left">
                <h2 class="page-title">${tituloPagina}</h2>
            </div>
            <div class="topbar-actions">
                <div class="notification-btn tooltip-trigger">
                    <i class="fa-regular fa-bell"></i>
                    <span class="notification-badge">1</span>
                    <div class="tooltip-box">Tienes 1 simulación pendiente</div>
                </div>
                <a href="#/login" class="logout-btn tooltip-trigger">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    <div class="tooltip-box">Cerrar Sesión</div>
                </a>
            </div>
        </header>
        `;
    }
};