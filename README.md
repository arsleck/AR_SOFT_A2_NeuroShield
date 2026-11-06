# NeuroShield
## Fase 4: Integración de Frontend, Backend y Base de Datos

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

---

## 1. Descripción del avance (Fase 4)

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

### 3.5. Centro de administración CRUD (`#/gestion`)

El panel administrativo dispone de cuatro áreas de gestión:

- **Cursos:** creación, edición y eliminación de cursos, módulos y preguntas de evaluación.
- **Simuladores y ataques:** administración de escenarios, remitentes y pistas forenses.
- **Usuarios:** consulta de usuarios, modificación de roles y asignación de grupos.
- **Grupos de entrenamiento:** creación y administración de grupos.

El modelo contempla los atributos `origen` y `prompt_generacion` para mantener trazabilidad de contenidos que puedan ser generados por el sistema, un administrador o un futuro módulo de inteligencia artificial.

---

## 4. Estructura del repositorio

La organización principal del proyecto es la siguiente:

```text
AR_SOFT_A2_NeuroShield/
├── .vscode/
│   └── settings.json
├── backend/
│   ├── uploads/
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── css/
│   └── styles.css
├── database/
│   └── neuroshield_db.sql
├── Diagramas/
│   ├── Diagrama de casos de uso.jpeg
│   ├── Diagrama de clases.jpeg
│   ├── Diagrama de componentes.jpeg
│   ├── Diagrama.jpeg
│   ├── Modelo MVC.jpeg
│   └── Modelo relacional.jpeg
├── js/
│   ├── components/
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
| `js/components/` | Componentes reutilizables (`sidebar.js`, `topbar.js` y modales en `tutorial.js`). |
| `js/controllers/app.js` | Enrutador SPA, eventos, validaciones Regex y solicitudes Fetch al backend. |
| `js/models/data.js` | Estado del usuario, cálculos de vulnerabilidad y sincronización con la API. |
| `js/pages/` | Módulos de las 9 vistas de la aplicación (`login`, `registro`, `dashboard`, `perfil`, `aprendizaje`, `misiones`, `simulador`, `resultados`, `gestion`). |
| `js/views/ui.js` | Renderizado del DOM, terminal forense y gráficas con Chart.js. |
| `backend/` | Servidor Express (`server.js`), configuración de paquetes (`package.json`) y carpeta multimedia (`uploads/`). |
| `database/neuroshield_db.sql` | Script SQL para crear y poblar las 8 tablas relacionales en PostgreSQL (Neon). |
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
| `POST` | `/api/cursos/:id/progreso` | Registra la calificación y actualiza el progreso del usuario. | `INSERT` / `UPSERT` |
| `GET` | `/api/misiones` | Consulta escenarios activos para los simuladores. | `SELECT` |
| `POST` | `/api/misiones` | Crea un escenario de simulación. | `INSERT` |
| `PUT` | `/api/misiones/:id` | Modifica los parámetros, remitente y pistas forenses de una misión. | `UPDATE` |
| `DELETE` | `/api/misiones/:id` | Desactiva un escenario de simulación. | `UPDATE` lógico |
| `POST` | `/api/misiones/:id/evaluar` | Guarda la telemetría de la simulación y actualiza el nivel de riesgo. | Registro y actualización |
| `GET` | `/api/admin/usuarios` | Consulta usuarios para la administración. | `SELECT` |
| `PUT` | `/api/admin/usuarios/:id` | Actualiza roles (`Estudiante`/`Administrador`) y asignación de grupo. | `UPDATE` |
| `GET` | `/api/admin/grupos` | Consulta los grupos de capacitación. | `SELECT` |
| `POST` | `/api/admin/grupos` | Crea un grupo de capacitación. | `INSERT` |
| `DELETE` | `/api/admin/grupos/:id` | Elimina o desactiva un grupo según la lógica implementada. | Operación de eliminación |

> **Nota:** las rutas se presentan como resumen funcional de la API descrita para esta fase. Para conocer el comportamiento exacto de cada endpoint, sus parámetros y validaciones, se debe consultar su implementación en `backend/server.js`.

---

## 7. Instrucciones de configuración y ejecución

### 7.1. Prerrequisitos

Antes de ejecutar el proyecto, se requiere:

- **Node.js 18 o superior.**
- **npm**, incluido con Node.js.
- Una instancia de **PostgreSQL**, configurada en Neon o en un entorno local.
- Un navegador web moderno.
- Visual Studio Code (opcional).
- La extensión **Live Server** para ejecutar el frontend localmente (opcional).

### 7.2. Paso 1: Configurar la base de datos

1. Ingresa a la consola SQL de tu instancia de Neon o al entorno PostgreSQL que utilizarás.
2. Abre el archivo `database/neuroshield_db.sql`.
3. Ejecuta el contenido del script para crear las ocho tablas relacionales y cargar los datos iniciales definidos para cursos y misiones.
4. Verifica que las tablas se hayan creado correctamente.

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

### 7.4. Paso 3: Ejecutar el frontend

Con el backend en funcionamiento:

1. Abre la carpeta raíz del proyecto en Visual Studio Code.
2. Localiza el archivo `index.html`.
3. Haz clic derecho y selecciona **Open with Live Server**.
4. Abre la dirección local que proporcione Live Server. Por ejemplo:

```text
http://127.0.0.1:5500/index.html#/login
```

El frontend podrá comunicarse con el backend siempre que la URL de la API y la configuración CORS coincidan con el entorno local.

### 7.5. Orden recomendado de ejecución

1. Iniciar o verificar la base de datos PostgreSQL.
2. Ejecutar el backend con `node server.js`.
3. Abrir el frontend mediante Live Server.
4. Ingresar a la aplicación y probar el registro o inicio de sesión.

---

## 8. Reglas de negocio y evaluación adaptativa

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

La estructura de la base de datos y los servicios REST contemplan los atributos `origen` y `prompt_generacion` en las entidades relacionadas con Cursos y Misiones. Estos campos permiten identificar la procedencia del contenido, por ejemplo:

- `Sistema`
- `Administrador`
- `Red Neuronal IA`

Esta estructura deja preparada la trazabilidad para una futura integración de un módulo de Inteligencia Artificial y Procesamiento de Lenguaje Natural (NLP).

Como línea de evolución, se contempla incorporar modelos de aprendizaje automático o arquitecturas Transformer, como DistilBERT, y eventualmente servicios de generación asistida. El objetivo sería clasificar automáticamente los vectores de ataque y proponer nuevos escenarios de entrenamiento de acuerdo con las debilidades identificadas en los resultados estadísticos de los usuarios o grupos.

Esta integración corresponde a una **proyección de trabajo futuro** y no debe interpretarse como una funcionalidad ya implementada en esta fase.

---

## Estado de la fase

La Fase 4 integra el frontend, el backend y la base de datos PostgreSQL en una solución Full-Stack. La aplicación incorpora autenticación, control de acceso por roles, gestión de microcursos, simulaciones multicanal, administración de contenidos y persistencia de resultados.

Las pruebas documentadas permiten verificar los principales flujos de registro, consulta, validación de datos y manejo de errores de conexión.

---

**NeuroShield – Arquitectura de Software**  
**Universidad Manuela Beltrán**  
**Autores:** Diego Nicolas Cuervo Ochoa y Karen Tatiana Chaves Bonilla