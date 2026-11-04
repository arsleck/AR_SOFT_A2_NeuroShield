const SimuladorPage = {
    renderEscenarioSegunVector: function(mision) {
        const vector = mision.vector || 'Phishing';

        // 1. Escenario de Correo Electrónico (Phishing)
        if (vector === 'Phishing') {
            return `
            <div class="browser-window">
                <div class="browser-topbar">
                    <div class="browser-dots"><span></span><span></span><span></span></div>
                    <div class="browser-url"><i class="fa-solid fa-lock-open text-danger me-1"></i> Bandeja de Entrada Institucional - Vista Previa de Mensaje</div>
                </div>
                <div class="email-header">
                    <div class="email-row"><strong>De:</strong> ${mision.remitente_nombre} <span class="fake-email">&lt;${mision.remitente_identificador}&gt;</span></div>
                    <div class="email-row"><strong>Para:</strong> ${AppModel.estadoUsuario.correo || 'estudiante@universidad.edu.co'}</div>
                    <div class="email-row"><strong>Asunto:</strong> <span class="text-danger" style="font-weight: 700;">${mision.asunto_o_contexto}</span></div>
                </div>
                <div class="email-body">
                    <p style="margin-bottom: 1.25rem;">${mision.contenido_principal}</p>
                    <div style="text-align: center; margin: 2rem 0;">
                        <button type="button" id="btn-trampa-interna" class="fake-btn" style="border: none; cursor: pointer;" title="Destino real: ${mision.url_trampa}">
                            <i class="fa-solid fa-up-right-from-square me-1"></i> ${mision.texto_boton_trampa}
                        </button>
                        <div class="text-muted mt-2" style="font-size: 0.78rem; font-family: monospace;">
                            Destino del hipervínculo: ${mision.url_trampa}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        // 2. Escenario de Pantalla de Celular SMS (Smishing)
        if (vector === 'Smishing') {
            return `
            <div style="max-width: 420px; margin: 0 auto; background: #0f172a; border-radius: 32px; padding: 14px; box-shadow: var(--shadow-md); border: 4px solid #334155;">
                <div style="background: #ffffff; border-radius: 22px; overflow: hidden;">
                    <div style="background: #f1f5f9; padding: 1rem; border-bottom: 1px solid var(--border); text-align: center;">
                        <div style="width: 44px; height: 44px; border-radius: 50%; background: #cbd5e1; margin: 0 auto 0.4rem auto; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: #334155;">
                            <i class="fa-solid fa-comment-sms"></i>
                        </div>
                        <div style="font-weight: 800; font-size: 0.95rem;">${mision.remitente_identificador}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">Mensaje de Texto SMS &bull; Hoy</div>
                    </div>

                    <div style="padding: 1.5rem; background: #f8fafc; min-height: 230px; display: flex; flex-direction: column; justify-content: center;">
                        <div style="background: #e2e8f0; color: #0f172a; padding: 1rem 1.15rem; border-radius: 16px 16px 16px 4px; font-size: 0.92rem; line-height: 1.55;">
                            <strong style="display: block; margin-bottom: 0.35rem;">${mision.asunto_o_contexto}</strong>
                            ${mision.contenido_principal}
                            <div class="mt-2">
                                <button type="button" id="btn-trampa-interna" style="background: none; border: none; color: #0284c7; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.95rem; padding: 0;">
                                    ${mision.texto_boton_trampa}
                                </button>
                            </div>
                        </div>
                        <div class="text-muted text-center mt-3" style="font-size: 0.75rem;">
                            Redirección detectada: ${mision.url_trampa}
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        // 3. Escenario de Llamada Telefónica con Audio Sintetizado (Vishing)
        if (vector === 'Vishing') {
            return `
            <div style="max-width: 580px; margin: 0 auto; background: linear-gradient(145deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 20px; padding: 2rem; box-shadow: var(--shadow-md); text-align: center;">
                <span class="badge-pill" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">
                    <i class="fa-solid fa-phone-volume"></i> Llamada Entrante en Curso
                </span>
                <h2 style="font-size: 1.5rem; font-weight: 800; margin-top: 0.75rem; color: white;">${mision.remitente_nombre}</h2>
                <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.25rem;">Identificador en pantalla: ${mision.remitente_identificador}</p>

                <div style="margin-bottom: 1.25rem;">
                    <button type="button" id="btn-reproducir-vishing" class="btn-cisco-primary" style="margin: 0 auto;">
                        <i class="fa-solid fa-volume-high"></i> Escuchar Voz del Supuesto Asesor
                    </button>
                </div>

                <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 1.25rem; text-align: left; font-size: 0.92rem; line-height: 1.6; color: #f1f5f9;">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--cisco-green); font-weight: 800; margin-bottom: 0.4rem;">
                        <i class="fa-solid fa-wave-square"></i> Transcripción en vivo de la llamada:
                    </div>
                    "${mision.contenido_principal}"
                </div>

                <div class="mt-3">
                    <button type="button" id="btn-trampa-interna" class="btn btn-danger" style="border-radius: 999px; padding: 0.65rem 1.4rem;">
                        <i class="fa-solid fa-key"></i> ${mision.texto_boton_trampa}
                    </button>
                </div>
            </div>
            `;
        }

        // 4. Escenario de Chat Corporativo / WhatsApp (Ingeniería Social)
        return `
        <div class="browser-window" style="max-width: 680px; margin: 0 auto;">
            <div style="background: #075e54; color: white; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                        <i class="fa-solid fa-user-tie"></i>
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 0.95rem;">${mision.remitente_nombre}</div>
                        <div style="font-size: 0.76rem; opacity: 0.85;">${mision.remitente_identificador}</div>
                    </div>
                </div>
                <span class="badge-pill" style="background: rgba(255,255,255,0.18); color: white;">Chat Directo</span>
            </div>

            <div style="background: #efeae2; padding: 1.75rem; min-height: 220px;">
                <div style="background: #ffffff; border-radius: 0 12px 12px 12px; padding: 1.15rem; max-width: 88%; box-shadow: var(--shadow-sm); line-height: 1.6; font-size: 0.93rem;">
                    <div style="font-weight: 800; color: #075e54; font-size: 0.8rem; margin-bottom: 0.35rem;">
                        ${mision.asunto_o_contexto}
                    </div>
                    <p>${mision.contenido_principal}</p>
                    <div class="mt-3">
                        <button type="button" id="btn-trampa-interna" class="btn btn-primary" style="font-size: 0.85rem;">
                            <i class="fa-solid fa-share-nodes"></i> ${mision.texto_boton_trampa}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    render: function() {
        const mision = AppModel.catalogoMisiones.find(m => String(m.id_mision) === String(AppModel.misionActivaId)) || AppModel.catalogoMisiones[0];

        return `
        <section id="simulador" class="view-section active">
            <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 1rem;">
                <div>
                    <a href="#/misiones" class="btn mb-2" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-arrow-left"></i> Cambiar de Misión
                    </a>
                    <h2 style="font-size: 1.5rem; font-weight: 800;">${mision.titulo}</h2>
                    <p class="text-muted">Vector evaluado: <strong>${mision.vector}</strong> &bull; Toma una decisión antes de que finalice el contador.</p>
                </div>
                <div class="timer-box">
                    <i class="fa-solid fa-stopwatch"></i>
                    <span id="time-display">Quedan ${mision.tiempo_limite || 120}s</span>
                </div>
            </div>

            ${this.renderEscenarioSegunVector(mision)}

            <div class="card mt-4 text-center">
                <h4 class="mb-2" style="font-weight: 800;">¿Cómo decides responder ante esta comunicación?</h4>
                <p class="text-muted mb-3" style="font-size: 0.85rem;">Tu elección recalculará tu índice de vulnerabilidad en tiempo real.</p>
                <div class="action-buttons">
                    <button id="btn-caer" class="btn btn-danger">
                        <i class="fa-solid fa-triangle-exclamation"></i> Acceder / Seguir Instrucciones del Mensaje
                    </button>
                    <button id="btn-ignorar" class="btn btn-warning">
                        <i class="fa-solid fa-eye-slash"></i> Ignorar y Cerrar Mensaje
                    </button>
                    <button id="btn-reportar" class="btn-cisco-primary">
                        <i class="fa-solid fa-shield-halved"></i> Reportar como Intento de Ataque
                    </button>
                </div>
            </div>
        </section>
        `;
    }
};