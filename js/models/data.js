// === EL MODELO (MVC) ===
// Responsable de mantener el estado de la aplicación y la lógica de datos.

const AppModel = {
    estadoUsuario: {
        nombre: "Usuario Ejemplo",
        correo: "usuario@institucion.edu.co",
        riesgoActual: 65,
        historialPuntajes: [85, 78, 85, 65]
    },
    
    // Método que simula la evaluación del motor IA
    calcularNuevoRiesgo: function(accion) {
        let impacto = 0;
        let reporte = [];

        if (accion === 'caer') {
            impacto = 25;
            reporte = ["<span class='error'>[CRÍTICO] Infracción detectada. Usuario accedió a enlace malicioso.</span>", "Impacto: +25% Vulnerabilidad."];
        } else if (accion === 'ignorar' || accion === 'tiempo') {
            impacto = -5;
            reporte = ["<span class='warn'>[WARN] Amenaza ignorada. Faltó reporte al equipo de seguridad.</span>", "Impacto: -5% Vulnerabilidad."];
        } else if (accion === 'reportar') {
            impacto = -30;
            reporte = ["<span class='ok'>[OK] Excelente. Amenaza reportada y bloqueada en el firewall.</span>", "Impacto: -30% Vulnerabilidad."];
        }

        this.estadoUsuario.riesgoActual = Math.max(0, Math.min(100, this.estadoUsuario.riesgoActual + impacto));
        this.estadoUsuario.historialPuntajes.push(this.estadoUsuario.riesgoActual);
        
        return {
            nuevoRiesgo: this.estadoUsuario.riesgoActual,
            historial: this.estadoUsuario.historialPuntajes,
            logs: reporte
        };
    }
};