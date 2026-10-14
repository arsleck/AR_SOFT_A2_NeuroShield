const SimuladorPage = {
    render: function() {
        return `
        <section id="simulador" class="view-section active">
            <div class="flex-between align-items-center">
                <div>
                    <h1 style="font-size: 1.5rem; color: var(--text-main);">Entorno de Simulación</h1>
                    <p class="text-muted">Analiza el siguiente escenario y toma una decisión.</p>
                </div>
                <div class="timer-box"><i class="fa-regular fa-clock"></i> <span id="time-display">Quedan 180s</span></div>
            </div>

            <div class="browser-window mt-4">
                <div class="browser-topbar">
                    <div class="browser-dots"><span></span><span></span><span></span></div>
                    <div class="browser-url"><i class="fa-solid fa-lock text-success" style="margin-right: 8px;"></i> https://mail.institucion.edu.co/inbox</div>
                </div>
                <div class="email-content">
                    <div class="email-header">
                        <div class="email-row"><strong>De:</strong> Dpto. Financiero <span class="fake-email">&lt;soporte@finanzas-renovacion-col.org&gt;</span></div>
                        <div class="email-row"><strong>Asunto:</strong> <span class="text-danger" style="font-weight: 600;">AVISO: Suspensión de desembolso para semestre en curso</span></div>
                    </div>
                    <div class="email-body">
                        <p>Estimado estudiante,</p>
                        <p>El comité ha pausado temporalmente su desembolso institucional por inconsistencias en su validación de identidad.</p>
                        <p>Para evitar la cancelación definitiva de su cupo, actualice su pagaré digitalizado en un plazo máximo de 4 horas ingresando al siguiente portal seguro:</p>
                        <div class="text-center" style="margin: 2.5rem 0;">
                            <a href="#" class="fake-btn" onclick="event.preventDefault()">Actualizar Pagaré Institucional</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mt-4 text-center">
                <h3 class="mb-4">¿Qué acción tomarías frente a este correo?</h3>
                <div class="action-buttons">
                    <button class="btn btn-danger" id="btn-caer"><i class="fa-solid fa-arrow-pointer"></i> Hacer clic en el enlace</button>
                    <button class="btn btn-warning" id="btn-ignorar"><i class="fa-solid fa-trash"></i> Ignorar y borrar</button>
                    <button class="btn btn-success" id="btn-reportar"><i class="fa-solid fa-shield-check"></i> Reportar como Phishing</button>
                </div>
            </div>
        </section>
        `;
    }
};