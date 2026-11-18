const LoginPage = {
    render: function(modoInicial = 'login') {
        const esRegistro = modoInicial === 'registro' || window.location.hash === '#/registro';
        const modo = esRegistro ? 'registro' : 'login';

        return `
        <section id="login" class="view-section active">
            <div class="ns-auth-wrapper">
                <div class="ns-auth-card" id="ns-auth-card" data-mode="${modo}">
                    
                    <!-- Encabezado Minimalista -->
                    <div class="ns-auth-brand">
                        <div class="ns-auth-logo">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <h1 style="font-size: 1.38rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em;" id="ns-auth-title">
                            ${esRegistro ? 'Crea tu cuenta' : 'Bienvenido a NeuroShield'}
                        </h1>
                        <p class="text-muted" style="font-size: 0.83rem; margin-top: 0.25rem;" id="ns-auth-subtitle">
                            ${esRegistro ? 'Inicia tu entrenamiento adaptativo en ciberseguridad' : 'Ingresa tus credenciales para continuar tu entrenamiento'}
                        </p>
                    </div>

                    <!-- Conmutador Animado (Iniciar Sesión / Registrarse) -->
                    <div class="ns-auth-tabs" role="tablist">
                        <div class="ns-auth-glider"></div>
                        <a href="#/login" class="ns-auth-tab" data-target="login">
                            Iniciar Sesión
                        </a>
                        <a href="#/registro" class="ns-auth-tab" data-target="registro">
                            Crear Cuenta
                        </a>
                    </div>

                    <!-- Contenedor Deslizante con Ambos Formularios -->
                    <div class="ns-auth-viewport">
                        <div class="ns-auth-track">
                            
                            <!-- PANEL 1: INICIAR SESIÓN -->
                            <div class="ns-auth-pane ns-auth-pane-login">
                                <div id="login-error-box" style="display: none; background: var(--danger-bg); color: #991b1b; border: 1px solid #fecaca; padding: 0.65rem 0.85rem; border-radius: 10px; font-size: 0.8rem; margin-bottom: 1rem;">
                                    <i class="fa-solid fa-circle-exclamation me-1"></i>
                                    <span id="login-error-text">Error al iniciar sesión</span>
                                </div>

                                <form id="login-form" autocomplete="on">
                                    <div class="ns-input-group">
                                        <label for="login-correo">Correo electrónico</label>
                                        <div class="ns-input-field">
                                            <input type="email" id="login-correo" placeholder="nombre@universidad.edu.co" required>
                                            <i class="fa-regular fa-envelope"></i>
                                        </div>
                                    </div>

                                    <div class="ns-input-group">
                                        <label for="login-password">Contraseña</label>
                                        <div class="ns-input-field">
                                            <input type="password" id="login-password" placeholder="••••••••" required>
                                            <i class="fa-solid fa-lock"></i>
                                        </div>
                                    </div>

                                    <button type="submit" class="ns-auth-submit">
                                        Ingresar al Sistema <i class="fa-solid fa-arrow-right ms-2"></i>
                                    </button>
                                </form>
                            </div>

                            <!-- PANEL 2: CREAR CUENTA (REGISTRO) -->
                            <div class="ns-auth-pane ns-auth-pane-registro">
                                <div id="reg-error-box" style="display: none; background: var(--danger-bg); color: #991b1b; border: 1px solid #fecaca; padding: 0.65rem 0.85rem; border-radius: 10px; font-size: 0.8rem; margin-bottom: 1rem;">
                                    <i class="fa-solid fa-circle-exclamation me-1"></i>
                                    <span id="reg-error-text">Error al crear la cuenta</span>
                                </div>

                                <form id="registro-form" autocomplete="on">
                                    <div class="ns-input-group">
                                        <label for="reg-nombre">Nombre completo</label>
                                        <div class="ns-input-field">
                                            <input type="text" id="reg-nombre" placeholder="Ej. Diego Nicolás Cuervo" required>
                                            <i class="fa-regular fa-user"></i>
                                        </div>
                                    </div>

                                    <div class="ns-input-group">
                                        <label for="reg-correo">Correo electrónico</label>
                                        <div class="ns-input-field">
                                            <input type="email" id="reg-correo" placeholder="nombre@universidad.edu.co" required>
                                            <i class="fa-regular fa-envelope"></i>
                                        </div>
                                    </div>

                                    <div class="ns-input-group">
                                        <label for="reg-password">Contraseña (mínimo 6 caracteres)</label>
                                        <div class="ns-input-field">
                                            <input type="password" id="reg-password" placeholder="••••••••" required>
                                            <i class="fa-solid fa-key"></i>
                                        </div>
                                    </div>

                                    <button type="submit" class="ns-auth-submit">
                                        Registrarse <i class="fa-solid fa-arrow-right ms-2"></i>
                                    </button>
                                </form>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
        `;
    }
};