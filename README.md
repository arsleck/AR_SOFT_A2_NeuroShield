# NeuroShield
## Versión final: Frontend, Backend, Base de Datos y Servicio de Inteligencia Artificial

**Proyecto:** Simulador inteligente de escenarios de ciberataques para la capacitación en ciberseguridad  
**Asignatura:** Arquitectura de Software – Universidad Manuela Beltrán  
**Metodología:** Aprendizaje Basado en Proyectos (ABP)  
**Autores:** Diego Nicolas Cuervo Ochoa y Karen Tatiana Chaves Bonilla

---

## Tabla de contenido

1. [Descripción del avance](#1-descripción-del-avance-fase-4)
2. [Arquitectura del sistema](#2-organización-y-justificación-de-la-arquitectura)
3. [Funcionalidades implementadas](#3-funcionalidades-de-la-versión-integrada)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Flujo de integración](#5-flujo-de-integración-y-operaciones-funcionales)
6. [Endpoints principales](#6-endpoints-principales-de-la-api-rest)
7. [Configuración y ejecución](#7-instrucciones-de-configuración-y-ejecución)
8. [Reglas de negocio](#8-reglas-de-negocio-y-evaluación-adaptativa)
9. [Matriz de pruebas de integración](#9-matriz-de-pruebas-de-integración)
10. [Diagramas del proyecto](#10-diagramas-del-proyecto)
11. [Trabajo futuro y escalabilidad](#11-trabajo-futuro-y-escalabilidad)
12. [Integración del servicio de Inteligencia Artificial](#12-integración-del-servicio-de-inteligencia-artificial)
13. [Gestión de pruebas en Qase](#13-gestión-de-pruebas-en-qase)

> **Reporte de pruebas de la versión final:** [44 de 44 casos aprobados en Qase](https://app.qase.io/public/report/a924a632d82adf02fee02462b88000544d82504e)

---

## 1. Descripción del avance (Fase 4)

> **Versión final (cierre técnico):** sobre la integración descrita en esta sección se incorporó el servicio de Inteligencia Artificial, una red neuronal convolucional que estima la vulnerabilidad de cada usuario y orienta la creación de cursos. Su integración se documenta en la [sección 12](#12-integración-del-servicio-de-inteligencia-artificial).

Esta entrega evoluciona el prototipo desarrollado en las fases anteriores hacia una arquitectura **Full-Stack integrada y con persistencia de datos**, manteniendo el patrón **Modelo-Vista-Controlador (MVC)** modularizado en el cliente y articulándolo con una **API RESTful** en el servidor, construida con Node.js y Express y conectada a una base de datos relacional en la nube: **PostgreSQL mediante Neon**.

El sistema deja atrás el uso de datos estáticos en memoria y pasa a trabajar con persistencia real. Para ello, incorpora autenticación de usuarios mediante **JSON Web Tokens (JWT)**, almacenamiento seguro de contraseñas mediante **Bcrypt** y control de acceso basado en roles (**RBAC**) para los perfiles `Estudiante` y `Administrador`.

Además, permite crear y consultar microcursos con recursos multimedia y documentos descargables, y dispone de un laboratorio Sandbox multicanal para entrenar frente a **cuatro vectores de ataque**, mediante **cinco dinámicas interactivas de simulación**.

## 2. Organización y justificación de la arquitectura

De acuerdo con el diseño del proyecto, el sistema separa sus responsabilidades en cuatro capas. Esta organización busca mantener un bajo acoplamiento, una alta cohesión y facilitar el mantenimiento y la evolución del software.

### 2.1. Frontend – Capa de presentación y controlador cliente

**Tecnologías principales:** HTML, CSS y JavaScript.

El frontend funciona como una aplicación de página única (*Single Page Application* o SPA), con una interfaz visual inspirada en Cisco Networking Academy. Se organiza en los siguientes módulos:

- **Vistas y páginas (`js/views/ui.js`, `js/pages/` y `js/components/`):** presentan la información y renderizan dinámicamente las vistas de inicio de sesión, registro, dashboard, perfil, aprendizaje, misiones, simulador, resultados y gestión.
- **Componentes reutilizables (`js/components/`):** contienen elementos compartidos, como la barra de navegación, el menú lateral y los componentes de diagnóstico y construcción de contenido.
- **Controlador SPA (`js/controllers/app.js`):** administra el enrutamiento mediante hash, las guardias de navegación según la sesión y el rol, los temporizadores, la síntesis de voz mediante `speechSynthesis`, las validaciones de formularios con expresiones regulares y el envío de solicitudes asíncronas.
- **Modelo cliente (`js/models/data.js`):** mantiene el estado del usuario, sincroniza la información con el backend y realiza los cálculos relacionados con los niveles de vulnerabilidad por vector.

Las gráficas analíticas se presentan mediante Chart.js. Las vistas se encargan de la presentación y no contienen directamente la lógica de acceso a la base de datos.

### 2.2. Backend – Capa de lógica de negocio y servicios

**Tecnologías principales:** Node.js y Express.

El backend se encuentra en `backend/server.js` y funciona como intermediario entre el frontend y PostgreSQL. Sus responsabilidades incluyen:

- Recibir y procesar solicitudes HTTP provenientes del cliente.
- Validar la información recibida antes de ejecutar operaciones.
- Autenticar usuarios y verificar tokens JWT.
- Proteger las rutas administrativas mediante los middlewares `verificarToken` y `soloAdmin`.
- Gestionar recursos multimedia mediante `multer` y datos en formato DataURL.
- Ejecutar consultas parametrizadas para interactuar con la base de datos.
- Controlar operaciones transaccionales mediante `BEGIN`, `COMMIT` y `ROLLBACK`, cuando corresponde.

### 2.3. Base de datos – Capa de persistencia relacional

**Tecnología:** PostgreSQL alojado en Neon.

La persistencia se define mediante el script `database/neuroshield_db.sql`. El modelo contempla ocho entidades relacionales:

1. `Grupos`
2. `Usuarios`
3. `Cursos`
4. `Curso_Materiales`
5. `Curso_Quizzes`
6. `Progreso_Cursos`
7. `Misiones`
8. `Historial_Simulaciones`

La estructura utiliza claves primarias (`PRIMARY KEY`) y claves foráneas (`FOREIGN KEY`) para mantener la integridad referencial entre los registros.

### 2.4. Comunicación – Intercambio cliente-servidor

La comunicación entre frontend y backend se realiza mediante una **API REST sobre HTTP/HTTPS**. El intercambio de información utiliza:

- Métodos HTTP: `GET`, `POST`, `PUT` y `DELETE`.
- Datos enviados y recibidos en formato `JSON`.
- Cabeceras de autorización con el esquema `Bearer Token` para las rutas protegidas.
- Códigos de estado HTTP estandarizados, entre ellos `200`, `201`, `400`, `401`, `403`, `404` y `500`.

---

## 3. Funcionalidades de la versión integrada

### 3.1. Autenticación y control de acceso por roles

- Registro e inicio de sesión conectados a PostgreSQL.
- Encriptación de contraseñas mediante Bcrypt.
- Emisión y validación de tokens JWT.
- Control de acceso basado en roles: `Estudiante` y `Administrador`.
- Restricción del acceso a la ruta `#/gestion` para usuarios con rol `Administrador`.

### 3.2. Diagnóstico inicial y perfil analítico (`#/perfil`)

- Evaluación diagnóstica de vulnerabilidad por vector.
- Visualización gráfica de los niveles de riesgo para Phishing, Smishing, Vishing e Ingeniería Social.
- Recomendaciones adaptativas según los resultados del usuario.
- Consulta y actualización de información personal y credenciales.

### 3.3. Catálogo de microcursos e insignias (`#/aprendizaje`)

- Cursos organizados en módulos y acordeones.
- Contenido teórico y señales de alerta.
- Recursos multimedia: imágenes, videos y audios.
- Documentos disponibles para descarga.
- Evaluaciones tipo Quiz con retroalimentación inmediata.
- Desbloqueo de insignias y logros al obtener una calificación igual o superior al 60 %.

### 3.4. Laboratorio Sandbox multicanal (`#/misiones` y `#/simulador`)

El laboratorio permite practicar la identificación y gestión de situaciones simuladas relacionadas con cuatro vectores de ataque:

| Vector | Entorno de simulación |
|---|---|
| Phishing | Cliente de correo corporativo |
| Smishing | Pantalla de smartphone con mensajes SMS |
| Vishing | Llamada telefónica entrante con locución sintetizada |
| Ingeniería Social | Chat con una interfaz similar a WhatsApp Web |

El Sandbox incorpora cinco dinámicas interactivas:

1. **Reacción Táctica:** toma de decisiones operativas bajo presión de tiempo.
2. **Cazador de Red Flags:** selección directa de los elementos sospechosos o incorrectos de un mensaje.
3. **Auditoría de URLs y Cabeceras:** inspección técnica de dominios, direcciones IP y firmas SPF/DKIM.
4. **Escudo de Diálogo:** selección de una postura de respuesta basada en el protocolo Zero Trust.
5. **Protocolo de Contención SOC:** organización secuencial de los pasos necesarios para atender un incidente.

La página de simuladores sigue la organización de un LMS (como Canvas):

- **Módulos plegables:** uno por vector, con sus misiones ordenadas de Básico a Avanzado. Cada misión muestra su dificultad, su tiempo, los intentos y su estado: pendiente, en progreso o superada. Una misión se considera superada cuando el usuario reporta la amenaza.
- **Indicaciones de la IA:** el riesgo que estima la red por vector y las etiquetas "Prioridad según la IA" y "Recomendada por IA".
- **Columna "Por hacer":** el plan de refuerzo, las misiones y los cursos que sugiere la red.
- **Pantalla del simulador:** ruta de navegación, las cinco dinámicas como pestañas y botones "Anterior / Siguiente" para recorrer el módulo.

### 3.5. Centro de administración CRUD (`#/gestion`)

El panel administrativo sigue la vista del docente en un LMS: un menú lateral con cinco secciones y tablas con sus acciones.

Cursos y misiones se crean y editan en un **editor por pasos**: Datos generales, Contenido, Módulos adicionales, Examen y Revisar en los cursos, y Datos generales, Mensaje del ataque, Pistas forenses y Revisar en las misiones. Cada paso explica qué va en él y valida sus campos antes de avanzar. Si al publicar falta algo, el editor abre el paso donde está. El paso de revisión muestra una lista de verificación y una vista previa de lo que verá el estudiante. En los borradores sugeridos por la IA, un recuadro explica por qué se propone ese contenido: estudiantes analizados, riesgo por vector y nivel elegido.

- **Cursos:** creación, edición y eliminación de cursos, módulos y preguntas de evaluación, y sugerencia de cursos con IA.
- **Simuladores:** administración de escenarios, remitentes y pistas forenses, y sugerencia de misiones con IA.
- **Personas:** consulta de usuarios, modificación de roles y asignación de grupos.
- **Grupos:** creación y administración de grupos de entrenamiento.
- **Calificaciones:** libro de calificaciones con el riesgo que estima la red neuronal para cada estudiante y vector (coloreado en bajo, medio o alto), el refuerzo sugerido, sus simulaciones y cursos aprobados, y el promedio. Se puede filtrar por grupo y exportar a CSV.

El modelo contempla los atributos `origen` y `prompt_generacion` para mantener trazabilidad de contenidos que puedan ser generados por el sistema, un administrador o un futuro módulo de inteligencia artificial.

---

## 4. Estructura del repositorio

La organización principal del proyecto es la siguiente:

```text
AR_SOFT_A2_NeuroShield/
├── .vscode/
│   └── settings.json
├── backend/
│   ├── services/
│   │   ├── analisisIA.js        # historial del usuario -> servicio de IA -> base de datos
│   │   └── iaClient.js          # cliente HTTP del servicio de IA
│   ├── uploads/
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── css/
│   ├── canvas.css           # vistas estilo LMS: módulos, Por hacer, administración
│   └── styles.css
├── database/
│   └── neuroshield_db.sql
├── ia-service/                  # Servicio de Inteligencia Artificial (Python)
│   ├── app/
│   │   ├── config.py            # vectores, características y umbrales
│   │   ├── features.py          # historial -> matriz de entrada de la red
│   │   ├── main.py              # API FastAPI: /health, /predict, /sugerir-curso, /sugerir-mision
│   │   ├── modelo.py            # arquitectura de la red convolucional (Keras)
│   │   ├── plantillas.py        # banco de contenidos para borradores de curso
│   │   ├── plantillas_misiones.py # banco de escenarios para borradores de misión
│   │   ├── predictor.py         # carga del modelo e inferencia
│   │   └── recomendador.py      # recomendaciones y borradores de curso y misión
│   ├── entrenamiento/
│   │   ├── entrenar.py          # entrenamiento y métricas
│   │   └── generar_dataset.py   # datos sintéticos de entrenamiento
│   ├── modelos/
│   │   ├── metricas.json        # métricas del modelo entrenado
│   │   └── neuroshield_cnn.keras
│   ├── tests/
│   │   └── test_api.py
│   └── requirements.txt
├── Diagramas/
│   ├── Diagrama de casos de uso.jpeg
│   ├── Diagrama de clases.jpeg
│   ├── Diagrama de componentes.jpeg
│   ├── Diagrama.jpeg
│   ├── Modelo MVC.jpeg
│   └── Modelo relacional.jpeg
├── js/
│   ├── components/
│   │   ├── analisisIA.js
│   │   ├── asistenteIA.js
│   │   ├── editorPasos.js
│   │   ├── sidebar.js
│   │   ├── topbar.js
│   │   └── tutorial.js
│   ├── controllers/
│   │   └── app.js
│   ├── models/
│   │   └── data.js
│   ├── pages/
│   │   ├── aprendizaje.js
│   │   ├── dashboard.js
│   │   ├── gestion.js
│   │   ├── login.js
│   │   ├── misiones.js
│   │   ├── perfil.js
│   │   ├── registro.js
│   │   ├── resultados.js
│   │   └── simulador.js
│   └── views/
│       └── ui.js
├── .gitignore
├── Documentación del proyecto.docx
├── Ficha_NeuroShield.png
├── index.html
└── README.md
```

### Descripción de los directorios y archivos principales

| **Directorio o archivo** | **Responsabilidad** |
|---|---|
| `index.html` | Punto de entrada de la aplicación SPA. |
| `css/styles.css` | Hojas de estilo y sistema visual inspirado en Cisco Academy. |
| `css/canvas.css` | Componentes de las vistas estilo LMS (módulos, "Por hacer", navegación del administrador y libro de calificaciones), con prefijo `cv-`. |
| `js/components/` | Componentes reutilizables (`sidebar.js`, `topbar.js`, modales en `tutorial.js` y la tarjeta de resultados de IA en `analisisIA.js`). |
| `js/controllers/app.js` | Enrutador SPA, eventos, validaciones Regex y solicitudes Fetch al backend. |
| `js/models/data.js` | Estado del usuario, cálculos de vulnerabilidad y sincronización con la API. |
| `js/pages/` | Módulos de las 9 vistas de la aplicación (`login`, `registro`, `dashboard`, `perfil`, `aprendizaje`, `misiones`, `simulador`, `resultados`, `gestion`). |
| `js/views/ui.js` | Renderizado del DOM, terminal forense y gráficas con Chart.js. |
| `backend/` | Servidor Express (`server.js`), configuración de paquetes (`package.json`) y carpeta multimedia (`uploads/`). |
| `backend/services/` | Integración con IA: `iaClient.js` consume el servicio y `analisisIA.js` arma el historial, guarda el análisis y genera sugerencias. |
| `ia-service/` | Servicio de Inteligencia Artificial: API FastAPI, red neuronal convolucional, entrenamiento, modelo entrenado y pruebas. |
| `database/neuroshield_db.sql` | Script SQL para crear las 10 tablas relacionales en PostgreSQL (Neon), incluidas las dos de la integración con IA. |
| `Diagramas/` | Diagramas UML de arquitectura, modelo MVC y modelo relacional. |
| `Documentación del proyecto.docx` | Documento maestro actualizado del proyecto. |
| `Ficha_NeuroShield.png` | Ficha resumen visual del proyecto NeuroShield. |

---

## 5. Flujo de integración y operaciones funcionales

El sistema implementa el ciclo completo de comunicación entre el usuario, el frontend, el backend y la base de datos en seis pasos:

1. **Acción del usuario:** el usuario interactúa con un formulario o módulo de la aplicación. Por ejemplo, registra una cuenta, completa un Quiz, ejecuta una misión o crea un curso desde el panel administrativo.
2. **Solicitud del frontend al backend:** el controlador valida los campos en el cliente y envía una petición HTTP asíncrona mediante `fetch` hacia una ruta de la API, por ejemplo `http://localhost:3000/api/...`.
3. **Validación y procesamiento en el backend:** `server.js` verifica el token JWT cuando la ruta lo requiere, valida los datos recibidos y ejecuta la lógica de negocio correspondiente.
4. **Persistencia en la base de datos:** el pool de conexiones ejecuta consultas parametrizadas (`$1`, `$2`, etc.) o transacciones SQL sobre PostgreSQL en Neon.
5. **Respuesta del servidor:** el backend devuelve una respuesta estructurada en JSON junto con el código de estado HTTP correspondiente.
6. **Actualización de la interfaz:** el frontend actualiza el modelo de datos, mantiene el estado de sesión y refresca los componentes visuales, gráficas o mensajes de confirmación y error.

---

## 6. Endpoints principales de la API REST

La siguiente tabla resume las rutas principales contempladas en la integración:

| Método | Ruta | Descripción funcional | Operación en BD |
|---|---|---|---|
| `GET` | `/api/health` | Verifica el estado y disponibilidad del backend. | Consulta |
| `POST` | `/api/registro` | Registra un usuario con contraseña cifrada mediante Bcrypt. | `INSERT` |
| `POST` | `/api/login` | Autentica credenciales y emite un token JWT. | `SELECT` |
| `PUT` | `/api/usuarios/:id` | Actualiza nombre, correo o contraseña desde el perfil. | `UPDATE` |
| `GET` | `/api/usuarios/:id/progreso` | Recupera cursos aprobados e insignias desbloqueadas. | `SELECT` |
| `GET` | `/api/cursos` | Consulta cursos activos, módulos y evaluaciones asociadas. | `SELECT` y `JSON_AGG` |
| `POST` | `/api/cursos` | Crea un curso con módulos y preguntas. | `INSERT` transaccional |
| `PUT` | `/api/cursos/:id` | Modifica un curso, sus habilidades, módulos y evaluaciones. | `UPDATE` |
| `DELETE` | `/api/cursos/:id` | Desactiva un curso del catálogo. | `UPDATE` lógico |
| `POST` | `/api/cursos/:id/progreso` | Registra la calificación y las respuestas del examen, y solicita el análisis al servicio de IA. | `INSERT` / `UPSERT` |
| `GET` | `/api/misiones` | Consulta escenarios activos para los simuladores. | `SELECT` |
| `POST` | `/api/misiones` | Crea un escenario de simulación. | `INSERT` |
| `PUT` | `/api/misiones/:id` | Modifica los parámetros, remitente y pistas forenses de una misión. | `UPDATE` |
| `DELETE` | `/api/misiones/:id` | Desactiva un escenario de simulación. | `UPDATE` lógico |
| `POST` | `/api/misiones/:id/evaluar` | Guarda la telemetría de la simulación, solicita el análisis al servicio de IA y actualiza el nivel de riesgo. | Registro y actualización |
| `GET` | `/api/admin/usuarios` | Consulta usuarios para la administración. | `SELECT` |
| `PUT` | `/api/admin/usuarios/:id` | Actualiza roles (`Estudiante`/`Administrador`) y asignación de grupo. | `UPDATE` |
| `GET` | `/api/admin/grupos` | Consulta los grupos de capacitación. | `SELECT` |
| `POST` | `/api/admin/grupos` | Crea un grupo de capacitación. | `INSERT` |
| `DELETE` | `/api/admin/grupos/:id` | Elimina o desactiva un grupo según la lógica implementada. | Operación de eliminación |
| `GET` | `/api/ia/estado` | Verifica la comunicación con el servicio de IA y devuelve las métricas del modelo. | Ninguna |
| `GET` | `/api/usuarios/:id/analisis-ia` | Recupera el último análisis de IA del usuario (requiere token). | `SELECT` |
| `POST` | `/api/admin/ia/sugerir-curso` | Genera un borrador de curso y examen a partir del desempeño de un grupo (solo administrador). | `SELECT` |
| `POST` | `/api/admin/ia/sugerir-mision` | Genera un borrador de misión del simulador a partir del desempeño de un grupo, sin repetir escenarios existentes (solo administrador). | `SELECT` |
| `GET` | `/api/admin/ia/libro-calificaciones` | Último análisis de la red por estudiante, con su actividad (solo administrador). | `SELECT` |
| `GET` | `/api/usuarios/:id/historial-misiones` | Estado de cada misión del usuario: intentos, si la superó y su última decisión (requiere token). | `SELECT` |

> **Nota:** las rutas se presentan como resumen funcional de la API descrita para esta fase. Para conocer el comportamiento exacto de cada endpoint, sus parámetros y validaciones, se debe consultar su implementación en `backend/server.js`.

---

## 7. Instrucciones de configuración y ejecución

### 7.1. Prerrequisitos

Antes de ejecutar el proyecto, se requiere:

- **Node.js 18 o superior.**
- **npm**, incluido con Node.js.
- Una instancia de **PostgreSQL**, configurada en Neon o en un entorno local.
- **Python 3.10 a 3.13** con `pip`, para el servicio de Inteligencia Artificial.
- Un navegador web moderno.
- Visual Studio Code (opcional).
- La extensión **Live Server** para ejecutar el frontend localmente (opcional).

### 7.2. Paso 1: Configurar la base de datos

1. Ingresa a la consola SQL de tu instancia de Neon o al entorno PostgreSQL que utilizarás.
2. Abre el archivo `database/neuroshield_db.sql`.
3. Ejecuta el contenido del script para crear las tablas relacionales.
4. Verifica que las tablas se hayan creado correctamente.

> Si la base de datos ya existía de una fase anterior, no es necesario volver a ejecutar el script: al iniciar, el backend crea automáticamente las tablas `Respuestas_Quiz` y `Analisis_IA` y la columna `Historial_Simulaciones.tiempo_respuesta`, además de las columnas `perfil_refuerzo` y `refuerzos` de `Analisis_IA`.

### 7.3. Paso 2: Configurar el backend

Abre una terminal en la raíz del repositorio y accede a la carpeta `backend`:

```bash
cd backend
npm install
```

Crea un archivo llamado `.env` dentro de la carpeta `backend/`, tomando como referencia `backend/.env.example`.

Configura las variables de entorno con los datos de tu instancia:

```env
DATABASE_URL=postgresql://usuario:password@ep-tu-instancia.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_PROPIO
PORT=3000
IA_SERVICE_URL=http://localhost:8000
```

**Importante:** reemplaza los valores de ejemplo por las credenciales correspondientes a tu entorno. No compartas ni publiques el archivo `.env`, ya que contiene información privada. Este archivo debe permanecer excluido del repositorio mediante `.gitignore`.

Inicia el servidor:

```bash
node server.js
```

Si la configuración es correcta, el servidor deberá indicar que está ejecutándose en:

```text
http://localhost:3000
```

Puedes comprobar su disponibilidad mediante la ruta:

```text
http://localhost:3000/api/health
```

### 7.4. Paso 3: Ejecutar el servicio de Inteligencia Artificial

En otra terminal, desde la raíz del repositorio:

```bash
cd ia-service
python -m venv .venv
.venv\Scripts\activate          # En Linux o macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

El repositorio ya incluye el modelo entrenado (`ia-service/modelos/neuroshield_cnn.keras`), por lo que no es necesario entrenarlo para ejecutar la aplicación. Para comprobar el servicio:

```text
http://localhost:8000/health        Estado del servicio y métricas del modelo
http://localhost:8000/docs          Documentación interactiva de la API (Swagger)
http://localhost:3000/api/ia/estado Comunicación backend -> servicio de IA
```

Al iniciar, el backend informa en consola si logró conectarse: `Servicio de IA conectado en http://localhost:8000 (modelo cnn1d-v2)`.

### 7.5. Paso 4: Ejecutar el frontend

Con el backend en funcionamiento:

1. Abre la carpeta raíz del proyecto en Visual Studio Code.
2. Localiza el archivo `index.html`.
3. Haz clic derecho y selecciona **Open with Live Server**.
4. Abre la dirección local que proporcione Live Server. Por ejemplo:

```text
http://127.0.0.1:5500/index.html#/login
```

El frontend podrá comunicarse con el backend siempre que la URL de la API y la configuración CORS coincidan con el entorno local.

### 7.6. Orden recomendado de ejecución

1. Iniciar o verificar la base de datos PostgreSQL.
2. Ejecutar el servicio de IA con `uvicorn app.main:app --port 8000`.
3. Ejecutar el backend con `node server.js`.
4. Abrir el frontend mediante Live Server.
5. Ingresar a la aplicación y probar el registro o inicio de sesión.

---

## 8. Reglas de negocio y evaluación adaptativa

> **Actualización de la versión final:** la vulnerabilidad oficial del usuario la estima ahora el servicio de IA (sección 12). Las reglas descritas a continuación se conservan como retroalimentación inmediata en pantalla y como respaldo cuando el servicio de IA no está disponible.

Durante las evaluaciones de los microcursos y las dinámicas del Sandbox, el sistema actualiza el índice de vulnerabilidad del usuario. El ajuste se aplica al vector correspondiente y repercute en el promedio global.

### 8.1. Resultados de las simulaciones

| Acción o resultado | Ajuste aplicado al vector | Interpretación |
|---|---:|---|
| Caer en la trampa o fallar la dinámica | `+20 %` | Penalización por no identificar o gestionar correctamente la amenaza. |
| Ignorar la amenaza, realizar una detección parcial o agotar el tiempo | `-5 %` | Reducción leve del riesgo, con advertencia sobre la importancia de reportar el incidente. |
| Reportar el ataque o superar la dinámica al 100 % | `-20 %` | Refuerzo positivo por identificar y gestionar correctamente la amenaza. |

### 8.2. Resultado de los microcursos

Cuando el usuario obtiene una calificación igual o superior al **60 %** en el examen de un microcurso:

- Se registra el progreso en PostgreSQL.
- Se desbloquean las insignias correspondientes.
- Se habilita el material de refuerzo posterior a la evaluación.
- Se reduce en `10 %` la vulnerabilidad del vector estudiado.

### 8.3. Límites de resiliencia

Para evitar valores fuera de los rangos establecidos, el modelo limita los niveles de vulnerabilidad de cada vector:

- **Mínimo:** 10 % de riesgo residual.
- **Máximo:** 95 % de vulnerabilidad.
- **Índice global:** entre 0 % y 100 %.

Estos límites permiten mantener los resultados dentro de los rangos definidos por las reglas de evaluación del sistema.

---

## 9. Matriz de pruebas de integración

En esta fase se documentan cuatro pruebas de integración realizadas sobre el sistema conectado a PostgreSQL mediante Neon.

| Prueba | Escenario | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| **Prueba 1 – Registro** | Registrar un usuario desde `#/registro` y crear un curso con módulos y Quiz desde `#/gestion`. | El frontend envía una petición POST; el backend valida y almacena los datos en las tablas correspondientes de PostgreSQL, devolviendo `201 Created` cuando la operación se completa correctamente. | Los registros quedaron almacenados en PostgreSQL y permanecieron disponibles al recargar la aplicación o consultarlos desde otro cliente. | **Exitoso / Aprobado** |
| **Prueba 2 – Consulta** | Consultar el catálogo de aprendizaje (`#/aprendizaje`), las misiones (`#/misiones`) y el panel administrativo (`#/gestion`). | El frontend realiza solicitudes GET y recibe información almacenada en Neon para renderizar cursos, recursos, evaluaciones, misiones, usuarios y grupos. | La interfaz presentó dinámicamente la información consultada desde la base de datos. | **Exitoso / Aprobado** |
| **Prueba 3 – Datos inválidos** | Intentar registrar un nombre con números, un correo con formato incorrecto o una contraseña de menos de seis caracteres. También intentar acceder a `#/gestion` con el rol `Estudiante`. | Las validaciones del frontend y backend rechazan los datos incorrectos. El servidor responde con códigos como `400 Bad Request` o `403 Forbidden`, según el caso, sin permitir operaciones no autorizadas. | El sistema bloqueó las operaciones, mostró mensajes de error y protegió la integridad de los registros. | **Exitoso / Aprobado** |
| **Prueba 4 – Error de conexión** | Detener el servidor mediante `node server.js` e intentar iniciar sesión o actualizar información desde el perfil. | El controlador captura el fallo de red mediante `try/catch`, evita que la interfaz colapse, rehabilita el botón y presenta un mensaje comprensible. | La aplicación mostró el mensaje: `Error de conexión. Verifica que el servidor backend esté encendido`, manteniendo la estabilidad de la interfaz. | **Exitoso / Aprobado** |

---

## 10. Diagramas del proyecto

Los siguientes diagramas documentan la estructura y el diseño de NeuroShield. Los archivos se encuentran en el directorio `Diagramas/`.

### 10.1. Diagrama de casos de uso

Representa las interacciones entre los actores del sistema y las funcionalidades disponibles según sus permisos.

![Diagrama de casos de uso](Diagramas/Diagrama%20de%20casos%20de%20uso.jpeg)

### 10.2. Diagrama de clases

Describe las clases principales del sistema y las relaciones establecidas entre ellas.

![Diagrama de clases](Diagramas/Diagrama%20de%20clases.jpeg)

### 10.3. Diagrama de componentes

Representa los componentes principales del software y sus relaciones dentro de la arquitectura.

![Diagrama de componentes](Diagramas/Diagrama%20de%20componentes.jpeg)

### 10.4. Diagrama general

![Diagrama general](Diagramas/Diagrama.jpeg)

### 10.5. Modelo MVC

Representa la separación de responsabilidades entre Modelo, Vista y Controlador en la aplicación.

![Modelo MVC](Diagramas/Modelo%20MVC.jpeg)

### 10.6. Modelo relacional

Presenta las entidades de la base de datos, sus atributos y las relaciones establecidas mediante claves primarias y foráneas.

![Modelo relacional](Diagramas/Modelo%20relacional.jpeg)

---

## 11. Trabajo futuro y escalabilidad

Los atributos `origen` y `prompt_generacion` de Cursos y Misiones identifican la procedencia del contenido (`Sistema`, `Administrador` o `Servicio IA`). En esta versión ya se usan: los cursos publicados a partir de un borrador de IA quedan marcados con `origen = 'Servicio IA'` y conservan en `prompt_generacion` la justificación del análisis que los originó.

Líneas de evolución previstas:

- **Reentrenar la red con datos reales.** El modelo actual se entrenó con datos sintéticos (sección 12.7). Cuando la plataforma acumule historial real suficiente, el mismo procedimiento de entrenamiento puede ejecutarse con esos datos.
- **Generación de texto asistida.** Los borradores de curso se arman hoy con plantillas revisables. Un modelo de lenguaje podría redactar contenido nuevo, manteniendo la aprobación del administrador.
- **Medición de tiempo por pregunta** en los quizzes, para enriquecer la entrada de la red.

---

## 12. Integración del servicio de Inteligencia Artificial

### 12.1. Función de la IA dentro de la solución

El servicio de IA cumple dos funciones ligadas al propósito del proyecto:

1. **Estimar la vulnerabilidad de cada usuario.** Después de cada simulación o examen, una red neuronal analiza el historial reciente del usuario y estima su nivel de vulnerabilidad global (0 a 100, clasificado en bajo, medio o alto) y su riesgo en cada vector de ataque: phishing, smishing, vishing e ingeniería social. La misma red detecta además qué tipo de refuerzo necesita el usuario (refuerzo teórico, entrenar bajo presión, pasar de ignorar a reportar o subir de dificultad) a partir de sus respuestas, sus acciones y su tiempo de decisión. Con ese resultado se generan las recomendaciones y se eligen las misiones y los cursos que debería tomar.
2. **Orientar al administrador en la creación de contenido.** A partir del desempeño de un grupo (o de todos los usuarios), el servicio identifica el vector más débil y el nivel adecuado, y propone un borrador de curso con su examen o un borrador de misión para el simulador. El administrador lo revisa, lo ajusta y decide si lo publica.

### 12.2. Servicio y tecnología utilizados

| Elemento | Tecnología |
|---|---|
| Servicio | Microservicio independiente en **Python** con **FastAPI** y **Uvicorn** (`ia-service/`). |
| Modelo | **Red neuronal convolucional 1D** construida con **TensorFlow / Keras**. |
| Entrada | Matriz de 20 interacciones × 9 características. |
| Salida 1 | 4 valores entre 0 y 1: vulnerabilidad estimada por vector (regresión). |
| Salida 2 | 4 probabilidades: perfil de refuerzo que necesita el usuario (clasificación multietiqueta). |
| Tamaño | 32.328 parámetros; inferencia en CPU en milisegundos. |

**Arquitectura de la red** (`ia-service/app/modelo.py`):

```text
Entrada (20, 9)
  -> Conv1D 32 filtros, ventana 3, ReLU
  -> Conv1D 64 filtros, ventana 5, ReLU
  -> Conv1D 64 filtros, ventana 3, ReLU
  -> GlobalAveragePooling + GlobalMaxPooling (concatenados)
  -> Densa 64, ReLU -> Dropout 0.2
  -> Salida 1: Densa 4, sigmoide   (vulnerabilidad: Phishing, Smishing, Vishing, Ing. Social)
  -> Salida 2: Densa 4, sigmoide   (refuerzo: teoría, presión, reportar, avanzar)
```

Las dos salidas comparten las capas convolucionales. Se entrenan juntas con pérdida MSE para la vulnerabilidad y entropía cruzada binaria para el perfil de refuerzo (peso 0,5). Un usuario puede necesitar varios refuerzos a la vez.

| Perfil de refuerzo (salida 2) | Qué detecta la red | Qué hace la aplicación |
|---|---|---|
| Refuerzo teórico | Falla mucho en al menos un vector | Recomienda el curso del vector y una misión Básico en la dinámica Cazador de Red Flags |
| Entrenar bajo presión | Decide de forma impulsiva, con poco tiempo | Recomienda la misión con menor tiempo límite en Reacción Táctica |
| Pasar de ignorar a reportar | Casi nunca reporta las amenazas | Recomienda practicar en la dinámica Escudo de Respuesta |
| Subir de dificultad | Ya domina los escenarios básicos | Recomienda una misión Avanzado en el Inspector de URLs |

Se eligió una red convolucional porque el historial del usuario es una **secuencia ordenada**: los filtros recorren ventanas de 3 y 5 interacciones consecutivas y detectan patrones locales, como varios fallos seguidos en un mismo vector o respuestas muy rápidas que terminan en caída. El puntaje global es el promedio de los cuatro vectores y el nivel se obtiene con los mismos umbrales del perfil (menos de 40 bajo, 40 a 59 medio, 60 o más alto).

### 12.3. Componente que realiza la integración

El **backend (Express)** es el único componente que consume el servicio de IA. El frontend nunca lo llama directamente.

| Archivo | Responsabilidad |
|---|---|
| `backend/services/iaClient.js` | Cliente HTTP del servicio (URL configurable, tiempo de espera y manejo de fallos). |
| `backend/services/analisisIA.js` | Arma el historial desde PostgreSQL, invoca al cliente, guarda el análisis y calcula los cursos recomendados. |
| `backend/server.js` | Invoca el análisis en `/api/misiones/:id/evaluar` y `/api/cursos/:id/progreso`, y expone los endpoints de IA. |

```text
Frontend (SPA)                Backend (Express)                 Servicio de IA (FastAPI)
     |  POST /api/misiones/:id/evaluar  |                                  |
     |--------------------------------->|  1. Guarda la simulación         |
     |                                  |  2. Lee las últimas 20           |
     |                                  |     interacciones (PostgreSQL)   |
     |                                  |  POST /predict                   |
     |                                  |--------------------------------->|  3. Matriz 20x9
     |                                  |                                  |  4. Red convolucional
     |                                  |  { puntaje, nivel, riesgo, ... } |  5. Recomendaciones
     |                                  |<---------------------------------|
     |                                  |  6. Guarda en Analisis_IA y      |
     |   { mensaje, ia: {...} }         |     actualiza Usuarios           |
     |<---------------------------------|                                  |
  7. Muestra nivel, riesgo por vector,
     recomendaciones y cursos sugeridos
```

### 12.4. Comunicación con el servicio

La comunicación es **HTTP con JSON** (REST). El servicio expone tres rutas:

| Método | Ruta | Uso |
|---|---|---|
| `GET` | `/health` | Estado del servicio, versión y métricas del modelo. |
| `POST` | `/predict` | Historial de un usuario → análisis de vulnerabilidad. |
| `POST` | `/sugerir-curso` | Historiales de un grupo → análisis grupal y borrador de curso. |
| `POST` | `/sugerir-mision` | Historiales de un grupo y títulos de las misiones existentes → análisis grupal y borrador de misión. |

**Información que recibe** (`POST /predict`): el historial del usuario en orden cronológico. Cada interacción incluye:

| Campo | Valores |
|---|---|
| `tipo` | `simulacion` o `quiz` |
| `vector` | `Phishing`, `Smishing`, `Vishing`, `Ing. Social` |
| `dificultad` | `Básico`, `Intermedio`, `Avanzado` |
| `resultado` | Simulación: `caer`, `ignorar`, `tiempo`, `reportar`. Quiz: `correcta`, `incorrecta` |
| `tiempo_respuesta`, `tiempo_limite` | Segundos (solo simulaciones) |

Ejemplo de solicitud:

```json
{
  "id_usuario": 7,
  "interacciones": [
    {"tipo": "simulacion", "vector": "Phishing", "dificultad": "Básico", "resultado": "reportar", "tiempo_respuesta": 50, "tiempo_limite": 150},
    {"tipo": "simulacion", "vector": "Vishing", "dificultad": "Intermedio", "resultado": "caer", "tiempo_respuesta": 12, "tiempo_limite": 140},
    {"tipo": "quiz", "vector": "Phishing", "dificultad": "Básico", "resultado": "correcta"},
    {"tipo": "simulacion", "vector": "Vishing", "dificultad": "Intermedio", "resultado": "caer", "tiempo_respuesta": 20, "tiempo_limite": 140},
    {"tipo": "simulacion", "vector": "Smishing", "dificultad": "Básico", "resultado": "ignorar", "tiempo_respuesta": 60, "tiempo_limite": 120},
    {"tipo": "quiz", "vector": "Vishing", "dificultad": "Básico", "resultado": "incorrecta"}
  ]
}
```

**Respuesta que genera** (salida real del modelo incluido para esa solicitud, recortada):

```json
{
  "puntaje": 51,
  "nivel": "Medio",
  "riesgo_por_vector": {"Phishing": 34, "Smishing": 42, "Vishing": 69, "Ing. Social": 59},
  "perfil_refuerzo": {"teoria": 0.847, "presion": 0.7, "reportar": 0.383, "avanzar": 0.006},
  "refuerzos": [
    {"tipo": "teoria", "probabilidad": 0.847, "confianza": "alta"},
    {"tipo": "presion", "probabilidad": 0.7, "confianza": "alta"},
    {"tipo": "reportar", "probabilidad": 0.383, "confianza": "media"}
  ],
  "vectores_prioritarios": ["Vishing", "Smishing"],
  "vectores_sin_practica": ["Ing. Social"],
  "interacciones_analizadas": 6,
  "modelo": "cnn1d-v2",
  "recomendaciones": [
    {"icono": "fa-shield-halved", "color": "text-warning", "texto": "Vulnerabilidad moderada (51%). Refuerza vishing (llamadas), donde tu riesgo estimado es 69%."},
    {"icono": "fa-stopwatch", "color": "text-warning", "titulo": "Entrenar bajo presión", "origen": "red_neuronal", "confianza": "alta",
     "texto": "Tus decisiones muestran un patrón de respuestas apresuradas. Antes de actuar, revisa el remitente y el destino del enlace; practica una misión de vishing (llamadas) con tiempo límite."}
  ]
}
```

Con dos caídas rápidas en vishing, la red detecta tanto el vector débil (69 %) como el patrón de respuestas apresuradas. Cada refuerzo se activa cuando su probabilidad supera un umbral ajustado durante el entrenamiento; la confianza es "alta" cuando la supera por 0,25 o más. Al responder al navegador, el backend agrega `misiones_recomendadas` (con la dinámica sugerida) y `cursos_recomendados`.

### 12.5. Cómo utiliza la aplicación el resultado

| Dónde | Uso del resultado |
|---|---|
| Base de datos | Cada análisis se guarda en `Analisis_IA` y el puntaje reemplaza a `Usuarios.nivel_vulnerabilidad`. Si el servicio de IA no responde, el backend calcula el riesgo con el mismo historial (respaldo por reglas, ver 12.5.2) y lo guarda con `modelo = 'reglas-v1'`. |
| Resultados de la simulación (`#/resultados`) | Tarjeta "Análisis del Servicio de IA" con el nivel, el plan de refuerzo detectado por la red, el riesgo por vector, las recomendaciones (las que decidió la red llevan la insignia "Red neuronal · confianza"), las misiones recomendadas con su dinámica y los cursos sugeridos. El registro de telemetría incluye la línea `[SERVICIO DE IA]`. |
| Examen de un curso (`#/aprendizaje`) | Tras calificar, muestra el nivel estimado y la recomendación principal. |
| Perfil (`#/perfil`) | La gráfica por vector, el estado de seguridad y las recomendaciones provienen del último análisis guardado, junto con el plan de refuerzo, las misiones y los cursos sugeridos. Debajo de la gráfica se indica la fuente del dato (red neuronal, cálculo por reglas o diagnóstico inicial). Un vector sin práctica aparece como "sin datos" y un usuario sin actividad ve un estado vacío en lugar de valores de ejemplo. Un botón de misión abre el simulador directamente en la dinámica recomendada. |
| Gestión (`#/gestion`) | Botones **Generar curso con IA** (pestaña de cursos) y **Generar misión con IA** (pestaña de simuladores): abren un asistente con preguntas cortas (ver 12.5.3) y luego el editor por pasos precargado con el borrador para que el administrador lo apruebe. La tabla de usuarios muestra la vulnerabilidad estimada por la red. |

### 12.5.1. Borradores de misión para el simulador

El botón **Generar misión con IA** usa el mismo análisis grupal que la sugerencia de cursos, con tres decisiones:

| Decisión | Cómo se toma |
|---|---|
| Vector de ataque | El de mayor riesgo promedio estimado por la red en el grupo. |
| Dificultad | Riesgo de 60 o más → Básico (escenario evidente); de 40 a 59 → Intermedio; menos de 40 → Avanzado (escenario sofisticado). |
| Tiempo límite | Si al menos la mitad de las caídas registradas del grupo ocurrieron respondiendo en menos del 30 % del tiempo disponible, se reduce en 30 segundos (mínimo 60) para entrenar bajo presión. |

El escenario sale de `ia-service/app/plantillas_misiones.py`, con 12 escenarios (uno por vector y dificultad) escritos con el mismo formato que las cuatro misiones de prueba: remitente falso, asunto, mensaje, acción trampa, destino malicioso y tres pistas forenses. El backend envía los títulos de las misiones activas y el servicio no repite un escenario ya publicado: si el del nivel recomendado existe, propone el del nivel más cercano y lo explica en el borrador. La justificación del análisis queda guardada en `Misiones.prompt_generacion` y la misión publicada con `origen = 'Servicio IA'`. Las misiones sugeridas funcionan en las cinco dinámicas del simulador.

### 12.5.2. Respaldo cuando el servicio de IA no está disponible

Si el servicio de IA no responde, el backend no deja el perfil con valores fijos: calcula el riesgo por vector con el historial real del usuario (`backend/services/analisisIA.js`, función `estimacionPorReglas`).

- Peso de cada interacción: caer o responder mal = 1; ignorar o agotar el tiempo = 0,5; reportar o responder bien = 0.
- Riesgo del vector = (suma de pesos + 0,5) / (interacciones + 1) × 100. El suavizado evita que un único intento dé 0 % o 100 %.
- Un vector sin práctica queda en `null` ("sin datos") y no entra en el promedio.
- El resultado se guarda en `Analisis_IA` con `modelo = 'reglas-v1'` y la respuesta lleva `fuente: 'reglas'`. El perfil, la tarjeta de resultados, la terminal del simulador ("[MOTOR DE REGLAS]") y el libro de calificaciones ("por reglas") lo indican.

Cuando el servicio vuelve a estar disponible, el siguiente análisis lo hace de nuevo la red neuronal.

### 12.5.3. Asistente del administrador antes de generar

Antes de generar un curso o una misión, el administrador responde unas preguntas. Cada una llega preseleccionada con la recomendación de la red para el grupo elegido, así que basta con pulsar **Generar borrador** si está de acuerdo.

| Pregunta | Curso | Misión | Qué recomienda la IA |
|---|---|---|---|
| Grupo | Sí | Sí | — (al cambiarlo se vuelve a analizar) |
| Vector a reforzar | Sí | Sí | El de mayor riesgo promedio; cada opción muestra su riesgo |
| Nivel o dificultad | Sí | Sí | Automático según el riesgo del vector elegido |
| Preguntas del examen (3 a 6) | Sí | — | 4 |
| Módulo de refuerzo posterior al examen | Sí | — | Incluirlo |
| Presión de tiempo (automática, normal, alta) | — | Sí | Automática: reduce 30 s si el grupo cae por responder con prisa |

Las respuestas viajan en `POST /api/admin/ia/sugerir-curso` (`nivel`, `num_preguntas`, `incluir_refuerzo`) y `POST /api/admin/ia/sugerir-mision` (`dificultad`, `presion`); el backend descarta valores no válidos y el servicio los valida otra vez (FastAPI responde `422` fuera de rango). Si el administrador elige algo distinto a lo recomendado, el recuadro "¿Por qué la IA propone...?" del editor y el campo `prompt_generacion` lo registran ("Elegiste el nivel Intermedio; la IA recomendaba Básico"). El asistente está en `js/components/asistenteIA.js`.

### 12.6. Requisitos para ejecutar la funcionalidad

- Python 3.10 a 3.13 y las dependencias de `ia-service/requirements.txt` (TensorFlow, FastAPI, Uvicorn, NumPy).
- El servicio de IA en ejecución (sección 7.4) antes de usar la aplicación.
- La variable `IA_SERVICE_URL` en `backend/.env` si el servicio no corre en `http://localhost:8000`.
- Node.js 18 o superior en el backend (usa `fetch` nativo; no se añadieron dependencias de npm).

### 12.7. Datos de entrenamiento y desempeño del modelo

La plataforma aún no cuenta con suficientes usuarios reales para entrenar un modelo, por lo que la red se entrenó con **datos sintéticos** generados por `ia-service/entrenamiento/generar_dataset.py`. El generador simula 50.000 perfiles de usuario (40.000 de entrenamiento, 5.000 de validación y 5.000 de prueba). Cada perfil tiene rasgos ocultos: vulnerabilidad por vector, impulsividad (qué tan rápido decide) y proactividad (qué tanto reporta). A partir de ellos se simula su historial con estos supuestos:

- A mayor vulnerabilidad en un vector, mayor probabilidad de caer o fallar.
- Los escenarios más difíciles y las respuestas con mucha prisa aumentan la probabilidad de fallo; los usuarios impulsivos responden más rápido.
- Quien no cae reporta o solo ignora según su proactividad.
- Cada práctica reduce un poco la vulnerabilidad, por lo que las interacciones recientes pesan más.

El perfil de refuerzo verdadero se define a partir de esos rasgos: refuerzo teórico si la vulnerabilidad de algún vector es 0,60 o más, entrenar bajo presión si la impulsividad es 0,60 o más, reportar si la proactividad es menor de 0,45 y subir de dificultad si la vulnerabilidad de todos los vectores es menor de 0,35. La red aprende a recuperar esos rasgos observando solo el historial.

Resultados sobre los 5.000 perfiles de prueba (`ia-service/modelos/metricas.json`), comparados con reglas simples de referencia:

| Métrica de la salida 1 (vulnerabilidad) | Red convolucional | Regla de referencia (tasa de fallos) |
|---|---|---|
| Error medio por vector (puntos sobre 100) | 16,5 | 22,6 |
| Error medio del puntaje global (puntos sobre 100) | 10,2 | 12,1 |
| Exactitud del nivel (bajo / medio / alto) | 64,8 % | 62,5 % |

Los errores graves (clasificar como bajo a un usuario de nivel alto, o al revés) ocurren en el 1,2 % de los casos.

| Salida 2: F1 por perfil (0 a 1) | Red convolucional | Regla de referencia |
|---|---|---|
| Refuerzo teórico | 0,850 | 0,837 (peor tasa de fallos) |
| Entrenar bajo presión | 0,675 | 0,680 (tiempo medio de respuesta) |
| Pasar de ignorar a reportar | 0,644 | 0,636 (proporción de veces que solo ignoró) |
| Subir de dificultad | 0,509 | 0,485 (dominio del peor vector) |

Para que la comparación sea justa, el umbral de decisión de cada perfil se ajustó con los datos de validación con el mismo método para la red y para las reglas. La red supera ligeramente a las reglas en teoría, reportar y subir de dificultad, y queda prácticamente empatada en entrenar bajo presión (0,675 frente a 0,680), todo con un solo modelo y sin reglas escritas a mano para cada caso. La ventaja es pequeña porque en estos datos simulados una estadística simple ya captura buena parte de la señal. Si la red aporta más con datos reales es algo que debe comprobarse cuando la plataforma tenga historial suficiente.

**Limitaciones.** Estas métricas describen el desempeño frente al simulador, no frente a personas reales: el modelo es tan válido como los supuestos anteriores. El perfil de refuerzo tiene una precisión moderada (cerca de la mitad de las veces que activa "entrenar bajo presión" o "reportar" el usuario no lo necesitaba en realidad), por eso se presenta como sugerencia con su nivel de confianza. Con pocas interacciones la estimación es poco precisa, y en los vectores que el usuario no ha practicado la red solo puede suponer un valor (la aplicación lo indica como "sin práctica aún"). El resultado tiene fines formativos y no debe usarse para evaluar o sancionar a una persona.

Para reentrenar el modelo:

```bash
cd ia-service
python -m entrenamiento.entrenar
```

### 12.8. Evidencia de funcionamiento

**Pruebas automáticas del servicio** (15 pruebas: matriz de entrada, estado, usuario vulnerable frente a usuario seguro, detección del vector débil, perfil de refuerzo para usuarios impulsivos, pasivos y expertos, validaciones, borrador de curso y borrador de misión):

```bash
cd ia-service
python -m pytest -q
```

```text
........                                                                 [100%]
15 passed
```

**Pruebas de integración realizadas** (aplicación → backend → servicio de IA → base de datos → interfaz):

| ID | Prueba | Resultado esperado | Estado |
|---|---|---|---|
| IA-01 | `GET /api/ia/estado` con el servicio encendido | `disponible: true`, modelo `cnn1d-v2` y métricas | Aprobada |
| IA-02 | Usuario cae en 6 simulaciones seguidas | La respuesta de `/evaluar` incluye `ia.nivel = "Alto"` y se guarda en `Analisis_IA` | Aprobada |
| IA-03 | Usuario reporta 6 simulaciones y aprueba un examen | `ia.nivel = "Bajo"` | Aprobada |
| IA-04 | Examen de curso con respuestas por pregunta | Las respuestas se guardan en `Respuestas_Quiz` y entran al análisis | Aprobada |
| IA-05 | Inicio de sesión posterior | `riesgoActual` corresponde al puntaje estimado por la red | Aprobada |
| IA-06 | `GET /api/usuarios/:id/analisis-ia` sin token o de otro usuario | `401` y `403` | Aprobada |
| IA-07 | Administrador solicita sugerencia de curso | Borrador con 2 módulos y 4 preguntas del vector más débil; al publicarlo queda con origen `Servicio IA` | Aprobada |
| IA-08 | Sugerencia de curso con rol Estudiante | `403` | Aprobada |
| IA-09 | Servicio de IA apagado | La simulación se guarda y el backend calcula el riesgo con el historial (`fuente: 'reglas'`, `modelo = 'reglas-v1'`); el perfil muestra esos valores y su fuente | Aprobada |
| IA-10 | Interfaz: resultados, perfil, examen y gestión | Se muestran la tarjeta de IA, las recomendaciones y el borrador precargado | Aprobada |
| IA-11 | Administrador solicita sugerencia de misión para un grupo que cae respondiendo con prisa | Misión del vector más débil, dificultad según el riesgo y tiempo límite reducido; al publicarla queda con origen `Servicio IA` | Aprobada |
| IA-12 | Segunda sugerencia de misión para el mismo grupo | No repite el escenario ya publicado; propone el del nivel más cercano | Aprobada |
| IA-13 | Misión sugerida abierta en el simulador | Funciona en las cinco dinámicas | Aprobada |
| IA-14 | Usuario que cae rápido en todas las misiones | Refuerzos: entrenar bajo presión y refuerzo teórico; misión con menor tiempo en Reacción Táctica | Aprobada |
| IA-15 | Usuario que no cae pero solo ignora | Refuerzo: pasar de ignorar a reportar; misión en Escudo de Respuesta | Aprobada |
| IA-16 | Usuario que reporta todo | Refuerzo: subir de dificultad; misión Avanzado | Aprobada |
| IA-17 | Botón de misión recomendada | Abre el simulador en esa misión y en la dinámica sugerida | Aprobada |
| IA-18 | Usuario nuevo sin actividad abre su perfil | Estado vacío "Sin datos aún", sin valores de ejemplo | Aprobada |
| IA-19 | Asistente de curso: vector Smishing, nivel Intermedio, 5 preguntas | Borrador de Smishing, nivel Intermedio, 5 preguntas; el recuadro indica lo que eligió el administrador | Aprobada |
| IA-20 | Asistente de misión con presión alta | Tiempo límite 30 s menor al de la plantilla | Aprobada |
| IA-21 | Asistente con el servicio de IA apagado | Mensaje "El servicio de IA no está disponible" y botón Generar deshabilitado | Aprobada |
| IA-22 | `num_preguntas = 10` directo al servicio | `422` | Aprobada |

**Capturas de la versión final:** agregar en la carpeta `Evidencias/` las capturas de la tarjeta de IA en resultados, el perfil, el borrador sugerido en gestión, `http://localhost:8000/docs` y la consola del backend con el mensaje de conexión.

### 12.9. Consideraciones de configuración

| Variable (`backend/.env`) | Valor por defecto | Descripción |
|---|---|---|
| `IA_SERVICE_URL` | `http://localhost:8000` | Dirección del servicio de IA. |
| `IA_TIMEOUT_MS` | `5000` | Tiempo máximo de espera de una respuesta. |
| `DATABASE_SSL` | `true` | Usar `false` solo con un PostgreSQL local sin SSL. |

- **Tolerancia a fallos:** si el servicio de IA no responde, la aplicación sigue funcionando. El backend calcula el riesgo con el historial real del usuario (sección 12.5.2) y la interfaz indica que el dato no proviene de la red neuronal.
- **Versión del modelo:** si al iniciar el servicio el archivo `.keras` no carga por una diferencia de versión de TensorFlow, basta con reentrenar (`python -m entrenamiento.entrenar`, entre uno y dos minutos).
- **Sustitución de la tecnología:** el contrato JSON de `/predict` aísla al resto del sistema; el modelo puede cambiarse sin modificar el frontend ni la base de datos.

---

## 13. Gestión de pruebas en Qase

Los casos de prueba de la versión final se registraron y ejecutaron en **[Qase](https://qase.io)**, una herramienta de gestión de pruebas.

**Reporte público de la ejecución:** https://app.qase.io/public/report/a924a632d82adf02fee02462b88000544d82504e

| Suite | Casos | Resultado |
|---|---|---|
| Integración Frontend - Backend - Base de datos (sección 9) | 4 | 4 aprobados |
| Servicio de IA - Integración en la aplicación (IA-01 a IA-22, sección 12.8) | 22 | 22 aprobados |
| Servicio de IA - Pruebas automáticas (`ia-service/tests/test_api.py`, pytest) | 18 | 18 aprobados |
| **Total** | **44** | **44 aprobados (100 %)** |

- **Proyecto en Qase:** NeuroShield (código `NS`), ejecución *"NeuroShield - Versión final con servicio de IA (2026-11-19)"*.
- **Entorno de ejecución:** frontend en `:5500`, backend en `:3000` con PostgreSQL y servicio de IA en `:8000`, con el servicio de IA encendido y apagado.
- **Casos importables:** `pruebas/qase/neuroshield_casos_qase.json` contiene los 44 casos con sus pasos y resultados esperados. Se importan en Qase desde *Repository → Import* con el tipo de origen *Qase.io*.
- **Evidencia:** `Evidencias/qase_ejecucion_pruebas.jpg` (tablero de la ejecución al 100 %).
- **Pruebas automáticas:** se ejecutan con `cd ia-service && python -m pytest tests -q` (resultado: `18 passed`).

---

## Estado de la versión final

La versión final integra el frontend, el backend, la base de datos PostgreSQL y el servicio de Inteligencia Artificial en una sola solución. La aplicación incorpora autenticación, control de acceso por roles, gestión de microcursos, simulaciones multicanal, administración de contenidos, persistencia de resultados y estimación de vulnerabilidad mediante una red neuronal convolucional consumida como servicio.

---

**NeuroShield – Arquitectura de Software**  
**Universidad Manuela Beltrán**  
**Autores:** Diego Nicolas Cuervo Ochoa y Karen Tatiana Chaves Bonilla