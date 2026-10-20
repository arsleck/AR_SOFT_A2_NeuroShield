const LoginPage = {
    render: function() {
        return `
        <div id="login-view" class="login-wrapper">
            <div class="login-card">
                <div class="login-logo-container">
                    <div class="login-logo"><i class="fa-solid fa-shield-virus"></i></div>
                </div>
                <h2>Bienvenido a NeuroShield</h2>
                <p>Ingresa para continuar tu capacitación</p>

                <!-- CAJA DE ERROR VISUAL (Oculta por defecto) -->
                <div id="login-error-box" style="display: none; background: var(--danger-bg); color: var(--danger); padding: 0.8rem; border-radius: 8px; margin-bottom: 1.2rem; font-size: 0.85rem; border: 1px solid var(--danger); text-align: left; font-weight: 500;">
                    <i class="fa-solid fa-circle-exclamation" style="margin-right: 5px;"></i> <span id="login-error-text"></span>
                </div>

                <form id="login-form">
                    <div class="form-group">
                        <label>Correo Institucional</label>
                        <input type="email" id="login-correo" class="form-input" required placeholder="usuario@institucion.edu.co">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="login-password" class="form-input" required placeholder="Tu contraseña">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 mt-3">
                        Ingresar al Sistema <i class="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                </form>
                <div style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
                    ¿No tienes cuenta? <a href="#/registro" style="color: var(--primary); font-weight: 600; text-decoration: none;">Regístrate aquí</a>
                </div>
            </div>
        </div>
        `;
    }
};