const MisionesPage = {
    render: function() {
        return `
        <section id="misiones" class="view-section active">
            <div class="view-header mb-4" style="background: var(--surface); padding: 2rem; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">
                <div class="flex-between align-items-center">
                    <div>
                        <h1 style="font-size: 2rem; color: var(--text-main); font-weight: 800; letter-spacing: -0.5px;"><i class="fa-solid fa-map-location-dot text-primary me-2"></i> Centro de Misiones</h1>
                        <p class="text-muted mt-2" style="font-size: 1.05rem;">Selecciona un escenario interactivo. A medida que superes las pruebas, el Motor de IA desbloqueará nuevos retos.</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: block; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; margin-bottom: 5px;">Progreso Global</span>
                        <div style="width: 150px; height: 8px; background: var(--bg-main); border-radius: 4px; overflow: hidden; border: 1px solid var(--border);">
                            <div style="width: 33%; height: 100%; background: var(--success); border-radius: 4px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.8rem;">
                
                <!-- Misión 1: Phishing (DESBLOQUEADA) -->
                <div class="card mission-card" onclick="window.location.hash='#/simulador'" style="padding: 2.5rem; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; font-size: 8rem; color: var(--bg-main); z-index: 0; transform: rotate(-15deg);"><i class="fa-solid fa-envelope-open-text"></i></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="width: 75px; height: 75px; background: var(--primary-bg); color: var(--primary); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 1.5rem; box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);">
                            <i class="fa-solid fa-envelope-open-text"></i>
                        </div>
                        <h3 style="margin-bottom: 0.5rem; font-weight: 800; font-size: 1.4rem;">Misión 1: Phishing</h3>
                        <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem; line-height: 1.6;">Intercepción de correo institucional fraudulento. Identifica las señales de urgencia del ICETEX.</p>
                        <div class="flex-between">
                            <span style="background: var(--success-bg); color: var(--success); padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem;"><i class="fa-solid fa-unlock me-1"></i> Desbloqueada</span>
                            <span style="color: var(--primary); font-weight: 700; font-size: 0.9rem;">Jugar <i class="fa-solid fa-arrow-right"></i></span>
                        </div>
                    </div>
                </div>

                <!-- Misión 2: Smishing (BLOQUEADA) -->
                <div class="card mission-card locked" style="padding: 2.5rem; position: relative;">
                    <div style="width: 75px; height: 75px; background: var(--bg-main); color: var(--text-muted); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 1.5rem; border: 1px solid var(--border);">
                        <i class="fa-solid fa-mobile-screen"></i>
                    </div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 800; font-size: 1.4rem;">Misión 2: Smishing</h3>
                    <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem; line-height: 1.6;">Ataque por mensaje de texto (SMS). Suplantación de empresas de mensajería locales (4-7-2).</p>
                    <span style="background: var(--bg-main); color: var(--text-muted); padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; border: 1px solid var(--border);"><i class="fa-solid fa-lock me-1"></i> Requiere Nivel 2</span>
                </div>

                <!-- Misión 3: Vishing (BLOQUEADA) -->
                <div class="card mission-card locked" style="padding: 2.5rem; position: relative;">
                    <div style="width: 75px; height: 75px; background: var(--bg-main); color: var(--text-muted); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 1.5rem; border: 1px solid var(--border);">
                        <i class="fa-solid fa-headset"></i>
                    </div>
                    <h3 style="margin-bottom: 0.5rem; font-weight: 800; font-size: 1.4rem;">Misión 3: Vishing</h3>
                    <p style="color: var(--text-muted); font-size: 1rem; margin-bottom: 2rem; line-height: 1.6;">Ingeniería social telefónica. Evita entregar tu código de verificación bancario a un falso asesor.</p>
                    <span style="background: var(--bg-main); color: var(--text-muted); padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; border: 1px solid var(--border);"><i class="fa-solid fa-lock me-1"></i> Requiere Nivel 3</span>
                </div>

            </div>
        </section>
        `;
    }
};