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

    render: function() {
        const todas = AppModel.catalogoMisiones || [];

        return `
        <section id="misiones" class="view-section active">
            <!-- Encabezado con el botón de Caso Aleatorio Global -->
            <div class="learning-hero mb-4">
                <div>
                    <span class="badge-pill">
                        <i class="fa-solid fa-flask-vial"></i> Laboratorio Sandbox Multicanal
                    </span>
                    <h1 style="font-size: 1.85rem; font-weight: 800; margin-top: 0.45rem;">Centro de Simuladores por Vector</h1>
                    <p class="text-muted mt-1" style="max-width: 720px; line-height: 1.55;">
                        Selecciona uno de los 4 simuladores especializados. Dentro de cada recuadro puedes elegir qué ejemplo específico deseas practicar o lanzar un caso al azar.
                    </p>
                </div>
                <div>
                    <button type="button" id="btn-mision-aleatoria" class="btn-cisco-primary">
                        <i class="fa-solid fa-shuffle"></i> Entrenar Caso Aleatorio Global (${todas.length} disponibles)
                    </button>
                </div>
            </div>

            <!-- 4 Recuadros Principales (Uno por cada Simulador) -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 1.5rem;">
                ${this.metaVectores.map(meta => {
                    const ejemplos = todas.filter(m => m.vector === meta.vector);
                    const riesgoVector = AppModel.estadoUsuario.riesgoPorVector[meta.vector] ?? 50;

                    return `
                    <article class="cisco-course-card" style="cursor: default;">
                        <!-- Cabecera Oscura del Simulador -->
                        <div class="cisco-card-thumb" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); height: 135px; justify-content: flex-start; padding: 1.5rem; gap: 1.25rem;">
                            <span class="cisco-level-badge">${ejemplos.length} Ejemplo${ejemplos.length === 1 ? '' : 's'} disponible${ejemplos.length === 1 ? '' : 's'}</span>
                            
                            <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(108, 192, 74, 0.18); border: 2px solid var(--cisco-green); color: var(--cisco-green); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; margin-top: 1rem;">
                                <i class="fa-solid ${meta.icono}"></i>
                            </div>
                            <div style="color: white; margin-top: 1rem;">
                                <div style="font-size: 0.75rem; color: var(--cisco-green); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Vector: ${meta.vector}
                                </div>
                                <h3 style="font-size: 1.2rem; font-weight: 800; color: white; margin-top: 0.15rem;">
                                    ${meta.titulo}
                                </h3>
                            </div>
                        </div>

                        <!-- Cuerpo del Recuadro con Selector de Ejemplos -->
                        <div class="cisco-card-body">
                            <p class="cisco-card-desc" style="margin-bottom: 1rem;">
                                ${meta.descripcion}
                            </p>

                            <!-- Barra de Vulnerabilidad del Usuario en este Vector -->
                            <div style="background: var(--bg-main); border: 1px solid var(--border); border-radius: 8px; padding: 0.65rem 0.9rem; font-size: 0.82rem; margin-bottom: 1.15rem; display: flex; justify-content: space-between; align-items: center;">
                                <span>Tu vulnerabilidad actual en <strong>${meta.vector}</strong>:</span>
                                <span class="badge-pill" style="background: ${riesgoVector >= 60 ? 'var(--danger-bg)' : 'var(--cisco-green-bg)'}; color: ${riesgoVector >= 60 ? '#991b1b' : '#2b5917'};">
                                    ${riesgoVector}%
                                </span>
                            </div>

                            ${ejemplos.length > 0 ? `
                                <!-- Selector Desplegable de Ejemplos de este Ataque -->
                                <div class="form-group mb-3">
                                    <label style="font-size: 0.82rem; font-weight: 700; color: var(--cisco-dark); margin-bottom: 0.4rem; display: block;">
                                        <i class="fa-solid fa-list-check text-primary me-1"></i> Elige el escenario o ejemplo a practicar:
                                    </label>
                                    <select class="form-input select-ejemplo-vector" data-vector="${meta.vector}" style="font-weight: 600;">
                                        ${ejemplos.map((ej, idx) => `
                                            <option value="${ej.id_mision}">
                                                Ejemplo ${idx + 1}: ${ej.titulo} (${ej.dificultad} • ${ej.tiempo_limite}s)
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>

                                <!-- Vista Previa Rápida del Ejemplo Seleccionado -->
                                <div id="preview-vector-${meta.vector.replace(/\s+/g, '')}" style="background: #f8fafc; border-left: 3px solid var(--cisco-green); padding: 0.65rem 0.85rem; border-radius: 6px; font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.25rem;">
                                    <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">
                                        <i class="fa-solid fa-circle-info text-primary"></i> Contexto del caso:
                                    </strong>
                                    <span class="preview-desc-texto">${ejemplos[0].descripcion_corta}</span>
                                </div>

                                <!-- Botones de Acción: Practicar el elegido o Al Azar del Vector -->
                                <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.65rem; margin-top: auto;">
                                    <button type="button" class="btn-cisco-primary btn-practicar-seleccionado" data-vector="${meta.vector}" style="justify-content: center; padding: 0.7rem 1rem; font-size: 0.85rem;">
                                        <i class="fa-solid fa-play"></i> Practicar Elegido
                                    </button>
                                    <button type="button" class="btn-cisco-outline btn-azar-vector" data-vector="${meta.vector}" style="justify-content: center; padding: 0.7rem 0.85rem; font-size: 0.83rem;" title="Elegir un ejemplo aleatorio de ${meta.vector}">
                                        <i class="fa-solid fa-dice"></i> Al Azar
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