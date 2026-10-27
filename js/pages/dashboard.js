const DashboardPage = {
    render: function() {
        const totalCursos = (AppModel.catalogoCursos || []).length;

        return `
        <section id="dashboard" class="view-section active">
            
            <!-- 1. HERO INSTITUCIONAL DE LA PLATAFORMA NEUROSHIELD -->
            <div class="cisco-hero-wrapper mb-4">
                
                <div class="cisco-alert-pill">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span><strong>Plataforma de Entrenamiento en Ciberseguridad:</strong> Capacitación adaptativa contra Ingeniería Social en Colombia</span>
                </div>

                <div class="cisco-hero-grid">
                    <!-- Columna Izquierda: Propuesta de Valor de NeuroShield -->
                    <div>
                        <h1 class="cisco-hero-title">
                            Desarrolla tus defensas.
                            <strong>Protege tu entorno digital.</strong>
                        </h1>
                        <p class="cisco-hero-desc">
                            NeuroShield es un ecosistema interactivo diseñado para fortalecer el factor humano frente a los ciberataques más frecuentes. Combina microcursos multimedia, cuestionarios diagnósticos y laboratorios de simulación realista.
                        </p>
                        <p style="font-weight: 700; font-size: 0.92rem; margin-bottom: 1.25rem; color: var(--text-main);">
                            Comienza evaluando tus conocimientos o explora directamente nuestros módulos formativos:
                        </p>

                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <button id="btn-abrir-diagnostico" class="btn-cisco-primary">
                                <i class="fa-solid fa-clipboard-check"></i> Realizar Diagnóstico Inicial
                            </button>
                            <a href="#/misiones" class="btn-cisco-outline">
                                <i class="fa-solid fa-crosshairs"></i> Ir a Simuladores
                            </a>
                            <a href="#/perfil" class="btn" style="border-radius: 999px; padding: 0.8rem 1.4rem;">
                                <i class="fa-solid fa-chart-simple text-primary"></i> Ver mi Perfil y Progreso
                            </a>
                        </div>
                    </div>

                    <!-- Columna Derecha: Información Relevante acerca del Sitio Web y sus Pilares -->
                    <div class="platform-showcase-card">
                        <div class="platform-showcase-header">
                            <div class="platform-showcase-icon">
                                <i class="fa-solid fa-layer-group"></i>
                            </div>
                            <div>
                                <h3 style="font-size: 1.1rem; font-weight: 800; color: #ffffff;">¿Por qué entrenar en NeuroShield?</h3>
                                <p style="font-size: 0.8rem; color: #94a3b8;">Arquitectura educativa basada en casos reales</p>
                            </div>
                        </div>

                        <div class="platform-pillars-list">
                            <div class="platform-pillar-item">
                                <i class="fa-solid fa-graduation-cap"></i>
                                <div>
                                    <h4>Microaprendizaje Multimedia</h4>
                                    <p>Módulos cortos de 3 a 8 minutos con soporte de imágenes, audio, video y evaluaciones rápidas.</p>
                                </div>
                            </div>

                            <div class="platform-pillar-item">
                                <i class="fa-solid fa-flask-vial"></i>
                                <div>
                                    <h4>Entorno Sandbox Controlado</h4>
                                    <p>Enfrenta escenarios simulados de Phishing, Smishing y Vishing sin exponer tus cuentas ni tus datos reales.</p>
                                </div>
                            </div>

                            <div class="platform-pillar-item">
                                <i class="fa-solid fa-brain"></i>
                                <div>
                                    <h4>Retroalimentación Forense</h4>
                                    <p>Analiza el impacto de cada decisión y consulta tus métricas personales en tu panel de perfil privado.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Barra Inferior de Indicadores de la Plataforma -->
                <div class="cisco-stats-strip">
                    <div class="cisco-stat-item">
                        <h4>${totalCursos}</h4>
                        <p>Cursos Especializados</p>
                    </div>
                    <div class="cisco-stat-item">
                        <h4>4</h4>
                        <p>Vectores de Amenaza</p>
                    </div>
                    <div class="cisco-stat-item">
                        <h4>24/7</h4>
                        <p>Laboratorio Autoguiado</p>
                    </div>
                    <div class="cisco-stat-item">
                        <h4>100%</h4>
                        <p>Enfoque Preventivo</p>
                    </div>
                </div>
            </div>

            <!-- 2. METODOLOGÍA DE LA PLATAFORMA (3 PASOS CLAROS) -->
            <div class="mb-4">
                <h2 class="section-title" style="font-size: 1.35rem; margin-bottom: 0.75rem;">
                    Cómo funciona nuestra metodología de capacitación
                </h2>
                <div class="methodology-grid">
                    <div class="methodology-card">
                        <span class="methodology-step-badge"><i class="fa-solid fa-1"></i> Fase Diagnóstica</span>
                        <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.4rem;">Identifica tus puntos ciegos</h3>
                        <p class="text-muted" style="font-size: 0.86rem; line-height: 1.55;">
                            Presenta el cuestionario diagnóstico inicial para conocer ante qué tipo de engaños digitales (correos, SMS o llamadas) requieres mayor atención.
                        </p>
                    </div>

                    <div class="methodology-card">
                        <span class="methodology-step-badge"><i class="fa-solid fa-2"></i> Fase Teórico-Multimedia</span>
                        <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.4rem;">Estudia los vectores de ataque</h3>
                        <p class="text-muted" style="font-size: 0.86rem; line-height: 1.55;">
                            Revisa los cursos interactivos en la sección inferior, analiza ejemplos visuales de suplantación y valida lo aprendido en los quizzes de cada tema.
                        </p>
                    </div>

                    <div class="methodology-card">
                        <span class="methodology-step-badge"><i class="fa-solid fa-3"></i> Fase de Simulación</span>
                        <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 0.4rem;">Entrena bajo presión real</h3>
                        <p class="text-muted" style="font-size: 0.86rem; line-height: 1.55;">
                            Pon a prueba tus reflejos en el Centro de Misiones tomando decisiones en tiempo real frente a comunicaciones sospechosas.
                        </p>
                    </div>
                </div>
            </div>

            <!-- 3. CATÁLOGO DE CURSOS EN LA PÁGINA PRINCIPAL -->
            <div class="learning-section-home mt-4">
                <div class="flex-between mb-3" style="flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 class="section-title" style="font-size: 1.5rem; margin-bottom: 0.2rem;">
                            Catálogo de Cursos sobre Ciberataques
                        </h2>
                        <p class="text-muted" style="font-size: 0.92rem;">
                            Selecciona un curso para abrir su currículo completo, revisar el material multimedia y presentar el examen del módulo.
                        </p>
                    </div>
                    <a href="#/aprendizaje" class="btn-cisco-outline" style="padding: 0.6rem 1.25rem; font-size: 0.85rem;">
                        Ver catálogo completo <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
                
                ${AprendizajePage.renderTarjetasCursos()}
            </div>

        </section>
        `;
    }
};