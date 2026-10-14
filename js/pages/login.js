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
                <form id="login-form">
                    <div class="form-group">
                        <label>Correo Institucional</label>
                        <input type="email" class="form-input" required value="usuario@institucion.edu.co">
                    </div>
                    <div class="form-group">
                        <label>Contraseña</label>
                        <input type="password" class="form-input" required value="123456">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 mt-3">
                        Ingresar al Sistema <i class="fa-solid fa-arrow-right ms-2"></i>
                    </button>
                </form>
            </div>
        </div>
        `;
    }
};