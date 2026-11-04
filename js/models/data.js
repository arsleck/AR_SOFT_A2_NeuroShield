// === EL MODELO (MVC) ===
// Gestiona el estado del usuario, vulnerabilidad por vector, logros, cursos y misiones prácticas sincronizadas con PostgreSQL.

const AppModel = {
    estadoUsuario: {
        id: null,
        nombre: "Estudiante",
        correo: "",
        rol: "Estudiante",
        riesgoActual: 55,
        riesgoPorVector: {
            Phishing: 65,
            Smishing: 50,
            Vishing: 60,
            "Ing. Social": 45
        },
        progresoCursos: {}, // { [id_curso]: { completado: true, puntaje_quiz: 100 } }
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
                texto: "Completa los microcursos del catálogo para desbloquear tus insignias antes de entrar al simulador."
            }
        ]
    },

    ultimoResultadoSimulacion: null,

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

    catalogoCursos: [],

    catalogoMisiones: [
        {
            id_mision: 1,
            titulo: "Misión 1: Suspensión de Crédito Educativo (ICETEX)",
            vector: "Phishing",
            dificultad: "Básico",
            tiempo_limite: 150,
            descripcion_corta: "Inspecciona un correo urgente sobre el bloqueo inminente de tu desembolso semestral.",
            remitente_nombre: "División de Cartera ICETEX",
            remitente_identificador: "notificaciones@icetex-portal-juridico.org",
            asunto_o_contexto: "URGENTE: Suspensión definitiva de giro académico por falta de validación biométrica",
            contenido_principal: "Estimado beneficiario: Detectamos una inconsistencia en la renovación de su crédito educativo. Si no actualiza sus credenciales bancarias y firma digital en las próximas 2 horas, su matrícula será reportada en mora y el desembolso quedará cancelado.",
            texto_boton_trampa: "Validar Firma y Evitar Suspensión",
            url_trampa: "http://185.220.101.42/icetex-login-portal/auth.php",
            pistas_forenses: [
                "El dominio remitente termina en .org (icetex-portal-juridico.org), mientras que toda entidad del Estado colombiano usa .gov.co.",
                "El enlace del botón apunta a una dirección IP extranjera sin cifrado (http://185.220.101.42).",
                "Apela al miedo financiero y exige actuar en menos de 2 horas para impedir que verifiques."
            ]
        },
        {
            id_mision: 2,
            titulo: "Misión 2: Paquete Retenido en Aduana 4-72",
            vector: "Smishing",
            dificultad: "Básico",
            tiempo_limite: 120,
            descripcion_corta: "Analiza un mensaje de texto SMS en tu teléfono móvil que exige un pago rápido de impuestos.",
            remitente_nombre: "Mensaje de Texto SMS",
            remitente_identificador: "+57 318 492 0184",
            asunto_o_contexto: "Alerta de Entrega Fallida - Central de Envíos",
            contenido_principal: "4-72 INFORMA: Su paquete internacional #CO-884920 presenta retención aduanera por datos incompletos. Pague el excedente de $8.900 COP hoy o será devuelto a origen. Gestione aquí:",
            texto_boton_trampa: "bit.ly/pago-aduana-472col",
            url_trampa: "http://rastreo-472-pagos-pse.xyz/tarjeta",
            pistas_forenses: [
                "El mensaje proviene de un número celular común (+57 318...) en lugar de un código corto oficial.",
                "Utiliza un acortador bit.ly que oculta un dominio fraudulento (.xyz) diseñado para clonar tarjetas.",
                "Solicita un micro-pago urgente para capturar los datos de tu tarjeta o cuenta PSE."
            ]
        },
        {
            id_mision: 3,
            titulo: "Misión 3: Llamada del Departamento Antifraude Bancario",
            vector: "Vishing",
            dificultad: "Intermedio",
            tiempo_limite: 140,
            descripcion_corta: "Escucha y analiza la llamada de un supuesto ejecutivo de seguridad que intenta bloquear una compra falsa.",
            remitente_nombre: "Seguridad Bancaria (Llamada Entrante)",
            remitente_identificador: "Línea Fija (601) 749-0000 - Spoofing",
            asunto_o_contexto: "Alerta de compra internacional en curso por $2.450.000 COP",
            contenido_principal: "Buen día. Le hablamos del área de monitoreo antifraude de su banco. Detectamos una compra en línea en comercios internacionales hace 3 minutos. Para cancelar el cobro y reversar el dinero a su cuenta, acabo de enviarle un código de seguridad de 6 dígitos por SMS; por favor léamelo en voz alta antes de que el sistema procese el débito.",
            texto_boton_trampa: "Dictar el código OTP de 6 dígitos al asesor",
            url_trampa: "tel:otp-compromise-action",
            pistas_forenses: [
                "Ningún banco solicita códigos OTP (One-Time Password) por teléfono para cancelar o reversar transacciones.",
                "El atacante utiliza ese código de 6 dígitos para autorizar en tiempo real el robo de tu cuenta.",
                "El número en pantalla puede ser falsificado mediante Caller ID Spoofing."
            ]
        },
        {
            id_mision: 4,
            titulo: "Misión 4: Soporte Técnico de Emergencia por WhatsApp",
            vector: "Ing. Social",
            dificultad: "Avanzado",
            tiempo_limite: 130,
            descripcion_corta: "Evalúa un mensaje directo en WhatsApp de un supuesto coordinador de TI de la universidad.",
            remitente_nombre: "Soporte TI Institucional",
            remitente_identificador: "+57 301 998 4412 (Cuenta No Verificada)",
            asunto_o_contexto: "Actualización obligatoria de token de correo institucional",
            contenido_principal: "Hola. Soy el Ing. Carlos Mendoza de Mesa de Ayuda TI. Estamos migrando los servidores de correo estudiantil por un ataque reciente y tu cuenta aparece en cola de borrado. Envíame por este chat tu contraseña actual o aprueba la notificación de acceso que acaba de salir en tu pantalla para no perder tus materias inscritas.",
            texto_boton_trampa: "Compartir clave / Aprobar acceso en el chat",
            url_trampa: "https://wa.me/soporte-falso-ti",
            pistas_forenses: [
                "El personal de soporte técnico jamás necesita conocer tu contraseña actual para realizar migraciones.",
                "Solicitar aprobar notificaciones de segundo factor (MFA Fatigue) es una técnica clásica de Ingeniería Social.",
                "Combina principio de autoridad (Ingeniero de TI) con temor a perder el semestre."
            ]
        }
    ],

    misionActivaId: 1,
    listaUsuariosAdmin: [],
    listaGruposAdmin: [],

    obtenerHabilidadesPorDefecto: function(categoria) {
        const mapa = {
            'Phishing': ['Phishing', 'Análisis de Cabeceras', 'Verificación de Dominios', 'Respuesta a Incidentes'],
            'Smishing': ['Smishing', 'Inspección de Enlaces Acortados', 'Seguridad Móvil', 'Prevención de Fraude SMS'],
            'Vishing': ['Vishing', 'Protección de Códigos OTP', 'Verificación de Identidad', 'Defensa Telefónica'],
            'Ing. Social': ['Ingeniería Social', 'Control de Urgencia', 'Validación de Autoridad', 'Pensamiento Crítico']
        };
        return mapa[categoria] || [categoria || 'Ciberseguridad', 'Detección de Amenazas', 'Prevención de Fraude'];
    },

    sincronizarCursosDesdeBD: async function() {
        try {
            const respuesta = await fetch('http://localhost:3000/api/cursos');
            if (respuesta.ok) {
                const cursosBD = await respuesta.json();
                if (Array.isArray(cursosBD) && cursosBD.length > 0) {
                    this.catalogoCursos = cursosBD.map(c => {
                        const habs = Array.isArray(c.habilidades) ? c.habilidades : JSON.parse(c.habilidades || '[]');
                        return {
                            ...c,
                            senales_alerta: Array.isArray(c.senales_alerta) ? c.senales_alerta : JSON.parse(c.senales_alerta || '[]'),
                            habilidades: habs.length > 0 ? habs : this.obtenerHabilidadesPorDefecto(c.categoria)
                        };
                    });
                }
            }
        } catch (error) {
            console.error('Usando catálogo local de respaldo:', error);
        }

        // Sincronizar también misiones y progreso del usuario si hay sesión
        await this.sincronizarMisionesDesdeBD();
        await this.sincronizarProgresoUsuarioDesdeBD();
        return this.catalogoCursos;
    },

    sincronizarMisionesDesdeBD: async function() {
        try {
            const res = await fetch('http://localhost:3000/api/misiones');
            if (res.ok) {
                const misionesBD = await res.json();
                if (Array.isArray(misionesBD) && misionesBD.length > 0) {
                    this.catalogoMisiones = misionesBD.map(m => ({
                        ...m,
                        pistas_forenses: Array.isArray(m.pistas_forenses) ? m.pistas_forenses : JSON.parse(m.pistas_forenses || '[]')
                    }));
                }
            }
        } catch (e) {
            // Mantiene las 4 misiones por defecto en memoria
        }
    },

    sincronizarProgresoUsuarioDesdeBD: async function() {
        const userId = this.estadoUsuario.id;
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:3000/api/usuarios/${userId}/progreso`);
            if (res.ok) {
                const filas = await res.json();
                const mapaProgreso = {};
                filas.forEach(f => {
                    mapaProgreso[f.id_curso] = {
                        completado: f.completado && f.puntaje_quiz >= 60,
                        puntaje_quiz: f.puntaje_quiz,
                        intentos: f.intentos
                    };
                });
                this.estadoUsuario.progresoCursos = mapaProgreso;
            }
        } catch (e) {
            console.error('No se pudo cargar el progreso de logros:', e);
        }
    },

    sincronizarDatosAdminDesdeBD: async function() {
        const token = sessionStorage.getItem('neuroshield_token');
        if (!token || this.estadoUsuario.rol !== 'Administrador') return;

        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [resUsuarios, resGrupos] = await Promise.all([
                fetch('http://localhost:3000/api/admin/usuarios', { headers }),
                fetch('http://localhost:3000/api/admin/grupos', { headers })
            ]);

            if (resUsuarios.ok) this.listaUsuariosAdmin = await resUsuarios.json();
            if (resGrupos.ok) this.listaGruposAdmin = await resGrupos.json();
        } catch (error) {
            console.error('Error al sincronizar datos de administración:', error);
        }
    },

    evaluarDiagnostico: function(respuestasPorVector) {
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
                texto: "Completa primero los cursos de Phishing y Vishing para desbloquear tus insignias antes de pasar al simulador."
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
                texto: "Revisa el curso del vector donde obtuviste mayor barra de riesgo y pasa al Centro de Misiones."
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
                texto: "Pon a prueba tu velocidad de respuesta bajo presión en las 4 misiones del simulador."
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
        const mision = this.catalogoMisiones.find(m => String(m.id_mision) === String(this.misionActivaId)) || this.catalogoMisiones[0];
        const vector = mision.vector || 'Phishing';
        let impacto = 0;
        let estadoDecision = '';
        let reporte = [];

        if (accion === 'caer') {
            impacto = 20;
            estadoDecision = 'CRÍTICO: Caíste en la trampa del atacante';
            reporte = [
                `<span class='error'>[ALERTA CRÍTICA] Ejecutaste la acción maliciosa en el escenario "${mision.titulo}".</span>`,
                `Vector comprometido: ${vector} (${mision.remitente_identificador})`,
                `Impacto en tu perfil: +20% de vulnerabilidad en el vector ${vector}.`
            ];
        } else if (accion === 'ignorar' || accion === 'tiempo') {
            impacto = -5;
            estadoDecision = accion === 'tiempo' ? 'TIEMPO AGOTADO: Sin respuesta oportuna' : 'PRECAUCIÓN: Amenaza ignorada pero no reportada';
            reporte = [
                `<span class='warn'>[ADVERTENCIA] Evitaste caer en "${mision.titulo}", pero no alertaste al equipo de seguridad.</span>`,
                `Recuerda que reportar el ataque protege al resto de la organización.`,
                `Impacto en tu perfil: -5% de vulnerabilidad en el vector ${vector}.`
            ];
        } else if (accion === 'reportar') {
            impacto = -20;
            estadoDecision = 'EXCELENTE: Amenaza neutralizada y reportada';
            reporte = [
                `<span class='ok'>[DEFENSA EXITOSA] Identificaste y reportaste correctamente el ataque "${mision.titulo}".</span>`,
                `El remitente (${mision.remitente_identificador}) fue bloqueado en las reglas de seguridad.`,
                `Impacto en tu perfil: -20% de vulnerabilidad en el vector ${vector}.`
            ];
        }

        const valorActualVector = this.estadoUsuario.riesgoPorVector[vector] ?? 50;
        this.estadoUsuario.riesgoPorVector[vector] = Math.max(10, Math.min(95, valorActualVector + impacto));

        const valores = Object.values(this.estadoUsuario.riesgoPorVector);
        this.estadoUsuario.riesgoActual = Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);

        this.ultimoResultadoSimulacion = {
            mision: mision,
            accion: accion,
            impacto: impacto,
            estadoDecision: estadoDecision,
            nuevoRiesgoVector: this.estadoUsuario.riesgoPorVector[vector],
            nuevoRiesgoGlobal: this.estadoUsuario.riesgoActual,
            logs: reporte
        };

        return {
            misionId: mision.id_mision,
            impacto: impacto,
            nuevoRiesgo: this.estadoUsuario.riesgoActual,
            logs: reporte
        };
    }
};