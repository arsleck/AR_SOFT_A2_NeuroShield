// === EL MODELO (MVC) ===
// Gestiona el estado del usuario, vulnerabilidad por vector, diagnóstico y microcursos sincronizados con PostgreSQL.

const AppModel = {
    estadoUsuario: {
        nombre: "Estudiante",
        correo: "",
        riesgoActual: 55,
        // Datos claros por categoría para la gráfica de barras horizontal
        riesgoPorVector: {
            Phishing: 65,
            Smishing: 50,
            Vishing: 60,
            "Ing. Social": 45
        },
        diagnosticoCompletado: false,
        nivelConocimiento: "Sin evaluar",
        recomendacionesActuales: [
            {
                icono: "fa-clipboard-check",
                color: "text-primary",
                texto: "Realiza la evaluación diagnóstica inicial para medir tu nivel de exposición en cada tipo de amenaza."
            },
            {
                icono: "fa-graduation-cap",
                color: "text-warning",
                texto: "Completa los microcursos de la parte inferior antes de iniciar tu entrenamiento en el simulador."
            }
        ]
    },

    preguntasDiagnostico: [
        {
            id: 1,
            vector: "Phishing",
            tema: "Phishing (Correo)",
            pregunta: "Recibes un correo urgente de tu banco o del ICETEX diciendo que tu cuenta será bloqueada en 2 horas si no entras a un enlace adjunto. ¿Qué haces?",
            opciones: [
                { texto: "Hago clic rápido en el enlace para evitar el bloqueo.", puntosRiesgo: 80 },
                { texto: "Verifico el remitente, ignoro el enlace y accedo escribiendo la dirección oficial en el navegador.", puntosRiesgo: 20 },
                { texto: "Respondo el correo pidiendo más información.", puntosRiesgo: 55 }
            ]
        },
        {
            id: 2,
            vector: "Smishing",
            tema: "Smishing (SMS)",
            pregunta: "Te llega un SMS de un número desconocido diciendo: '4-72: Tu paquete está retenido en aduana, paga $8.500 aquí: bit.ly/envio-col'. ¿Cuál es la señal de alerta principal?",
            opciones: [
                { texto: "Que el cobro es de bajo valor.", puntosRiesgo: 65 },
                { texto: "El uso de enlaces acortados (bit.ly) y remitentes no oficiales generando urgencia.", puntosRiesgo: 15 },
                { texto: "Ninguna, los mensajes de texto celulares siempre son seguros.", puntosRiesgo: 85 }
            ]
        },
        {
            id: 3,
            vector: "Vishing",
            tema: "Vishing (Llamadas)",
            pregunta: "Te llaman supuestamente del área de seguridad de tu banco, saben tu nombre y te piden leer el código de 6 dígitos que acaba de llegar a tu celular para 'bloquear una compra falsa'.",
            opciones: [
                { texto: "Les entrego el código porque conocen mi nombre completo.", puntosRiesgo: 85 },
                { texto: "Cuelgo de inmediato; ningún banco solicita códigos OTP o claves por llamada.", puntosRiesgo: 15 },
                { texto: "Les doy solo los primeros 3 dígitos para validar.", puntosRiesgo: 60 }
            ]
        },
        {
            id: 4,
            vector: "Ing. Social",
            tema: "Ingeniería Social",
            pregunta: "¿Cuál es el objetivo principal de la Ingeniería Social en los ciberataques modernos?",
            opciones: [
                { texto: "Manipular psicológicamente a la persona (usando miedo, urgencia o autoridad) para que entregue información.", puntosRiesgo: 20 },
                { texto: "Dañar físicamente los componentes del computador o celular.", puntosRiesgo: 75 },
                { texto: "Adivinar contraseñas mediante fuerza bruta automatizada.", puntosRiesgo: 60 }
            ]
        }
    ],

    // Respaldo local en caso de que el servidor esté apagado; se actualiza desde PostgreSQL con obtenerCursos()
    catalogoCursos: [
        {
            id_curso: 1,
            slug: "curso-phishing",
            titulo: "Detección de Phishing Corporativo e Institucional",
            categoria: "Correo Electrónico",
            nivel: "Básico",
            duracion: "4 min",
            icono: "fa-envelope-open-text",
            color_tema: "#4f46e5",
            fondo_tema: "#eef2ff",
            resumen: "Aprende a identificar correos falsos que suplantan entidades como ICETEX, DIAN o bancos para robar tus credenciales.",
            como_funciona: "El atacante envía un correo con logotipos idénticos a los oficiales y utiliza una excusa urgente (suspensión de cuenta o cobro jurídico) para dirigirte a un sitio web clonado.",
            senales_alerta: [
                "El dominio del remitente no coincide con la entidad oficial (ej. @icetex-soporte.org).",
                "Sentido de urgencia extrema con plazos de pocas horas.",
                "Enlaces que al inspeccionarlos dirigen a direcciones externas desconocidas."
            ],
            prevencion: "Nunca ingreses tus contraseñas desde enlaces recibidos por correo; digita siempre la dirección oficial en el navegador.",
            origen: "Sistema"
        },
        {
            id_curso: 2,
            slug: "curso-smishing",
            titulo: "Defensa contra Smishing y Enlaces Móviles",
            categoria: "Mensajes SMS",
            nivel: "Básico",
            duracion: "3 min",
            icono: "fa-comment-sms",
            color_tema: "#0284c7",
            fondo_tema: "#e0f2fe",
            resumen: "Reconoce mensajes de texto fraudulentos sobre paquetes retenidos, premios o bloqueos bancarios en tu celular.",
            como_funciona: "En Colombia es frecuente recibir SMS falsos suplantando a 4-72, Servientrega o billeteras digitales con enlaces acortados que solicitan pagos pequeños o datos de tarjetas.",
            senales_alerta: [
                "Uso de acortadores de enlaces como bit.ly o tinyurl.",
                "Mensajes enviados desde números celulares estándar en vez de códigos cortos oficiales.",
                "Solicitud de pagos inmediatos por aduanas o actualización de datos."
            ],
            prevencion: "Elimina cualquier SMS que incluya enlaces para desbloquear cuentas o pagar envíos. Verifica directamente en la aplicación oficial.",
            origen: "Sistema"
        },
        {
            id_curso: 3,
            slug: "curso-vishing",
            titulo: "Prevención de Vishing y Fraude Telefónico",
            categoria: "Llamadas de Voz",
            nivel: "Intermedio",
            duracion: "5 min",
            icono: "fa-phone-volume",
            color_tema: "#d97706",
            fondo_tema: "#fef3c7",
            resumen: "Identifica cómo operan los falsos asesores bancarios que buscan obtener tus códigos de seguridad por llamada.",
            como_funciona: "El atacante te llama mencionando datos reales tuyos, finge ser del área antifraude del banco y te pide leer el código de 6 dígitos (OTP) que acaba de llegar a tu celular.",
            senales_alerta: [
                "Solicitud de códigos OTP enviados por SMS o aplicaciones de token.",
                "Ruido de call center de fondo y presión para que no cuelgues la llamada.",
                "Petición para descargar aplicaciones de control remoto como AnyDesk."
            ],
            prevencion: "Cuelga de inmediato; ninguna entidad financiera solicita códigos de verificación ni claves por teléfono.",
            origen: "Sistema"
        },
        {
            id_curso: 4,
            slug: "curso-ingenieria-social",
            titulo: "Fundamentos de Ingeniería Social",
            categoria: "Manipulación Psicológica",
            nivel: "Intermedio",
            duracion: "6 min",
            icono: "fa-user-shield",
            color_tema: "#dc2626",
            fondo_tema: "#fee2e2",
            resumen: "Comprende los disparadores psicológicos (miedo, autoridad y urgencia) que utilizan los ciberdelincuentes.",
            como_funciona: "En lugar de vulnerar un sistema técnico, el atacante manipula la confianza humana para que la propia víctima entregue el acceso a su información confidencial.",
            senales_alerta: [
                "Presión para actuar de inmediato sin consultar a terceros.",
                "Suplantación de figuras de autoridad, soporte técnico o entidades estatales.",
                "Promesas de beneficios económicos o alertas de sanciones inminentes."
            ],
            prevencion: "Aplica la regla de pausa: ante cualquier comunicación alarmante, detente y verifica por un canal oficial independiente.",
            origen: "Sistema"
        }
    ],

    // Sincroniza los microcursos desde PostgreSQL (Neon)
    sincronizarCursosDesdeBD: async function() {
        try {
            const respuesta = await fetch('http://localhost:3000/api/cursos');
            if (!respuesta.ok) return this.catalogoCursos;
            const cursosBD = await respuesta.json();
            if (Array.isArray(cursosBD) && cursosBD.length > 0) {
                this.catalogoCursos = cursosBD.map(c => ({
                    ...c,
                    senales_alerta: Array.isArray(c.senales_alerta)
                        ? c.senales_alerta
                        : JSON.parse(c.senales_alerta || '[]')
                }));
            }
            return this.catalogoCursos;
        } catch (error) {
            return this.catalogoCursos;
        }
    },

    evaluarDiagnostico: function(respuestasPorVector) {
        // Actualizamos el riesgo específico de cada vector según las respuestas
        Object.keys(respuestasPorVector).forEach(vector => {
            this.estadoUsuario.riesgoPorVector[vector] = respuestasPorVector[vector];
        });

        const valores = Object.values(this.estadoUsuario.riesgoPorVector);
        const promedio = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);

        this.estadoUsuario.riesgoActual = promedio;
        this.estadoUsuario.diagnosticoCompletado = true;

        const recomendaciones = [];
        if (promedio >= 60) {
            this.estadoUsuario.nivelConocimiento = "Inicial (Riesgo Alto)";
            recomendaciones.push({
                icono: "fa-triangle-exclamation",
                color: "text-danger",
                texto: "Tu diagnóstico evidencia alta susceptibilidad ante tácticas de presión y suplantación de identidad."
            });
            recomendaciones.push({
                icono: "fa-book-open",
                color: "text-primary",
                texto: "Revisa primero los microcursos de Phishing y Vishing en la sección inferior antes de pasar al simulador."
            });
        } else if (promedio >= 35) {
            this.estadoUsuario.nivelConocimiento = "Intermedio (Riesgo Moderado)";
            recomendaciones.push({
                icono: "fa-shield-halved",
                color: "text-warning",
                texto: "Reconoces amenazas básicas, pero requieres reforzar la validación de enlaces acortados y llamadas."
            });
            recomendaciones.push({
                icono: "fa-crosshairs",
                color: "text-primary",
                texto: "Completa el microcurso del vector donde obtuviste mayor barra de riesgo y pasa al simulador práctico."
            });
        } else {
            this.estadoUsuario.nivelConocimiento = "Avanzado (Riesgo Bajo)";
            recomendaciones.push({
                icono: "fa-circle-check",
                color: "text-success",
                texto: "Excelente criterio preventivo. Identificas adecuadamente los vectores de ingeniería social."
            });
            recomendaciones.push({
                icono: "fa-bolt",
                color: "text-primary",
                texto: "Pon a prueba tu velocidad de respuesta bajo presión en las misiones prácticas del simulador."
            });
        }

        this.estadoUsuario.recomendacionesActuales = recomendaciones;
        return {
            riesgo: promedio,
            nivel: this.estadoUsuario.nivelConocimiento,
            recomendaciones: recomendaciones
        };
    },

    calcularNuevoRiesgo: function(accion) {
        let impacto = 0;
        let reporte = [];

        if (accion === 'caer') {
            impacto = 25;
            reporte = ["<span class='error'>[CRÍTICO] Infracción detectada. Usuario accedió a enlace fraudulento.</span>", "Impacto: +25% en vulnerabilidad de Phishing."];
        } else if (accion === 'ignorar' || accion === 'tiempo') {
            impacto = -5;
            reporte = ["<span class='warn'>[ALERTA] Amenaza ignorada, pero no fue reportada al área de seguridad.</span>", "Impacto: -5% en vulnerabilidad de Phishing."];
        } else if (accion === 'reportar') {
            impacto = -25;
            reporte = ["<span class='ok'>[CORRECTO] Amenaza identificada y reportada oportunamente.</span>", "Impacto: -25% en vulnerabilidad de Phishing."];
        }

        const nuevoPhishing = Math.max(10, Math.min(95, (this.estadoUsuario.riesgoPorVector.Phishing || 50) + impacto));
        this.estadoUsuario.riesgoPorVector.Phishing = nuevoPhishing;

        const valores = Object.values(this.estadoUsuario.riesgoPorVector);
        this.estadoUsuario.riesgoActual = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
        
        return {
            nuevoRiesgo: this.estadoUsuario.riesgoActual,
            logs: reporte
        };
    }
};