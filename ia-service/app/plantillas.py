"""Banco de contenidos para los borradores de curso y examen.

La red neuronal decide qué vector y qué nivel necesita refuerzo; estas
plantillas aportan el texto base. Todo borrador pasa por revisión del
administrador antes de publicarse, y este archivo puede ampliarse sin
tocar el modelo.
"""


def _p(nivel, pregunta, opciones, correcta, explicacion):
    return {
        "nivel": nivel,
        "pregunta": pregunta,
        "opciones": [{"texto": t, "es_correcta": i == correcta} for i, t in enumerate(opciones)],
        "explicacion": explicacion,
    }


PLANTILLAS = {
    "Phishing": {
        "icono": "fa-envelope-open-text",
        "titulos": {
            "Básico": "Refuerzo de Phishing: cómo reconocer un correo fraudulento",
            "Intermedio": "Phishing en la práctica: verificación de remitentes y enlaces",
            "Avanzado": "Phishing dirigido: suplantación de entidades y proveedores",
        },
        "resumen": "Curso de refuerzo para identificar correos que suplantan bancos, entidades del Estado "
                   "y servicios conocidos con el fin de robar credenciales o datos financieros.",
        "como_funciona": "El atacante envía un correo que imita la imagen de una entidad de confianza y crea "
                         "una urgencia (bloqueo de cuenta, deuda, premio). El mensaje lleva a un sitio falso "
                         "que copia el original y captura el usuario, la contraseña o los datos de la tarjeta. "
                         "En ataques dirigidos, el correo incluye datos reales de la víctima para ganar credibilidad.",
        "senales_alerta": [
            "El dominio del remitente no coincide con el dominio oficial de la entidad.",
            "El mensaje exige actuar de inmediato bajo amenaza de bloqueo, multa o pérdida.",
            "El enlace visible no corresponde a la dirección real a la que apunta.",
            "Solicita contraseñas, códigos o datos de tarjeta por correo o formulario.",
        ],
        "prevencion": "Escribe tú mismo la dirección oficial en el navegador en lugar de usar el enlace del correo. "
                      "Revisa el dominio completo del remitente, activa la verificación en dos pasos y reporta el "
                      "mensaje al área de seguridad antes de eliminarlo.",
        "habilidades": ["Phishing", "Análisis de Cabeceras", "Verificación de Dominios", "Respuesta a Incidentes"],
        "materiales": [
            {"titulo": "Anatomía de un correo de phishing",
             "contenido_texto": "Un correo fraudulento tiene tres partes que conviene revisar siempre: el remitente "
                                "(nombre visible y dominio real), el cuerpo (urgencia, errores, saludo genérico) y la "
                                "acción solicitada (enlace, adjunto o respuesta con datos). Antes de hacer clic, pasa "
                                "el cursor sobre el enlace y compara el dominio con el de la entidad: las entidades "
                                "públicas colombianas usan .gov.co y los bancos, su dominio corporativo."},
            {"titulo": "Qué hacer si ya hiciste clic",
             "contenido_texto": "Cambia la contraseña desde el sitio oficial, cierra las sesiones abiertas, avisa a tu "
                                "banco o al área de TI y reporta el correo. Actuar en los primeros minutos reduce el daño.",
             "es_post_quiz": True},
        ],
        "preguntas": [
            _p("Básico", "Recibes un correo de 'soporte@banco-seguridad-co.net' que pide confirmar tu clave. ¿Qué revisas primero?",
               ["El logotipo y los colores del correo.", "El dominio del remitente frente al dominio oficial del banco.",
                "La hora a la que llegó el mensaje."], 1,
               "La imagen se copia con facilidad; el dominio del remitente es la señal más confiable."),
            _p("Básico", "Un correo anuncia que tu cuenta será bloqueada en 2 horas si no ingresas a un enlace. ¿Cuál es la respuesta segura?",
               ["Ingresar escribiendo la dirección oficial en el navegador y reportar el correo.",
                "Hacer clic rápido para evitar el bloqueo.", "Reenviar el correo a tus contactos para advertirles."], 0,
               "La urgencia es una táctica de presión. Entrar por la dirección oficial evita el sitio falso."),
            _p("Intermedio", "El enlace muestra 'www.dian.gov.co' pero al pasar el cursor apunta a 'dian-gov.co-pagos.xyz'. ¿Qué indica?",
               ["Es un servidor de respaldo de la entidad.", "Es normal en correos masivos.",
                "El texto visible fue disfrazado y el destino real es un sitio fraudulento."], 2,
               "El dominio real es lo que aparece justo antes de la primera barra: aquí es co-pagos.xyz."),
            _p("Intermedio", "Recibes una factura electrónica en un archivo .zip de un proveedor que no reconoces. ¿Qué haces?",
               ["Lo abro para ver de qué proveedor se trata.", "No lo abro, verifico con el área correspondiente y lo reporto.",
                "Lo descargo y lo analizo más tarde en casa."], 1,
               "Los adjuntos comprimidos inesperados son un medio frecuente para instalar malware."),
            _p("Avanzado", "Un correo usa tu nombre, tu cargo y menciona un proyecto real para pedir un pago urgente a una cuenta nueva. ¿Qué tipo de ataque es?",
               ["Phishing dirigido (spear phishing) con suplantación de un directivo o proveedor.",
                "Spam publicitario sin riesgo.", "Un error del sistema de facturación."], 0,
               "Los datos reales buscan credibilidad. Todo cambio de cuenta de pago se confirma por un canal distinto."),
            _p("Avanzado", "El dominio del remitente es 'bancolombla.com'. ¿Qué técnica se está usando?",
               ["Cifrado del correo.", "Dominio parecido (typosquatting) que cambia una letra del original.",
                "Redirección legítima del banco."], 1,
               "Cambiar una letra por otra similar engaña a quien lee rápido; conviene leer el dominio letra por letra."),
        ],
    },
    "Smishing": {
        "icono": "fa-comment-sms",
        "titulos": {
            "Básico": "Refuerzo de Smishing: mensajes de texto fraudulentos",
            "Intermedio": "Smishing en la práctica: enlaces acortados y cobros falsos",
            "Avanzado": "Smishing avanzado: suplantación de remitentes y fraude móvil",
        },
        "resumen": "Curso de refuerzo para detectar mensajes SMS y de mensajería que suplantan empresas de envíos, "
                   "bancos y entidades para obtener pagos o datos personales.",
        "como_funciona": "El atacante envía un SMS breve con un enlace acortado y un motivo creíble: un paquete "
                         "retenido, un subsidio aprobado o un movimiento bancario. El enlace abre una página que pide "
                         "datos de tarjeta, credenciales o la instalación de una aplicación maliciosa.",
        "senales_alerta": [
            "El mensaje llega desde un número celular común y no desde un código corto oficial.",
            "Incluye enlaces acortados o dominios extraños (.xyz, .top, .info).",
            "Pide un pago pequeño y urgente para liberar un envío o evitar una sanción.",
            "Ofrece premios, subsidios o devoluciones que no solicitaste.",
        ],
        "prevencion": "No abras enlaces recibidos por SMS: consulta el estado del envío o de la cuenta en la aplicación "
                      "o el sitio oficial. No instales aplicaciones fuera de la tienda oficial y bloquea y reporta el número.",
        "habilidades": ["Smishing", "Inspección de Enlaces Acortados", "Seguridad Móvil", "Prevención de Fraude SMS"],
        "materiales": [
            {"titulo": "Cómo leer un SMS sospechoso",
             "contenido_texto": "Revisa tres elementos: quién envía (número largo o código corto), qué pide (pago, datos "
                                "o descarga) y a dónde lleva el enlace. Las empresas de mensajería no cobran aranceles por "
                                "enlaces enviados en SMS, y los bancos no piden claves por mensaje de texto."},
            {"titulo": "Pasos si entregaste datos por un SMS",
             "contenido_texto": "Llama a tu banco para bloquear la tarjeta, revisa los movimientos recientes, cambia tus "
                                "claves y conserva el mensaje como evidencia para el reporte.",
             "es_post_quiz": True},
        ],
        "preguntas": [
            _p("Básico", "Un SMS dice: 'Su paquete está retenido, pague $8.900 aquí: bit.ly/envio'. ¿Cuál es la señal principal de fraude?",
               ["El valor del cobro es bajo.", "El enlace acortado y el remitente no oficial con urgencia de pago.",
                "Que el mensaje esté en español."], 1,
               "El acortador oculta el dominio real y el cobro pequeño busca que pagues sin pensarlo."),
            _p("Básico", "¿Cuál es la forma segura de verificar un supuesto envío retenido?",
               ["Abrir el enlace desde el computador.", "Responder al SMS pidiendo más datos.",
                "Consultar el número de guía en el sitio o la aplicación oficial de la transportadora."], 2,
               "La verificación siempre se hace por un canal que tú inicias, no por el que propone el mensaje."),
            _p("Intermedio", "Recibes un SMS de un número celular que afirma ser tu banco y pide 'validar tu identidad' en un enlace. ¿Qué haces?",
               ["No abro el enlace, bloqueo el número y consulto en la aplicación oficial del banco.",
                "Abro el enlace pero no escribo la clave.", "Llamo al número que envió el mensaje."], 0,
               "Abrir el enlace ya expone tu dispositivo, y el número del mensaje pertenece al atacante."),
            _p("Intermedio", "Un mensaje anuncia un subsidio aprobado y pide descargar una aplicación desde un enlace. ¿Cuál es el riesgo?",
               ["Ninguno si el teléfono tiene clave.", "La aplicación puede leer tus SMS y robar los códigos de verificación.",
                "Solo se consumen datos móviles."], 1,
               "Las aplicaciones instaladas fuera de la tienda oficial pueden interceptar códigos OTP."),
            _p("Avanzado", "Un SMS fraudulento aparece en el mismo hilo donde tu banco te envía mensajes reales. ¿Cómo es posible?",
               ["El banco fue quien lo envió.", "Tu teléfono tiene un virus.",
                "El atacante falsificó el nombre del remitente (spoofing) y el teléfono agrupa los mensajes."], 2,
               "El nombre del remitente de un SMS se puede falsificar, así que el hilo no garantiza autenticidad."),
            _p("Avanzado", "Tras un SMS de 'actualización de SIM' tu línea queda sin señal. ¿Qué ataque puede estar ocurriendo?",
               ["Duplicación de SIM (SIM swapping) para recibir tus códigos bancarios.",
                "Una falla normal del operador.", "Un bloqueo por falta de pago."], 0,
               "Con la línea duplicada, el atacante recibe tus códigos. Hay que contactar al operador y al banco de inmediato."),
        ],
    },
    "Vishing": {
        "icono": "fa-phone-volume",
        "titulos": {
            "Básico": "Refuerzo de Vishing: llamadas que suplantan a tu banco",
            "Intermedio": "Vishing en la práctica: protección de códigos y claves",
            "Avanzado": "Vishing avanzado: suplantación de número y voz",
        },
        "resumen": "Curso de refuerzo para reconocer llamadas en las que un supuesto asesor bancario, técnico o "
                   "funcionario presiona para obtener códigos, claves o transferencias.",
        "como_funciona": "El atacante llama haciéndose pasar por el área de seguridad de una entidad. Usa datos "
                         "reales de la víctima para ganar confianza, describe una emergencia (una compra sospechosa "
                         "o un bloqueo) y pide el código que acaba de llegar al celular, con el cual autoriza la operación.",
        "senales_alerta": [
            "Piden códigos OTP, claves o datos completos de la tarjeta durante la llamada.",
            "Crean una emergencia que solo se resuelve si actúas en ese momento.",
            "Piden no colgar ni consultar con nadie mientras 'se soluciona' el problema.",
            "Solicitan instalar una aplicación de acceso remoto o transferir a una 'cuenta segura'.",
        ],
        "prevencion": "Cuelga y llama tú a la línea oficial impresa en tu tarjeta. Ninguna entidad pide códigos OTP "
                      "ni claves por teléfono. No instales aplicaciones por indicación de quien llama.",
        "habilidades": ["Vishing", "Protección de Códigos OTP", "Verificación de Identidad", "Defensa Telefónica"],
        "materiales": [
            {"titulo": "El guion típico de una llamada fraudulenta",
             "contenido_texto": "Casi todas siguen cuatro pasos: saludo con tus datos para generar confianza, anuncio de "
                                "una emergencia, solicitud de un código o clave y presión para no colgar. Reconocer el "
                                "guion permite cortar la llamada en el segundo paso."},
            {"titulo": "Regla de oro: cuelga y devuelve la llamada",
             "contenido_texto": "Si la llamada es legítima, la entidad atenderá igual cuando llames a su línea oficial. "
                                "Si entregaste un código, comunícate de inmediato con el banco para bloquear los productos.",
             "es_post_quiz": True},
        ],
        "preguntas": [
            _p("Básico", "Te llaman del 'área antifraude' y piden el código de 6 dígitos que llegó a tu celular para cancelar una compra. ¿Qué haces?",
               ["Lo dicto porque conocen mi nombre completo.", "Doy solo los tres primeros dígitos.",
                "Cuelgo y llamo a la línea oficial del banco."], 2,
               "Ese código autoriza la operación. Ningún banco lo solicita por teléfono."),
            _p("Básico", "¿Qué dato NUNCA te pedirá una entidad financiera en una llamada?",
               ["La clave o el código OTP.", "Tu nombre.", "El motivo de tu consulta."], 0,
               "Las claves y los códigos son personales e intransferibles, sin excepción."),
            _p("Intermedio", "El supuesto asesor conoce tu cédula y tu dirección. ¿Eso demuestra que la llamada es legítima?",
               ["Sí, solo el banco tiene esos datos.", "No, esos datos circulan en filtraciones y sirven para ganar confianza.",
                "Sí, si además conoce mi correo."], 1,
               "Los datos personales se obtienen de filtraciones y redes sociales; no prueban quién llama."),
            _p("Intermedio", "Durante la llamada te piden instalar una aplicación para 'proteger tu cuenta'. ¿Cuál es el riesgo?",
               ["Que el teléfono se vuelva más lento.", "Ninguno si la aplicación es gratuita.",
                "Que sea una herramienta de acceso remoto con la que controlen tu dispositivo."], 2,
               "Las herramientas de acceso remoto permiten al atacante operar tus aplicaciones bancarias."),
            _p("Avanzado", "La pantalla muestra el número real de la línea de tu banco. ¿Puedes confiar en la llamada?",
               ["No, el identificador de llamadas se puede falsificar (Caller ID spoofing).",
                "Sí, el número no se puede alterar.", "Sí, si la llamada es en horario de oficina."], 0,
               "El número mostrado es manipulable. Lo seguro es colgar y marcar tú a la línea oficial."),
            _p("Avanzado", "Recibes un audio con la voz de un familiar pidiendo una transferencia urgente desde un número nuevo. ¿Qué haces?",
               ["Transfiero porque reconozco la voz.", "Verifico por otro canal o con una pregunta que solo esa persona sepa responder.",
                "Respondo al mismo número para confirmar."], 1,
               "La voz se puede clonar con pocos segundos de audio. La verificación debe hacerse por un canal distinto."),
        ],
    },
    "Ing. Social": {
        "icono": "fa-user-shield",
        "titulos": {
            "Básico": "Refuerzo de Ingeniería Social: las tácticas de manipulación",
            "Intermedio": "Ingeniería Social en la práctica: autoridad, urgencia y confianza",
            "Avanzado": "Ingeniería Social avanzada: pretextos y fatiga de autenticación",
        },
        "resumen": "Curso de refuerzo para identificar la manipulación psicológica que hay detrás de los ataques: "
                   "autoridad, urgencia, confianza y reciprocidad.",
        "como_funciona": "El atacante no vulnera sistemas, sino personas. Construye un pretexto creíble (soporte "
                         "técnico, un directivo, un compañero) y aprovecha la disposición a ayudar o el temor a una "
                         "sanción para que la víctima entregue accesos, apruebe solicitudes o salte un procedimiento.",
        "senales_alerta": [
            "Alguien pide tu contraseña o aprobar un acceso 'para ayudarte'.",
            "Invocan la autoridad de un cargo para saltarse el procedimiento normal.",
            "La solicitud llega por un canal no oficial (chat personal, número desconocido).",
            "Se combinan urgencia y secreto: 'hazlo ya y no le digas a nadie'.",
        ],
        "prevencion": "Verifica la identidad por un canal independiente antes de actuar, sigue el procedimiento aunque "
                      "quien pida sea una autoridad, no apruebes solicitudes de acceso que no iniciaste y reporta el intento.",
        "habilidades": ["Ingeniería Social", "Control de Urgencia", "Validación de Autoridad", "Pensamiento Crítico"],
        "materiales": [
            {"titulo": "Los cuatro disparadores de la manipulación",
             "contenido_texto": "Autoridad (alguien con poder lo ordena), urgencia (no hay tiempo para verificar), "
                                "confianza (parece conocido) y reciprocidad (te hace un favor primero). Cuando notes "
                                "dos o más a la vez, detente y verifica antes de responder."},
            {"titulo": "Cómo decir que no sin conflicto",
             "contenido_texto": "Responde que debes seguir el procedimiento y que confirmarás por el canal oficial. Una "
                                "solicitud legítima soporta la verificación; una fraudulenta, no.",
             "es_post_quiz": True},
        ],
        "preguntas": [
            _p("Básico", "¿Cuál es el objetivo principal de la ingeniería social?",
               ["Dañar físicamente los equipos.", "Manipular a la persona para que entregue información o accesos.",
                "Adivinar contraseñas con programas automáticos."], 1,
               "El ataque se dirige a la persona, no a la tecnología."),
            _p("Básico", "Un supuesto técnico de soporte te pide tu contraseña por chat para 'migrar tu cuenta'. ¿Qué haces?",
               ["No la entrego y verifico con la mesa de ayuda oficial.", "Se la doy y la cambio después.",
                "Le envío solo la mitad de la contraseña."], 0,
               "El soporte técnico nunca necesita tu contraseña para realizar su trabajo."),
            _p("Intermedio", "Un mensaje de un 'directivo' pide comprar tarjetas de regalo con urgencia y mantenerlo en secreto. ¿Qué tácticas combina?",
               ["Reciprocidad y cortesía.", "Curiosidad y humor.", "Autoridad, urgencia y secreto."], 2,
               "La combinación de autoridad, urgencia y secreto busca impedir que verifiques la solicitud."),
            _p("Intermedio", "Encuentras una memoria USB marcada 'Nómina 2026' en el parqueadero. ¿Qué haces?",
               ["La conecto para identificar al dueño.", "La entrego al área de seguridad sin conectarla.",
                "La conecto en un equipo que no sea el mío."], 1,
               "Dejar dispositivos con nombres llamativos es una táctica de cebo (baiting) para instalar malware."),
            _p("Avanzado", "Recibes varias notificaciones seguidas para aprobar un inicio de sesión que no hiciste. ¿Qué ocurre y qué haces?",
               ["Es un intento de fatiga de MFA: rechazo todas, cambio la contraseña y reporto.",
                "Es un error de la aplicación: apruebo una para que se detengan.", "Ignoro el teléfono hasta que paren."], 0,
               "El atacante ya tiene tu contraseña y espera que apruebes por cansancio."),
            _p("Avanzado", "Alguien con uniforme de proveedor pide que le sostengas la puerta de un área restringida. ¿Cuál es la respuesta adecuada?",
               ["Dejarlo pasar por cortesía.", "Pedirle el carné y dejarlo pasar.",
                "Indicarle que se registre en recepción, sin permitir el ingreso."], 2,
               "Entrar detrás de alguien autorizado (tailgating) aprovecha la cortesía; el registro formal es el control."),
        ],
    },
}
