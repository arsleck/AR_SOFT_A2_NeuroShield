const MisionesPage = {
    metaVectores: [
        {
            vector: 'Phishing',
            titulo: 'Simulador de Phishing (Correo)',
            icono: 'fa-envelope-open-text',
            descripcion: 'Bandeja de entrada interactiva para inspeccionar remitentes, cabeceras, archivos adjuntos y enlaces fraudulentos en correos institucionales o bancarios.'
        },
        {
            vector: 'Smishing',
            titulo: 'Simulador de Smishing (SMS Móvil)',
            icono: 'fa-mobile-screen-button',
            descripcion: 'Entorno de teléfono inteligente para detectar mensajes de texto maliciosos, alertas falsas de paquetería y enlaces acortados.'
        },
        {
            vector: 'Vishing',
            titulo: 'Simulador de Vishing (Llamadas de Voz)',
            icono: 'fa-phone-volume',
            descripcion: 'Simulador de llamadas entrantes con audio sintetizado en vivo para entrenar la defensa frente a falsos asesores que solicitan códigos OTP o CVV.'
        },
        {
            vector: 'Ing. Social',
            titulo: 'Simulador de Ingeniería Social (Chat)',
            icono: 'fa-comments',
            descripcion: 'Escenarios de mensajería instantánea corporativa (WhatsApp / Teams) donde los atacantes usan urgencia o suplantación de autoridad.'
        }
    ],

    modosDisponibles: [
        { id: 'reaccion', nombre: '1. Reacción Táctica (Elegir la mejor acción)' },
        { id: 'redflags', nombre: '2. Cazador de Red Flags (Señalar dónde falla el mensaje)' },
        { id: 'urlinspector', nombre: '3. Auditoría Forense de Enlaces y Dominios' },
        { id: 'dialogo', nombre: '4. Escudo de Diálogo (Cómo responder al atacante)' },
        { id: 'protocolo', nombre: '5. Protocolo SOC (Ordenar pasos de contención)' }
    ],

    render: function() {
        const todas = AppModel.catalogoMisiones || [];

        return `
        <section id="misiones" class="view-section active">
            <div class="learning-hero mb-4">
                <div>
                    <span class="badge-pill">
                        <i class="fa-solid fa-flask-vial"></i> Laboratorio Sandbox Multidinámica (5 Modos)
                    </span>
                    <h1 style="font-size: 1.85rem; font-weight: 800; margin-top: 0.45rem;">Centro de Simuladores Interactivos</h1>
                    <p class="text-muted mt-1" style="max-width: 740px; line-height: 1.55;">
                        Entrena en nuestros 4 vectores de ataque combinando <strong>5 mecánicas dinámicas distintas</strong>: Reacción Táctica, Cazador de Red Flags, Auditoría de Dominios, Respuesta en Diálogo y Protocolo de Contención SOC.
                    </p>
                </div>
                <div>
                    <button type="button" id="btn-mision-aleatoria" class="btn-cisco-primary">
                        <i class="fa-solid fa-shuffle"></i> Reto Aleatorio (Misión + Dinámica al Azar)
                    </button>
                </div>
            </div>

            <!-- Cinta informativa de las 5 dinámicas -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.75rem; margin-bottom: 1.75rem;">
                <div class="card" style="padding: 0.85rem 1rem; border-top: 3px solid var(--cisco-green);">
                    <div style="font-weight: 800; font-size: 0.82rem; color: var(--cisco-dark);"><i class="fa-solid fa-bolt text-primary me-1"></i> 1. Reacción Táctica</div>
                    <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">Decide si acceder, ignorar o reportar bajo reloj.</p>
                </div>
                <div class="card" style="padding: 0.85rem 1rem; border-top: 3px solid #0284c7;">
                    <div style="font-weight: 800; font-size: 0.82rem; color: var(--cisco-dark);"><i class="fa-solid fa-magnifying-glass-location text-primary me-1"></i> 2. Cazador Red Flags</div>
                    <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">Haz clic en las partes exactas donde falla el mensaje.</p>
                </div>
                <div class="card" style="padding: 0.85rem 1rem; border-top: 3px solid #f59e0b;">
                    <div style="font-weight: 800; font-size: 0.82rem; color: var(--cisco-dark);"><i class="fa-solid fa-link-slash text-primary me-1"></i> 3. Auditor de URLs</div>
                    <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">Inspecciona dominios, IPs y cabeceras de envío.</p>
                </div>
                <div class="card" style="padding: 0.85rem 1rem; border-top: 3px solid #8b5cf6;">
                    <div style="font-weight: 800; font-size: 0.82rem; color: var(--cisco-dark);"><i class="fa-solid fa-reply-all text-primary me-1"></i> 4. Escudo de Diálogo</div>
                    <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">Elige la respuesta segura ante la presión del atacante.</p>
                </div>
                <div class="card" style="padding: 0.85rem 1rem; border-top: 3px solid #ec4899;">
                    <div style="font-weight: 800; font-size: 0.82rem; color: var(--cisco-dark);"><i class="fa-solid fa-list-ol text-primary me-1"></i> 5. Protocolo SOC</div>
                    <p class="text-muted" style="font-size: 0.75rem; margin-top: 2px;">Ordena los pasos de contención tras un incidente.</p>
                </div>
            </div>

            <!-- 4 Recuadros Principales (Uno por cada Simulador) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(430px, 1fr)); gap: 1.5rem;">
                ${this.metaVectores.map(meta => {
                    const ejemplos = todas.filter(m => m.vector === meta.vector);
                    const riesgoVector = AppModel.estadoUsuario.riesgoPorVector[meta.vector] ?? 50;

                    return `
                    <article class="cisco-course-card" style="cursor: default;">
                        <div class="cisco-card-thumb" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); height: 130px; justify-content: flex-start; padding: 1.5rem; gap: 1.2rem;">
                            <span class="cisco-level-badge">${ejemplos.length} Caso${ejemplos.length === 1 ? '' : 's'} &bull; 5 Modos</span>
                            
                            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(108, 192, 74, 0.18); border: 2px solid var(--cisco-green); color: var(--cisco-green); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; margin-top: 1rem;">
                                <i class="fa-solid ${meta.icono}"></i>
                            </div>
                            <div style="color: white; margin-top: 1rem;">
                                <div style="font-size: 0.74rem; color: var(--cisco-green); font-weight: 800; text-transform: uppercase;">
                                    Vector: ${meta.vector}
                                </div>
                                <h3 style="font-size: 1.15rem; font-weight: 800; color: white; margin-top: 0.1rem;">
                                    ${meta.titulo}
                                </h3>
                            </div>
                        </div>

                        <div class="cisco-card-body">
                            <p class="cisco-card-desc" style="margin-bottom: 0.9rem;">
                                ${meta.descripcion}
                            </p>

                            <div style="background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 0.55rem 0.85rem; font-size: 0.8rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                <span>Tu vulnerabilidad actual en <strong>${meta.vector}</strong>:</span>
                                <span class="badge-pill" style="background: ${riesgoVector >= 60 ? 'var(--danger-bg)' : 'var(--cisco-green-bg)'}; color: ${riesgoVector >= 60 ? '#991b1b' : '#2b5917'};">
                                    ${riesgoVector}%
                                </span>
                            </div>

                            ${ejemplos.length > 0 ? `
                                <!-- Selector 1: Escenario / Ejemplo -->
                                <div class="form-group mb-2">
                                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--cisco-dark); margin-bottom: 0.3rem; display: block;">
                                        <i class="fa-solid fa-folder-open text-primary me-1"></i> 1. Elige el caso de ataque:
                                    </label>
                                    <select class="form-input select-ejemplo-vector" data-vector="${meta.vector}" style="font-weight: 600; padding: 0.55rem 0.75rem;">
                                        ${ejemplos.map((ej, idx) => `
                                            <option value="${ej.id_mision}">
                                                Caso ${idx + 1}: ${ej.titulo} (${ej.dificultad})
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>

                                <!-- Selector 2: Dinámica / Modo de Simulador (Los 5 tipos) -->
                                <div class="form-group mb-3">
                                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--cisco-dark); margin-bottom: 0.3rem; display: block;">
                                        <i class="fa-solid fa-gamepad text-primary me-1"></i> 2. Elige la dinámica del simulador:
                                    </label>
                                    <select class="form-input select-modo-vector" data-vector="${meta.vector}" style="font-weight: 600; padding: 0.55rem 0.75rem; border-color: var(--cisco-green); background: #f8fdf6;">
                                        ${this.modosDisponibles.map(modo => `
                                            <option value="${modo.id}">${modo.nombre}</option>
                                        `).join('')}
                                    </select>
                                </div>

                                <div id="preview-vector-${meta.vector.replace(/\s+/g, '')}" style="background: #f8fafc; border-left: 3px solid var(--cisco-green); padding: 0.6rem 0.85rem; border-radius: 6px; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.15rem;">
                                    <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">Contexto del caso:</strong>
                                    <span class="preview-desc-texto">${ejemplos[0].descripcion_corta}</span>
                                </div>

                                <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.65rem; margin-top: auto;">
                                    <button type="button" class="btn-cisco-primary btn-practicar-seleccionado" data-vector="${meta.vector}" style="justify-content: center; padding: 0.65rem 1rem; font-size: 0.84rem;">
                                        <i class="fa-solid fa-play"></i> Iniciar Práctica
                                    </button>
                                    <button type="button" class="btn-cisco-outline btn-azar-vector" data-vector="${meta.vector}" style="justify-content: center; padding: 0.65rem 0.8rem; font-size: 0.82rem;">
                                        <i class="fa-solid fa-dice"></i> Modo al Azar
                                    </button>
                                </div>
                            ` : `
                                <p class="text-muted" style="font-size: 0.85rem;">No hay ejemplos activos en este vector.</p>
                            `}
                        </div>
                    </article>
                    `;
                }).join('')}
            </div>
        </section>
        `;
    }
};