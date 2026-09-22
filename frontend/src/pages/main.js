/* ==========================================================================
   ESTADO GLOBAL DEL SISTEMA (Mock Data - Capa 5)
   ========================================================================== */
let historicoPuntajes = [85, 78, 85, 65]; 
let vulnerabilidadBase = historicoPuntajes[historicoPuntajes.length - 1];
let miGrafico;
let timerInterval;

// Inicialización de la plataforma
document.addEventListener('DOMContentLoaded', () => {
    configurarTema();
    configurarNavegacion();
    inicializarGrafico();
    iniciarLiveFeed();
    
    // Forzar la actualización visual inicial del Dashboard con el valor base
    actualizarDashboard(vulnerabilidadBase, 'warning', 'Moderada', false);
});

/* ==========================================================================
   1. GESTIÓN DEL TEMA (DARK / LIGHT MODE)
   ========================================================================== */
function configurarTema() {
    const themeBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeBtn.querySelector('i');
    const text = themeBtn.querySelector('span');

    // Recuperar preferencia de localStorage o usar 'dark' por defecto
    const currentTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', currentTheme);
    actualizarIconoTema(currentTheme, icon, text);

    themeBtn.addEventListener('click', () => {
        const newTheme = htmlElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        actualizarIconoTema(newTheme, icon, text);
        
        // Re-renderizar gráfica para adaptar colores de ejes y grillas
        if(miGrafico) {
            miGrafico.destroy();
            inicializarGrafico();
        }
    });
}

function actualizarIconoTema(theme, icon, text) {
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
        text.innerText = 'Modo Claro';
    } else {
        icon.className = 'fa-solid fa-moon';
        text.innerText = 'Modo Oscuro';
    }
}

/* ==========================================================================
   2. ENRUTADOR SPA (Single Page Application) Y NAVEGACIÓN
   ========================================================================== */
function configurarNavegacion() {
    const navButtons = document.querySelectorAll('.nav-btn:not(#theme-toggle)');
    const vistas = document.querySelectorAll('.view-section');
    const breadcrumb = document.getElementById('breadcrumb');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Actualizar estado visual de los botones
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.getAttribute('data-target');
            
            // Actualizar Migas de Pan (Breadcrumbs)
            const nombreVista = targetId === 'dashboard' ? 'Centro de Mando' : 'Sandbox de Ataques';
            breadcrumb.innerHTML = `<span class="text-muted">SecOps</span> <i class="fa-solid fa-angle-right mx-2 text-muted" style="font-size:0.7rem"></i> <strong class="text-glow">${nombreVista}</strong>`;

            // Transición de Vistas
            vistas.forEach(vista => {
                if(vista.id === targetId) {
                    vista.classList.remove('hidden');
                    vista.classList.add('active');
                    if(targetId === 'simulador') iniciarTimer();
                } else {
                    vista.classList.remove('active');
                    vista.classList.add('hidden');
                    if(targetId !== 'simulador') detenerTimer();
                }
            });
        });
    });
}

/* ==========================================================================
   3. MOTOR DE GRÁFICAS (CHART.JS) ADAPTABLE AL TEMA
   ========================================================================== */
function inicializarGrafico() {
    const ctx = document.getElementById('vulnChart').getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Paleta de colores adaptable
    const gridColor = isDark ? '#334155' : 'rgba(226, 232, 240, 0.8)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const pointBg = isDark ? '#0f172a' : '#ffffff';

    // Gradiente bajo la línea
    let gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.25)');   
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

    miGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['M1', 'M2', 'M3', 'Actual'],
            datasets: [{
                data: historicoPuntajes,
                borderColor: '#2563eb',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.4, // Curvas elásticas
                fill: true,
                pointBackgroundColor: pointBg,
                pointBorderColor: '#2563eb',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    titleColor: isDark ? '#f8fafc' : '#0f172a',
                    bodyColor: isDark ? '#94a3b8' : '#64748b',
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 100, 
                    grid: { color: gridColor, drawBorder: false }, 
                    ticks: { color: textColor, padding: 10 } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: textColor, padding: 10 } 
                }
            }
        }
    });
}

/* ==========================================================================
   4. TELEMETRÍA SOC (FEED EN VIVO SIMULADO)
   ========================================================================== */
function iniciarLiveFeed() {
    const feed = document.getElementById('live-feed');
    const eventos = [
        "Login exitoso: d.cuervo (IP: 190.24.x.x)",
        "Modelo NLP (DistilBERT): Analizando 425 correos",
        "Autenticación UMB via OAuth completada",
        "Simulador: Escenario ICETEX generado con éxito",
        "Capa 3: Actualización de pesos predictivos (W+)",
        "Escaneo perimetral: Puertos cerrados",
        "Actualización de firmas EDR completada"
    ];

    setInterval(() => {
        const item = document.createElement('div');
        // 15% de probabilidad de generar una alerta crítica
        const esAlerta = Math.random() > 0.85; 
        item.className = `feed-item ${esAlerta ? 'alert' : ''}`;
        
        const time = new Date().toLocaleTimeString('es-CO', {hour12: false});
        const texto = esAlerta ? "ALERTA SOC: Intento de Smishing detectado en subred local" : eventos[Math.floor(Math.random() * eventos.length)];
        
        item.innerHTML = `<span class="feed-time">[${time}]</span> ${texto}`;
        feed.prepend(item);

        // Mantener el DOM limpio (máximo 8 elementos)
        if(feed.children.length > 8) feed.removeChild(feed.lastChild);
    }, 3200);
}

/* ==========================================================================
   5. TEMPORIZADOR DE PRESIÓN PSICOLÓGICA (SIMULADOR)
   ========================================================================== */
function iniciarTimer() {
    detenerTimer();
    let tiempo = 180; // 3 Minutos
    const display = document.getElementById('time-display');
    
    timerInterval = setInterval(() => {
        let min = parseInt(tiempo / 60, 10);
        let seg = parseInt(tiempo % 60, 10);
        display.textContent = `${min < 10 ? "0"+min : min}:${seg < 10 ? "0"+seg : seg}`;
        
        if (--tiempo < 0) { 
            detenerTimer(); 
            procesarRespuesta('tiempo'); 
        }
    }, 1000);
}

function detenerTimer() { 
    clearInterval(timerInterval); 
    document.getElementById('time-display').textContent = "03:00"; 
}

function toggleHeaders() { 
    document.getElementById('header-inspector').classList.toggle('hidden'); 
}

/* ==========================================================================
   6. CAPA LÓGICA Y MOTOR FORENSE (TYPEWRITER EFFECT)
   ========================================================================== */
function procesarRespuesta(accionUsuario) {
    detenerTimer();
    const loader = document.getElementById('ai-loader');
    loader.classList.remove('hidden');

    // Simular latencia de red y procesamiento de IA (2.5 segundos)
    setTimeout(() => {
        loader.classList.add('hidden');
        document.getElementById('simulador').classList.remove('active');
        document.getElementById('simulador').classList.add('hidden');
        document.getElementById('resultados').classList.remove('hidden');
        document.getElementById('resultados').classList.add('active');
        
        document.getElementById('breadcrumb').innerHTML = `<span class="text-muted">SecOps</span> <i class="fa-solid fa-angle-right mx-2 text-muted" style="font-size:0.7rem"></i> <span class="text-muted">Laboratorio</span> <i class="fa-solid fa-angle-right mx-2 text-muted" style="font-size:0.7rem"></i> <strong class="text-glow">Reporte Forense</strong>`;
        
        ejecutarAnalisisForenseVisual(accionUsuario);
    }, 2500);
}

function ejecutarAnalisisForenseVisual(accion) {
    const terminal = document.getElementById('ai-terminal-output');
    terminal.innerHTML = ''; // Limpiar buffer de la terminal
    
    // Construcción del reporte forense basado en la decisión
    let lineas = [
        "[SYS] Conectando con NeuroShield_AI_Engine...",
        "[IA] Cargando modelo NLP (DistilBERT Español_CO)...",
        "[IA] Analizando vector de ataque: Phishing Contextual (ICETEX / UMB).",
        "[IA] Evaluando nodo de decisión del usuario en Capa Lógica..."
    ];

    let nuevoRiesgo = vulnerabilidadBase;
    let tipoColor = '';
    let etiqueta = '';

    if (accion === 'cae') {
        lineas.push("<span class='error'>[CRÍTICO] Infracción de Capa 8. Usuario ejecutó un payload malicioso simulado.</span>");
        lineas.push("<span class='error'>[CRÍTICO] Credenciales institucionales comprometidas. Vector de engaño: Coerción Financiera.</span>");
        lineas.push("[IA] Re-calculando pesos sinápticos: Impacto Severo.");
        nuevoRiesgo += 25;
        tipoColor = 'danger';
        etiqueta = 'Crítica';
    } else if (accion === 'ignora' || accion === 'tiempo') {
        const razon = accion === 'tiempo' ? "Tiempo de respuesta agotado" : "Usuario eliminó la amenaza";
        lineas.push(`<span class='warn'>[WARN] ${razon}. Interacción directa evitada.</span>`);
        lineas.push("<span class='warn'>[WARN] Omisión de protocolo (IR): Carencia de reporte al SOC corporativo.</span>");
        lineas.push("[IA] Re-calculando pesos sinápticos: Impacto Leve.");
        nuevoRiesgo -= 5;
        tipoColor = 'warning';
        etiqueta = 'Moderada';
    } else {
        lineas.push("[OK] Reconocimiento de amenaza (IoCs) verificado con alta precisión.");
        lineas.push("[OK] Envío de telemetría al SOC exitoso. Dominio falso ingresado en lista negra (Firewall).");
        lineas.push("[IA] Re-calculando pesos sinápticos: Refuerzo Positivo.");
        nuevoRiesgo -= 30;
        tipoColor = 'success';
        etiqueta = 'Segura';
    }
    
    // Normalizar riesgo entre 0 y 100
    nuevoRiesgo = Math.max(0, Math.min(100, nuevoRiesgo));
    lineas.push(`[IA] Riesgo residual consolidado: ${nuevoRiesgo}%.`);
    lineas.push("[SYS] Fin de la transmisión forense.");

    // Ejecutar animación Typewriter en la Terminal
    let delay = 0;
    lineas.forEach((linea, index) => {
        setTimeout(() => {
            terminal.innerHTML += `<p>${linea}</p>`;
            // Añadir cursor parpadeante en la última línea
            if (index === lineas.length - 1) {
                terminal.innerHTML += `<div class="cursor"></div>`;
                actualizarDashboard(nuevoRiesgo, tipoColor, etiqueta, true);
            }
            // Auto-scroll hacia abajo
            terminal.scrollTop = terminal.scrollHeight;
        }, delay);
        delay += 750; // 750ms de pausa entre cada línea impresa
    });
}

/* ==========================================================================
   7. ACTUALIZACIÓN DINÁMICA DE LA INTERFAZ (DOM)
   ========================================================================== */
function actualizarDashboard(valor, tipoColor, etiqueta, actualizarGrafica = true) {
    // A. Actualizar SVG Circular (Score Principal)
    const circle = document.querySelector('.circle');
    const valueTxt = document.querySelector('.number-wrapper h2');
    
    // Aplicar colores específicos al SVG SVG
    if (tipoColor === 'danger') circle.style.stroke = 'var(--danger)';
    else if (tipoColor === 'success') circle.style.stroke = 'var(--success)';
    else circle.style.stroke = 'url(#gradient-warning)'; // Usa el gradiente CSS para el estado neutro/warning

    // Animar progreso del círculo
    setTimeout(() => {
        circle.style.strokeDasharray = `${valor}, 100`;
        // Efecto contador rápido para los números
        let start = vulnerabilidadBase;
        const diff = valor - start;
        const duration = 500;
        const startTime = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const currentVal = Math.floor(start + (diff * progress));
            valueTxt.innerText = currentVal;
            if (progress < 1) requestAnimationFrame(step);
            else valueTxt.innerText = valor;
        }
        requestAnimationFrame(step);
    }, 150);

    // B. Actualizar Umbral de Riesgo Horizontal (Risk Track)
    const marker = document.getElementById('risk-marker');
    const badge = document.querySelector('.dynamic-badge');
    
    marker.style.left = `${valor}%`;
    badge.innerText = etiqueta;
    
    // Estilos dinámicos para el Badge
    if (tipoColor === 'danger') { 
        badge.style.color = 'var(--danger)'; 
        badge.style.backgroundColor = 'var(--danger-bg)'; 
    }
    else if (tipoColor === 'success') { 
        badge.style.color = 'var(--success)'; 
        badge.style.backgroundColor = 'var(--success-bg)'; 
    }
    else { 
        badge.style.color = 'var(--warning)'; 
        badge.style.backgroundColor = 'var(--warning-bg)'; 
    }

    // C. Actualizar Gráfica Histórica (Chart.js)
    if(actualizarGrafica && miGrafico && valor !== vulnerabilidadBase) {
        miGrafico.data.labels.push('Sim. N2');
        miGrafico.data.datasets[0].data.push(valor);
        miGrafico.update();
        vulnerabilidadBase = valor;
    }
}

function volverDashboard() {
    document.querySelector('.nav-btn[data-target="dashboard"]').click();
}