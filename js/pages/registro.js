const RegistroPage = {
    render: function() {
        return `
        <div id="registro-view" class="login-wrapper">
            <div class="login-card">
                <div class="login-logo-container">
                    <div class="login-logo"><i class="fa-solid fa-user-plus"></i></div>
                </div>
                <h2>Crear Cuenta</h2>
                <p>Regístrate para iniciar tu capacitación</p>

                <!-- CAJA DE ERROR VISUAL (Oculta por defecto) -->
                <div id="reg-error-box" style="display: none; background: var(--danger-bg); color: var(--danger); padding: 0.8rem; border-radius: 8px; margin-bottom: 1.2rem; font-size: 0.85rem; border: 1px solid var(--danger); text-align: left; font-weight: 500;">
                    <i class="fa-solid fa-circle-exclamation" style="margin-right: 5px;"></i> <span id="reg-error-text"></span>
                </div>

                <form id="registro-form">
                    <div class="form-group">
                        <label>Nombre Completo</label>
                        <!-- Restricción HTML: Solo letras y espacios, mínimo 3 -->
                        <input type="text" id="reg-nombre" class="form-input" required minlength="3" pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$" title="El nombre solo debe contener letras" placeholder="Ej: Juan Pérez">
                    </div>
                    <div class="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" id="reg-correo" class="form-input" required placeholder="usuario@institucion.edu.co">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" id="reg-password" class="form-input" required minlength="6" placeholder="Mínimo 6 caracteres">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 mt-3">
                        Registrarse <i class="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                </form>
                <div style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted);">
                    ¿Ya tienes cuenta? <a href="#/login" style="color: var(--primary); font-weight: 600; text-decoration: none;">Inicia sesión aquí</a>
                </div>
            </div>
        </div>
        `;
    }
};