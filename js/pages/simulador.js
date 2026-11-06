const SimuladorPage = {
    modoActivo: 'reaccion', // 'reaccion' | 'redflags' | 'urlinspector' | 'dialogo' | 'protocolo'

    // =========================================================================
    // INTERFACES HIPERREALISTAS SEGÚN EL VECTOR Y LA VARIANTE DEL ATAQUE
    // =========================================================================
    renderEscenarioSegunVector: function(mision) {
        const vector = mision.vector || 'Phishing';
        const iniciales = (mision.remitente_nombre || 'AT').substring(0, 2).toUpperCase();
        const modoRedFlags = this.modoActivo === 'redflags';
        const cursorStyle = modoRedFlags ? 'cursor: pointer; transition: all 0.2s ease;' : '';
        const hintRedFlags = modoRedFlags ? `
            <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 0.65rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.84rem; display: flex; justify-content: space-between; align-items: center;">
                <span><i class="fa-solid fa-hand-pointer me-1"></i> <strong>Modo Interactivo:</strong> Haz clic directamente sobre las partes sospechosas del mensaje o márcalas en la lista inferior.</span>
                <span class="badge-pill" id="contador-redflags-vivo" style="background: #fef3c7; color: #92400e;">0 / 3 fallos marcados</span>
            </div>
        ` : '';

        // ---------------------------------------------------------------------
        // 1. PHISHING: CLIENTE DE CORREO CORPORATIVO (ESTILO OUTLOOK / GMAIL)
        // ---------------------------------------------------------------------
        if (vector === 'Phishing') {
            return `
            ${hintRedFlags}
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12); max-width: 860px; margin: 0 auto;">
                
                <!-- Barra Superior del Cliente de Correo -->
                <div style="background: #0f172a; color: #f8fafc; padding: 0.65rem 1.25rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="browser-dots"><span></span><span></span><span></span></div>
                        <span style="font-weight: 700; color: #e2e8f0;"><i class="fa-solid fa-envelope text-primary me-1"></i> NeuroMail WebClient</span>
                    </div>
                    <div style="background: #1e293b; padding: 0.25rem 0.85rem; border-radius: 6px; font-family: monospace; font-size: 0.75rem; color: #94a3b8;">
                        <i class="fa-solid fa-shield-halved text-warning me-1"></i> Filtro SmartScreen: Inspección requerida
                    </div>
                </div>

                <!-- Barra de Acciones de Bandeja de Entrada -->
                <div style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 0.55rem 1.25rem; display: flex; gap: 1.25rem; font-size: 0.8rem; color: #475569;">
                    <span><i class="fa-solid fa-reply"></i> Responder</span>
                    <span><i class="fa-solid fa-reply-all"></i> Responder a todos</span>
                    <span><i class="fa-solid fa-share"></i> Reenviar</span>
                    <span style="margin-left: auto; color: #dc2626; font-weight: 700;"><i class="fa-solid fa-ban"></i> Correo Externo No Verificado</span>
                </div>

                <!-- Cabecera Realista del Correo -->
                <div style="padding: 1.35rem 1.75rem; border-bottom: 1px solid #f1f5f9;">
                    <!-- Asunto (Zona Red Flag #2) -->
                    <div class="zona-redflag-clicable" data-flag-index="2" style="padding: 0.35rem 0.5rem; border-radius: 6px; margin-bottom: 0.85rem; ${cursorStyle}" title="Haz clic si consideras sospechoso el asunto">
                        <span style="background: #fef2f2; color: #dc2626; font-size: 0.7rem; font-weight: 800; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #fecaca; margin-right: 0.5rem; text-transform: uppercase;">Prioridad Alta</span>
                        <h3 style="display: inline; font-size: 1.22rem; font-weight: 800; color: #0f172a;">${mision.asunto_o_contexto}</h3>
                    </div>

                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
                        <!-- Remitente (Zona Red Flag #1) -->
                        <div class="zona-redflag-clicable" data-flag-index="0" style="display: flex; align-items: center; gap: 0.85rem; padding: 0.4rem 0.6rem; border-radius: 8px; ${cursorStyle}" title="Haz clic si detectas suplantación en el remitente">
                            <div style="width: 44px; height: 44px; border-radius: 50%; background: #e2e8f0; color: #0f172a; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; border: 2px solid #cbd5e1;">
                                ${iniciales}
                            </div>
                            <div>
                                <div style="font-weight: 800; font-size: 0.95rem; color: #0f172a;">
                                    ${mision.remitente_nombre}
                                    <span style="font-weight: 600; font-size: 0.82rem; color: #dc2626; background: #fef2f2; padding: 0.1rem 0.45rem; border-radius: 4px; font-family: monospace; margin-left: 4px;">
                                        &lt;${mision.remitente_identificador}&gt;
                                    </span>
                                </div>
                                <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">
                                    Para: <strong>${AppModel.estadoUsuario.correo || 'usuario@institucion.edu.co'}</strong> &bull; <span style="color: #d97706;"><i class="fa-solid fa-triangle-exclamation"></i> Firma SPF/DKIM no coincide con dominio oficial</span>
                                </div>
                            </div>
                        </div>

                        <!-- Fecha/Hora normal -->
                        <div style="font-size: 0.78rem; color: #64748b; text-align: right;">
                            <div>Hoy, 10:42 AM (GMT-5)</div>
                            <div style="font-family: monospace; font-size: 0.72rem;">TLS 1.2 Sin Certificar</div>
                        </div>
                    </div>
                </div>

                <!-- Cuerpo del Correo -->
                <div style="padding: 1.75rem 2rem; background: #ffffff; color: #1e293b; font-size: 0.95rem; line-height: 1.7;">
                    <p style="margin-bottom: 1.25rem; white-space: pre-line;">${mision.contenido_principal}</p>

                    <!-- Tarjeta de Archivo Adjunto Sospechoso -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; display: inline-flex; align-items: center; gap: 0.85rem; margin-bottom: 1.5rem;">
                        <i class="fa-solid fa-file-shield text-danger" style="font-size: 1.5rem;"></i>
                        <div style="font-size: 0.8rem;">
                            <div style="font-weight: 700; color: #0f172a;">Notificacion_Oficial_${mision.id_mision}09.pdf.html</div>
                            <div style="color: #64748b;">248 KB &bull; Doble extensión detectada</div>
                        </div>
                    </div>

                    <!-- Botón / Enlace Trampa (Zona Red Flag #3) -->
                    <div class="zona-redflag-clicable" data-flag-index="4" style="text-align: center; margin: 1rem 0; padding: 1rem; border-radius: 8px; background: #f8fafc; border: 1px dashed #cbd5e1; ${cursorStyle}">
                        <button type="button" id="btn-trampa-interna" class="fake-btn" style="border: none; cursor: pointer; background: #0284c7; color: white; padding: 0.85rem 1.85rem; border-radius: 6px; font-weight: 700; font-size: 0.95rem; box-shadow: 0 4px 6px rgba(2, 132, 199, 0.25);">
                            <i class="fa-solid fa-up-right-from-square me-1"></i> ${mision.texto_boton_trampa}
                        </button>
                        <div style="margin-top: 0.75rem; font-family: monospace; font-size: 0.78rem; color: #475569; background: #e2e8f0; display: inline-block; padding: 0.25rem 0.65rem; border-radius: 4px;">
                            <i class="fa-solid fa-globe me-1 text-danger"></i> Destino real (Hover URL): <strong>${mision.url_trampa}</strong>
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; font-size: 0.75rem; color: #94a3b8;">
                        Aviso legal automático: Este mensaje fue enviado desde un servidor de retransmisión no autenticado. No responda a esta dirección.
                    </div>
                </div>
            </div>
            `;
        }

        // ---------------------------------------------------------------------
        // 2. SMISHING: SMARTPHONE REALISTA (APP DE MENSAJES SMS)
        // ---------------------------------------------------------------------
        if (vector === 'Smishing') {
            return `
            ${hintRedFlags}
            <div style="max-width: 390px; margin: 0 auto; background: #090d16; border-radius: 44px; padding: 14px; box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.35); border: 4px solid #334155; position: relative;">
                
                <!-- Pantalla Interna del Teléfono -->
                <div style="background: #f8fafc; border-radius: 32px; overflow: hidden; display: flex; flex-direction: column; min-height: 490px;">
                    
                    <!-- Barra de Estado del Celular + Notch -->
                    <div style="background: #ffffff; padding: 0.55rem 1.25rem 0.35rem 1.25rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; font-weight: 800; color: #0f172a;">
                        <span>9:41</span>
                        <div style="width: 76px; height: 18px; background: #090d16; border-radius: 999px;"></div>
                        <div style="display: flex; gap: 0.35rem; align-items: center;">
                            <i class="fa-solid fa-signal"></i>
                            <span>5G</span>
                            <i class="fa-solid fa-battery-three-quarters"></i>
                        </div>
                    </div>

                    <!-- Cabecera del Remitente SMS (Zona Red Flag #1) -->
                    <div class="zona-redflag-clicable" data-flag-index="0" style="background: #ffffff; padding: 0.65rem 1rem; border-bottom: 1px solid #e2e8f0; text-align: center; ${cursorStyle}">
                        <div style="width: 44px; height: 44px; border-radius: 50%; background: #e2e8f0; color: #475569; margin: 0 auto 0.3rem auto; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                            <i class="fa-solid fa-user-secret"></i>
                        </div>
                        <div style="font-weight: 800; font-size: 0.92rem; color: #0f172a;">${mision.remitente_identificador}</div>
                        <div style="font-size: 0.7rem; color: #dc2626; font-weight: 700;">
                            <i class="fa-solid fa-triangle-exclamation"></i> Número desconocido &bull; No está en tus contactos
                        </div>
                    </div>

                    <!-- Área de Conversación SMS -->
                    <div style="padding: 1.25rem; flex: 1; display: flex; flex-direction: column; justify-content: flex-start; gap: 0.75rem; background: #f1f5f9;">
                        <div style="text-align: center; font-size: 0.7rem; color: #64748b; font-weight: 600;">
                            Mensaje de texto SMS &bull; Hoy 9:40 AM
                        </div>

                        <!-- Globo del Mensaje (Zona Red Flag #2) -->
                        <div class="zona-redflag-clicable" data-flag-index="2" style="background: #ffffff; color: #0f172a; padding: 0.95rem 1.1rem; border-radius: 18px 18px 18px 4px; font-size: 0.88rem; line-height: 1.5; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; ${cursorStyle}">
                            <div style="font-weight: 800; color: #b91c1c; font-size: 0.78rem; text-transform: uppercase; margin-bottom: 0.3rem;">
                                ${mision.asunto_o_contexto}
                            </div>
                            <p style="margin-bottom: 0.65rem;">${mision.contenido_principal}</p>

                            <!-- Tarjeta de Previsualización del Enlace Trampa (Zona Red Flag #3) -->
                            <div class="zona-redflag-clicable" data-flag-index="4" style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; margin-top: 0.5rem; ${cursorStyle}">
                                <div style="background: #e2e8f0; padding: 0.45rem 0.75rem; font-size: 0.7rem; font-family: monospace; color: #dc2626; font-weight: 700;">
                                    <i class="fa-solid fa-link"></i> ${mision.url_trampa}
                                </div>
                                <div style="padding: 0.65rem 0.75rem;">
                                    <button type="button" id="btn-trampa-interna" style="background: none; border: none; color: #0284c7; font-weight: 800; text-decoration: underline; cursor: pointer; font-size: 0.88rem; padding: 0; text-align: left;">
                                        ${mision.texto_boton_trampa} <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem;"></i>
                                    </button>
                                    <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">Enlace acortado externo sin certificado institucional</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Barra Inferior de Respuesta SMS -->
                    <div style="background: #ffffff; padding: 0.65rem 0.9rem; border-top: 1px solid #e2e8f0; display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 0.8rem;">
                            <i class="fa-solid fa-plus"></i>
                        </div>
                        <div style="flex: 1; background: #f1f5f9; border-radius: 999px; padding: 0.4rem 0.85rem; font-size: 0.76rem; color: #94a3b8;">
                            Mensaje de texto...
                        </div>
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--cisco-green); display: flex; align-items: center; justify-content: center; color: #0f172a; font-size: 0.75rem;">
                            <i class="fa-solid fa-arrow-up"></i>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        // ---------------------------------------------------------------------
        // 3. VISHING: INTERFAZ DE LLAMADA TELEFÓNICA ACTIVA EN SMARTPHONE
        // ---------------------------------------------------------------------
        if (vector === 'Vishing') {
            return `
            ${hintRedFlags}
            <div style="max-width: 440px; margin: 0 auto; background: linear-gradient(165deg, #090d16 0%, #1e293b 100%); color: white; border-radius: 38px; padding: 1.75rem 1.5rem; box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.45); border: 4px solid #334155; text-align: center;">
                
                <!-- Cabecera de Llamada y Alerta de Spoofing (Zona Red Flag #1) -->
                <div class="zona-redflag-clicable" data-flag-index="0" style="padding: 0.5rem; border-radius: 12px; ${cursorStyle}">
                    <span style="background: rgba(239, 68, 68, 0.22); border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase;">
                        <i class="fa-solid fa-triangle-exclamation"></i> Alerta: Posible Caller ID Spoofing
                    </span>
                    <h2 style="font-size: 1.45rem; font-weight: 800; margin-top: 0.65rem; color: white;">${mision.remitente_nombre}</h2>
                    <p style="color: #94a3b8; font-size: 0.88rem; font-family: monospace;">${mision.remitente_identificador}</p>
                    <div style="color: var(--cisco-green); font-size: 0.8rem; font-weight: 700; margin-top: 0.2rem;">
                        <i class="fa-solid fa-circle" style="font-size: 0.5rem; vertical-align: middle;"></i> Llamada en curso &bull; 01:14
                    </div>
                </div>

                <!-- Botón de Altavoz / Reproducir Voz Realista -->
                <div style="margin: 1rem 0;">
                    <button type="button" id="btn-reproducir-vishing" class="btn-cisco-primary" style="margin: 0 auto; padding: 0.65rem 1.35rem; font-size: 0.85rem;">
                        <i class="fa-solid fa-volume-high"></i> Activar Altavoz (Escuchar Voz del Asesor)
                    </button>
                </div>

                <!-- Transcripción en Vivo del Guion del Atacante (Zona Red Flag #2) -->
                <div class="zona-redflag-clicable" data-flag-index="2" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; padding: 1.1rem; text-align: left; font-size: 0.88rem; line-height: 1.55; color: #f1f5f9; margin-bottom: 1.1rem; ${cursorStyle}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <span style="font-size: 0.7rem; text-transform: uppercase; color: var(--cisco-green); font-weight: 800;">
                            <i class="fa-solid fa-wave-square"></i> Transcripción de voz en tiempo real
                        </span>
                        <span style="font-size: 0.7rem; color: #fca5a5;">${mision.asunto_o_contexto}</span>
                    </div>
                    "${mision.contenido_principal}"
                </div>

                <!-- Simulación de Teclado para Dictar/Digitar OTP o CVV (Zona Red Flag #3) -->
                <div class="zona-redflag-clicable" data-flag-index="4" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 0.85rem; ${cursorStyle}">
                    <div style="font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.5rem;">
                        El interlocutor solicita por teléfono: <strong>${mision.url_trampa}</strong>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 0.6rem; flex-wrap: wrap;">
                        <button type="button" id="btn-trampa-interna" class="btn btn-danger" style="border-radius: 999px; padding: 0.55rem 1.15rem; font-size: 0.82rem;">
                            <i class="fa-solid fa-key"></i> ${mision.texto_boton_trampa}
                        </button>
                    </div>
                </div>
            </div>
            `;
        }

        // ---------------------------------------------------------------------
        // 4. INGENIERÍA SOCIAL: CHAT CORPORATIVO / WHATSAPP WEB REALISTA
        // ---------------------------------------------------------------------
        return `
        ${hintRedFlags}
        <div class="browser-window" style="max-width: 720px; margin: 0 auto; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.16);">
            
            <!-- Cabecera Estilo WhatsApp Oficial (Zona Red Flag #1) -->
            <div class="zona-redflag-clicable" data-flag-index="0" style="background: #075e54; color: white; padding: 0.9rem 1.35rem; display: flex; align-items: center; justify-content: space-between; ${cursorStyle}">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                    <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 1.15rem; font-weight: 800;">
                        ${iniciales}
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 0.96rem; display: flex; align-items: center; gap: 0.4rem;">
                            ${mision.remitente_nombre}
                            <span style="background: #dc2626; color: white; font-size: 0.65rem; padding: 0.1rem 0.45rem; border-radius: 4px; text-transform: uppercase;">Sin insignia oficial</span>
                        </div>
                        <div style="font-size: 0.76rem; opacity: 0.9; font-family: monospace;">${mision.remitente_identificador} &bull; en línea</div>
                    </div>
                </div>
                <div style="display: flex; gap: 1rem; opacity: 0.85; font-size: 0.95rem;">
                    <i class="fa-solid fa-video"></i>
                    <i class="fa-solid fa-phone"></i>
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </div>
            </div>

            <!-- Fondo del Chat con Aviso de Seguridad -->
            <div style="background: #efeae2; padding: 1.35rem 1.75rem; min-height: 250px; display: flex; flex-direction: column; gap: 0.9rem;">
                
                <!-- Aviso Amarillo de Cuenta Externa -->
                <div style="background: #fef3c7; color: #92400e; padding: 0.5rem 0.9rem; border-radius: 8px; font-size: 0.76rem; text-align: center; max-width: 90%; margin: 0 auto; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <i class="fa-solid fa-lock me-1"></i> Este número no pertenece al directorio oficial de tu organización. Nunca compartas contraseñas ni códigos por chat.
                </div>

                <!-- Burbuja del Mensaje de Ingeniería Social (Zona Red Flag #2) -->
                <div class="zona-redflag-clicable" data-flag-index="2" style="background: #ffffff; border-radius: 0 14px 14px 14px; padding: 1rem 1.15rem; max-width: 88%; box-shadow: 0 1px 3px rgba(0,0,0,0.08); line-height: 1.55; font-size: 0.92rem; position: relative; ${cursorStyle}">
                    <div style="font-weight: 800; color: #075e54; font-size: 0.78rem; margin-bottom: 0.3rem;">
                        ~ ${mision.remitente_nombre} &bull; <span style="color: #dc2626;">${mision.asunto_o_contexto}</span>
                    </div>
                    <p style="color: #0f172a; margin-bottom: 0.75rem;">${mision.contenido_principal}</p>

                    <!-- Acción o Enlace Solicitado en el Chat (Zona Red Flag #3) -->
                    <div class="zona-redflag-clicable" data-flag-index="4" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.7rem 0.9rem; ${cursorStyle}">
                        <button type="button" id="btn-trampa-interna" class="btn btn-primary" style="font-size: 0.82rem; padding: 0.5rem 1rem; width: 100%; justify-content: center;">
                            <i class="fa-solid fa-share-nodes"></i> ${mision.texto_boton_trampa}
                        </button>
                        <div style="font-size: 0.72rem; color: #64748b; font-family: monospace; text-align: center; margin-top: 0.35rem;">
                            Acción solicitada: ${mision.url_trampa}
                        </div>
                    </div>

                    <div style="text-align: right; font-size: 0.68rem; color: #64748b; margin-top: 0.35rem;">
                        10:44 AM <i class="fa-solid fa-check-double" style="color: #38bdf8;"></i>
                    </div>
                </div>
            </div>
        </div>
        `;
    },

    // =========================================================================
    // PANEL INFERIOR CON LAS 5 DINÁMICAS DE SIMULACIÓN
    // =========================================================================
    renderPanelDinamica: function(mision) {
        const modo = this.modoActivo || 'reaccion';

        // MODO 1: REACCIÓN TÁCTICA
        if (modo === 'reaccion') {
            return `
            <div class="card mt-4 text-center">
                <span class="badge-pill mb-2"><i class="fa-solid fa-bolt"></i> Dinámica 1: Reacción Táctica</span>
                <h4 class="mb-1" style="font-weight: 800;">¿Qué acción ejecutas frente a esta comunicación?</h4>
                <p class="text-muted mb-3" style="font-size: 0.85rem;">Elige la respuesta operativa correcta antes de que se agote el tiempo.</p>
                <div class="action-buttons">
                    <button type="button" id="btn-caer" class="btn btn-danger">
                        <i class="fa-solid fa-triangle-exclamation"></i> ${mision.texto_boton_trampa || 'Seguir instrucciones del mensaje'}
                    </button>
                    <button type="button" id="btn-ignorar" class="btn btn-warning">
                        <i class="fa-solid fa-eye-slash"></i> Ignorar y Eliminar Mensaje
                    </button>
                    <button type="button" id="btn-reportar" class="btn-cisco-primary">
                        <i class="fa-solid fa-shield-halved"></i> Reportar al Equipo de Ciberseguridad
                    </button>
                </div>
            </div>
            `;
        }

        // MODO 2: CAZADOR DE RED FLAGS (Sincronizado con clics en el mensaje de arriba)
        if (modo === 'redflags') {
            return `
            <div class="card mt-4">
                <div class="flex-between mb-2" style="flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                        <span class="badge-pill"><i class="fa-solid fa-magnifying-glass-location"></i> Dinámica 2: Cazador de Red Flags</span>
                        <h4 class="mt-1" style="font-weight: 800;">Señala exactamente dónde está fallando el mensaje</h4>
                        <p class="text-muted" style="font-size: 0.84rem;">Haz clic en las zonas sospechosas del mensaje de arriba o marca las <strong>3 anomalías reales</strong> en esta lista (evita marcar los 2 elementos legítimos):</p>
                    </div>
                </div>

                <div style="display: grid; gap: 0.65rem; margin: 1.15rem 0;">
                    <label class="quiz-option-label" style="cursor: pointer;">
                        <input type="checkbox" class="chk-redflag" data-flag-index="0" data-es-fallo="true">
                        <span><strong>1. Identificador del Remitente:</strong> <code>${mision.remitente_identificador}</code> (Dominio externo, spoofing o número no oficial).</span>
                    </label>
                    <label class="quiz-option-label" style="cursor: pointer;">
                        <input type="checkbox" class="chk-redflag" data-flag-index="1" data-es-fallo="false">
                        <span><strong>2. Formato de Texto e Idioma:</strong> El mensaje utiliza codificación estándar en español legible para el usuario.</span>
                    </label>
                    <label class="quiz-option-label" style="cursor: pointer;">
                        <input type="checkbox" class="chk-redflag" data-flag-index="2" data-es-fallo="true">
                        <span><strong>3. Manipulación Psicológica:</strong> <em>"${mision.asunto_o_contexto}"</em> (Sentido de urgencia extrema, amenaza de bloqueo o abuso de autoridad).</span>
                    </label>
                    <label class="quiz-option-label" style="cursor: pointer;">
                        <input type="checkbox" class="chk-redflag" data-flag-index="3" data-es-fallo="false">
                        <span><strong>4. Hora y Zona Horaria de Recepción:</strong> Recibido en horario hábil estándar de Colombia (GMT-5).</span>
                    </label>
                    <label class="quiz-option-label" style="cursor: pointer;">
                        <input type="checkbox" class="chk-redflag" data-flag-index="4" data-es-fallo="true">
                        <span><strong>5. Acción / Destino Trampa:</strong> <code>${mision.url_trampa}</code> (${mision.texto_boton_trampa} fuera del canal oficial seguro).</span>
                    </label>
                </div>

                <button type="button" id="btn-evaluar-redflags" class="btn-cisco-primary w-100" style="justify-content: center;">
                    <i class="fa-solid fa-microscope"></i> Confirmar Hallazgos de Red Flags
                </button>
            </div>
            `;
        }

        // MODO 3: AUDITORÍA FORENSE DE ENLACES Y CABECERAS
        if (modo === 'urlinspector') {
            return `
            <div class="card mt-4">
                <span class="badge-pill mb-2"><i class="fa-solid fa-link-slash"></i> Dinámica 3: Laboratorio de Inspección de URLs y Cabeceras</span>
                <h4 style="font-weight: 800;">Dictamina la autenticidad técnica de los artefactos del mensaje</h4>
                <p class="text-muted mb-3" style="font-size: 0.84rem;">Analiza la URL de destino y la cabecera técnica para emitir el dictamen forense correcto:</p>

                <div style="background: #0f172a; color: #e2e8f0; font-family: monospace; padding: 1rem; border-radius: 8px; margin-bottom: 1.15rem; font-size: 0.82rem; line-height: 1.6;">
                    <div><span style="color: #6cc04a;">[HEADER-FROM]:</span> ${mision.remitente_nombre} &lt;${mision.remitente_identificador}&gt;</div>
                    <div><span style="color: #38bdf8;">[TARGET-HREF]:</span> ${mision.url_trampa}</div>
                    <div><span style="color: #f59e0b;">[AUTH-SPF/DKIM]:</span> SOFTFAIL (El servidor de origen no pertenece a la institución)</div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="mb-3">
                    <div class="form-group mb-0">
                        <label>1. ¿Qué anomalía presenta el destino <code>${mision.url_trampa}</code>?</label>
                        <select id="url-audit-1" class="form-input">
                            <option value="">-- Selecciona tu diagnóstico --</option>
                            <option value="correcto">Apunta a un dominio falso, IP expuesta o canal no oficial (Phishing/Spoofing)</option>
                            <option value="falso1">Es un subdominio institucional 100% legítimo y certificado</option>
                            <option value="falso2">El único problema es que la página carga lento</option>
                        </select>
                    </div>
                    <div class="form-group mb-0">
                        <label>2. ¿Qué significa el resultado <code>SPF/DKIM: SOFTFAIL</code> en la cabecera?</label>
                        <select id="url-audit-2" class="form-input">
                            <option value="">-- Selecciona tu diagnóstico --</option>
                            <option value="falso1">Que el mensaje tiene prioridad alta verificada</option>
                            <option value="correcto">Que el remitente fue suplantado desde un servidor no autorizado</option>
                            <option value="falso2">Que el archivo adjunto está comprimido en ZIP</option>
                        </select>
                    </div>
                </div>

                <button type="button" id="btn-evaluar-url" class="btn-cisco-primary w-100" style="justify-content: center;">
                    <i class="fa-solid fa-file-shield"></i> Emitir Dictamen de Auditoría
                </button>
            </div>
            `;
        }

        // MODO 4: ESCUDO DE DIÁLOGO
        if (modo === 'dialogo') {
            return `
            <div class="card mt-4">
                <span class="badge-pill mb-2"><i class="fa-solid fa-reply-all"></i> Dinámica 4: Escudo de Respuesta Activa</span>
                <h4 style="font-weight: 800;">El remitente espera tu respuesta inmediata. ¿Cuál de estas acciones eliges?</h4>
                <p class="text-muted mb-3" style="font-size: 0.84rem;">Selecciona la única postura que aplica el protocolo de verificación por canal alterno (Zero Trust):</p>

                <div class="quiz-options mb-3">
                    <label class="quiz-option-label">
                        <input type="radio" name="radio_dialogo_sim" value="caer">
                        <span><strong>Opción A:</strong> "Ya mismo ingreso al enlace / entrego el código solicitado para evitar que bloqueen mi cuenta."</span>
                    </label>
                    <label class="quiz-option-label">
                        <input type="radio" name="radio_dialogo_sim" value="ignorar">
                        <span><strong>Opción B:</strong> "Le envío solo mi número de cédula por este mismo medio para que verifique quién soy antes de darle la clave."</span>
                    </label>
                    <label class="quiz-option-label">
                        <input type="radio" name="radio_dialogo_sim" value="reportar">
                        <span><strong>Opción C:</strong> Corto toda comunicación por este medio, no interactúo con el enlace, verifico de forma independiente en el portal/línea oficial y reporto el intento.</span>
                    </label>
                </div>

                <button type="button" id="btn-evaluar-dialogo" class="btn-cisco-primary w-100" style="justify-content: center;">
                    <i class="fa-solid fa-paper-plane"></i> Ejecutar Respuesta Elegida
                </button>
            </div>
            `;
        }

        // MODO 5: PROTOCOLO DE CONTENCIÓN SOC
        return `
        <div class="card mt-4">
            <span class="badge-pill mb-2"><i class="fa-solid fa-list-ol"></i> Dinámica 5: Protocolo de Contención de Incidentes (SOC)</span>
            <h4 style="font-weight: 800;">Simulación de Crisis: Un compañero acaba de caer en este ataque (${mision.vector}).</h4>
            <p class="text-muted mb-3" style="font-size: 0.84rem;">Asigna el orden correcto (del <strong>Paso 1 al Paso 4</strong>) para contener la brecha de seguridad:</p>

            <div style="display: grid; gap: 0.75rem;" class="mb-3">
                <div style="display: flex; align-items: center; gap: 0.85rem; background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                    <select class="form-input soc-step-select" data-correct-order="1" style="width: 120px; font-weight: 800;">
                        <option value="2">Paso 2</option>
                        <option value="1" selected>Paso 1</option>
                        <option value="4">Paso 4</option>
                        <option value="3">Paso 3</option>
                    </select>
                    <span><strong>Desconectar / Aislar el dispositivo</strong> o cerrar inmediatamente la sesión comprometida para cortar la comunicación con el atacante.</span>
                </div>

                <div style="display: flex; align-items: center; gap: 0.85rem; background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                    <select class="form-input soc-step-select" data-correct-order="2" style="width: 120px; font-weight: 800;">
                        <option value="1">Paso 1</option>
                        <option value="2" selected>Paso 2</option>
                        <option value="3">Paso 3</option>
                        <option value="4">Paso 4</option>
                    </select>
                    <span><strong>Cambiar credenciales y revocar tokens MFA</strong> desde otro dispositivo limpio y seguro.</span>
                </div>

                <div style="display: flex; align-items: center; gap: 0.85rem; background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                    <select class="form-input soc-step-select" data-correct-order="3" style="width: 120px; font-weight: 800;">
                        <option value="4">Paso 4</option>
                        <option value="1">Paso 1</option>
                        <option value="3" selected>Paso 3</option>
                        <option value="2">Paso 2</option>
                    </select>
                    <span><strong>Reportar el incidente al SOC / Mesa de TI o Banco</strong> adjuntando el remitente (<code>${mision.remitente_identificador}</code>) y la URL maliciosa.</span>
                </div>

                <div style="display: flex; align-items: center; gap: 0.85rem; background: var(--bg-main); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border);">
                    <select class="form-input soc-step-select" data-correct-order="4" style="width: 120px; font-weight: 800;">
                        <option value="3">Paso 3</option>
                        <option value="4" selected>Paso 4</option>
                        <option value="1">Paso 1</option>
                        <option value="2">Paso 2</option>
                    </select>
                    <span><strong>Monitorear movimientos inusuales</strong> en cuentas o accesos durante las siguientes 72 horas y aplicar bloqueo preventivo en el firewall.</span>
                </div>
            </div>

            <button type="button" id="btn-evaluar-protocolo" class="btn-cisco-primary w-100" style="justify-content: center;">
                <i class="fa-solid fa-check-double"></i> Ejecutar Protocolo de Contención
            </button>
        </div>
        `;
    },

    render: function() {
        const mision = AppModel.catalogoMisiones.find(m => String(m.id_mision) === String(AppModel.misionActivaId)) || AppModel.catalogoMisiones[0];
        const modos = [
            { id: 'reaccion', icono: 'fa-bolt', texto: '1. Reacción Táctica' },
            { id: 'redflags', icono: 'fa-magnifying-glass-location', texto: '2. Cazador Red Flags' },
            { id: 'urlinspector', icono: 'fa-link-slash', texto: '3. Auditor de URLs' },
            { id: 'dialogo', icono: 'fa-reply-all', texto: '4. Escudo Diálogo' },
            { id: 'protocolo', icono: 'fa-list-ol', texto: '5. Protocolo SOC' }
        ];

        return `
        <section id="simulador" class="view-section active">
            <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 1rem;">
                <div>
                    <a href="#/misiones" class="btn mb-2" style="padding: 0.4rem 0.85rem; font-size: 0.8rem;">
                        <i class="fa-solid fa-arrow-left"></i> Volver a los 4 Simuladores
                    </a>
                    <h2 style="font-size: 1.5rem; font-weight: 800;">${mision.titulo}</h2>
                    <p class="text-muted">Vector: <strong>${mision.vector}</strong> &bull; Alterna entre las 5 dinámicas de evaluación:</p>
                </div>
                <div class="timer-box">
                    <i class="fa-solid fa-stopwatch"></i>
                    <span id="time-display">Quedan ${mision.tiempo_limite || 120}s</span>
                </div>
            </div>

            <!-- Barra Interactiva para Cambiar entre los 5 Modos en Vivo -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; background: var(--surface); padding: 0.6rem; border-radius: 10px; border: 1px solid var(--border);">
                ${modos.map(m => `
                    <button type="button" class="btn btn-cambiar-modo-sim ${this.modoActivo === m.id ? 'btn-cisco-primary' : ''}" data-modo="${m.id}" style="padding: 0.45rem 0.9rem; font-size: 0.8rem; border-radius: 999px;">
                        <i class="fa-solid ${m.icono}"></i> ${m.texto}
                    </button>
                `).join('')}
            </div>

            <!-- Escenario Visual Realista -->
            ${this.renderEscenarioSegunVector(mision)}

            <!-- Panel Dinámico de Evaluación -->
            ${this.renderPanelDinamica(mision)}
        </section>
        `;
    }
};