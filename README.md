# CiberSim — Simulador inteligente de escenarios de ciberataques para la capacitación en ciberseguridad

Proyecto de **Arquitectura de Software** · Ingeniería de Software · Universidad Manuela Beltrán
Autores: Diego Nicolás Cuervo Ochoa y Karen Tatiana Chaves Bonilla · Docente: Ing. Jamilton Fernando Benavides

## Estado actual del proyecto (Fase 2)

El proyecto se encuentra en la etapa de **prototipo estructurado**. Se implementó la interfaz gráfica completa (Frontend) con navegación tipo SPA (Single Page Application) por hash, una capa de lógica de negocio (Modelo/Controlador), simulación de un motor de IA mediante reglas heurísticas, y un panel de **Trazas MVC** que expone en vivo qué capa atiende cada acción del usuario.

El código ya está organizado en las 5 capas de la arquitectura definida en la Fase 1 (interfaz, lógica de negocio, motor de IA, acceso a datos y base de datos), como carpetas separadas dentro de un mismo proyecto front-end, preparando el terreno para separar Frontend y Backend en las fases siguientes sin tener que rehacer vistas ni controladores.

**Para probar el prototipo actual:** abre `index.html` en cualquier navegador (no requiere instalación ni servidor; necesita conexión a internet solo para cargar la tipografía y los iconos de Icons8).

## Contexto del proyecto

El crecimiento del uso de servicios digitales ha expuesto a los usuarios a distintas modalidades de ciberataques que explotan el comportamiento humano (phishing, vishing, ingeniería social, suplantación de identidad) más que vulnerabilidades técnicas. En Colombia, la capacitación puramente teórica resulta insuficiente porque las personas no cuentan con espacios prácticos y seguros para aprender a identificar estas amenazas en su día a día.

**Pregunta problema:** ¿cómo diseñar una solución de software basada en escenarios simulados e interactivos que contribuya a la capacitación de personas sin conocimientos especializados en ciberseguridad, para la identificación de amenazas digitales y la toma de decisiones frente a estas, en el contexto colombiano?

CiberSim responde a esta pregunta generando amenazas ficticias y controladas, registrando las decisiones del usuario, evaluándolas automáticamente con un Motor de IA y ofreciendo retroalimentación y seguimiento de su progreso.

### Avance realizado

- Nueve pantallas navegables: acceso (inicio de sesión y registro), panel del usuario, catálogo de escenarios, simulación, resultado, historial, capacitación, panel de administración (resumen, escenarios y usuarios) y arquitectura.
- Simulación de cuatro tipos de ataque: correo (phishing), SMS (smishing), mensajería (ingeniería social) y llamada (vishing), más un correo legítimo de control para evaluar falsos positivos.
- Formularios con validación (acceso, registro, creación de escenarios), filtros, buscador y menús de navegación.
- Motor de IA **simulado con reglas** (`js/services/aiEngine.js`) que calcula un índice de vulnerabilidad (0 a 100) ponderando el historial reciente, penaliza decisiones impulsivas, calcula riesgo por categoría y tendencia, y redacta retroalimentación textual.
- Panel **Trazas MVC** (botón en la barra superior) que muestra en vivo el recorrido Vista → Controlador → Modelo → Motor de IA → Datos de cada acción.
- Datos de prueba en memoria: dos roles (usuario y administrador), seis escenarios, cinco módulos de capacitación e historial de simulaciones de ejemplo. Todas las entidades (Banco Andino, Servi-Envíos, etc.) son ficticias.

## 1. Objetivos del proyecto

### Objetivo central

Diseñar una solución de software basada en escenarios simulados e interactivos que contribuya a la capacitación de personas sin conocimientos especializados en ciberseguridad, para la identificación de amenazas digitales y la toma de decisiones frente a estas, en el contexto colombiano.

### Objetivos específicos

1. Identificar los principales tipos de ciberataques (phishing, vishing, ingeniería social, suplantación de identidad) que afectan a los usuarios habituales en Colombia, a fin de determinar los escenarios en los que debe basarse el simulador.
2. Diseñar escenarios de simulación de ciberataques que permitan al usuario evaluar diversos escenarios de riesgo y actuar en consecuencia.
3. Diseñar un algoritmo basado en inteligencia artificial para analizar los datos generados por el simulador, estimar el nivel de vulnerabilidad y determinar los puntos débiles del usuario según sus resultados y acciones durante la simulación.
4. Diseñar y desarrollar la recopilación de datos para la visualización en el tablero de control, con el fin de facilitar el seguimiento del progreso del usuario.

## 2. Selección de la arquitectura

**Arquitectura seleccionada:** arquitectura en **cinco capas**, con separación estricta de responsabilidades:

```
CAPA DE PRESENTACIÓN (INTERFAZ)
Escenarios de simulación · Decisiones
        ↓
CAPA DE LÓGICA DE NEGOCIO
Generación de escenarios · Evaluación
        ↓
CAPA DE MOTOR DE IA
Cálculo de vulnerabilidad · Feedback
        ↓
CAPA DE ACCESO A DATOS
Abstracción de persistencia
        ↓
CAPA DE BASE DE DATOS
Escenarios · Usuarios · Interacciones
```

**Justificación:** este diseño permite aplicar la separación de responsabilidades dividiendo el sistema en cinco componentes principales, y sirve como base práctica para comprender la comunicación entre capas antes de abordar implementaciones más complejas como el patrón MVC o microservicios.

Dentro del prototipo, la capa de Presentación y la de Lógica de negocio se implementan siguiendo el patrón **MVC**:

- **Vista:** solo renderiza datos, sin lógica de negocio (`js/views/views.js`, `css/styles.css`).
- **Controlador:** procesa las acciones del usuario, coordina el temporizador, la navegación y el envío de decisiones (`js/controllers/controllers.js`).
- **Modelo:** gestiona las entidades del dominio (`Usuario`, `Escenario`, `Simulacion`, `Decision`, `Resultado`) y concentra el acceso a datos a través de un repositorio único, `Repo` (`js/models/models.js`).
- **Motor de IA (`ModeloIA`):** capa de servicio independiente que analiza el desempeño y calcula la vulnerabilidad (`js/services/aiEngine.js`).
- **Base de datos:** en esta fase, datos simulados en memoria; en fases posteriores será reemplazada por una base de datos relacional sin alterar Vista ni Controlador (`js/data/testData.js`).

Esta separación permitirá en el futuro exponer la Lógica de negocio, el Motor de IA y el Acceso a datos como una API REST (modelo Cliente-Servidor) sin sobrecargar el dispositivo del usuario, y facilita una eventual migración hacia microservicios.

## 3. Modelado UML

*(Diagramas incluidos en el documento de sustentación; en esta sección se referencian las mismas imágenes para el repositorio.)*

### 3.1 Diagrama de casos de uso

Actores: **Usuario** y **Administrador**.

- Usuario: Iniciar sesión, Registrarse, Seleccionar escenario, Realizar simulación, Tomar decisión, Consultar dashboard, Consultar historial, Consultar retroalimentación, Consultar recomendaciones.
- Administrador: Iniciar sesión, Gestionar usuarios, Gestionar escenarios, Consultar resultados.

Estos casos de uso corresponden a las pantallas ya navegables del prototipo (acceso, panel del usuario, catálogo de escenarios, simulación, resultado, historial, capacitación y panel de administración).

### 3.2 Diagrama de clases

Clases principales y relaciones:

- **Usuario** (idUsuario, nombre, correo, contraseña, nivelVulnerabilidad) — *realiza* → **Simulacion**
- **Escenario** (idEscenario, titulo, tipoAmenaza, dificultad, descripcion) — *utiliza* → **Simulacion**
- **Simulacion** (idSimulacion, fecha, tiempoRespuesta, estado) — *contiene* → **Decision**, *genera* → **Resultado**
- **Decision** (idDecision, respuesta, esCorrecta)
- **Resultado** (idResultado, puntuacion, retroalimentacion, nivelVulnerabilidad)
- **ModeloIA** (idModelo, version; +analizarDesempeno(), +calcularVulnerabilidad()) — *analiza* → **Simulacion**, *apoya generación de* → **Resultado**

Estas clases ya están reflejadas en el prototipo (`js/models/models.js` como `Usuario`, `Escenario`, `Simulacion`; `js/services/aiEngine.js` como el `ModeloIA`), aunque en esta fase `Decision` y `Resultado` viven como atributos de la simulación en memoria en lugar de entidades independientes.

### 3.3 Diagrama de componentes

Organización de los módulos de software (Interfaz, Lógica de negocio, Motor de IA, Acceso a datos, Base de datos) y sus interfaces de comunicación, documentada también de forma interactiva en la pantalla **Arquitectura** del propio prototipo.

## 4. Modelo relacional

Esquema definido para la base de datos que reemplazará a `testData.js` en fases posteriores:

| Tabla | Campos |
|---|---|
| **USUARIO** | `id_usuario` (PK), `nombre`, `correo`, `contrasena`, `nivel_vulnerabilidad` |
| **ESCENARIO** | `id_escenario` (PK), `titulo`, `tipo_amenaza`, `dificultad`, `descripcion` |
| **SIMULACION** | `id_simulacion` (PK), `id_usuario` (FK), `id_escenario` (FK), `fecha`, `tiempo_respuesta`, `estado` |
| **DECISION** | `id_decision` (PK), `id_simulacion` (FK), `respuesta`, `es_correcta` |
| **RESULTADO** | `id_resultado` (PK), `id_simulacion` (FK), `puntuacion`, `retroalimentacion`, `nivel_vulnerabilidad` |

Relaciones: `USUARIO` **realiza** `SIMULACION`; `ESCENARIO` **contiene**/es usado por `SIMULACION`; `SIMULACION` **registra** `DECISION` y **genera** `RESULTADO`.

## 5. Lenguajes, herramientas y tecnologías

- **Frontend (implementado):** HTML5, CSS3, JavaScript vanilla (sin frameworks), fuentes Schibsted Grotesk e IBM Plex Mono, iconos Icons8.
- **Backend (proyectado):** Node.js con Express o Python con Flask, para exponer la lógica de negocio y el motor de IA como API REST.
- **Base de datos (proyectada):** PostgreSQL o MySQL, para persistir usuarios, escenarios e historiales.
- **Herramientas de modelado:** StarUML / Lucidchart / Draw.io, para la diagramación UML y relacional.
- **Control de versiones:** Git y GitHub.

## 6. Metodología

El desarrollo sigue un enfoque iterativo e incremental basado en fases arquitectónicas, validando la usabilidad y la separación de componentes antes de la codificación profunda del Backend.

- **Fase 1:** definición del problema, necesidades y requerimientos teóricos.
- **Fase 2 (actual):** prototipado estructurado navegable, validación de UI/UX, organización del código en las 5 capas de la arquitectura y modelado UML/relacional.
- **Fases posteriores:** desarrollo del API del Backend, integración de la base de datos relacional y conexión con un algoritmo de evaluación predictiva (IA) que reemplace al motor de reglas actual.

## 7. Organización del proyecto (estructura de capas)

```
simulador-ciberataques/
├── index.html                       Prototipo visual interactivo (Fase 2)
├── README.md
├── css/
│   └── styles.css                   CAPA 1: Interfaz de usuario (estilos)
└── js/
    ├── app.js                       Rutas y arranque de la aplicación
    ├── core/
    │   └── core.js                  Enrutador, trazas MVC y utilidades
    ├── views/
    │   └── views.js                 CAPA 1: Interfaz de usuario (Vista)
    ├── controllers/
    │   └── controllers.js           CAPA 2: Lógica de negocio (Controlador)
    ├── models/
    │   └── models.js                CAPA 2/4: Lógica de negocio (Modelo) + acceso a datos (Repo)
    ├── services/
    │   └── aiEngine.js              CAPA 3: Motor de IA (reglas heurísticas)
    └── data/
        └── testData.js              CAPA 5: Base de datos simulada
```

| Capa de la arquitectura | Componente MVC | Archivo |
|---|---|---|
| Presentación (Interfaz) | **Vista** | `js/views/views.js`, `css/styles.css` |
| Lógica de negocio | **Controlador** | `js/controllers/controllers.js` |
| Lógica de negocio | **Modelo** | `js/models/models.js` |
| Motor de IA | `ModeloIA` (servicio) | `js/services/aiEngine.js` |
| Acceso a datos | Repositorio (`Repo`) | `js/models/models.js` |
| Base de datos | Datos simulados | `js/data/testData.js` |

Flujo de una simulación: **Vista → Controlador → Modelo → Datos → Motor de IA → Vista.**

##  8. Cómo ejecutarlo

Abre `index.html` en el navegador. No requiere servidor ni instalación; necesita internet para cargar la tipografía y los iconos de Icons8.

Cuentas de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| Usuario | carolina.ramirez@ejemplo.co | Demo1234 |
| Administrador | admin@cibersim.co | Admin1234 |

También hay botones de acceso rápido en la pantalla de inicio de sesión.

## 9. Alcance y siguientes fases

- Los datos se reinician al recargar la página; no hay persistencia real todavía.
- Todas las entidades (Banco Andino, Servi-Envíos, etc.) son ficticias, con fines exclusivamente académicos.
- **Fase 3:** reemplazar `Repo` por una base de datos relacional real (PostgreSQL/MySQL) y el motor de reglas por un modelo de IA/NLP, exponiendo ambos a través de una API REST, sin modificar las vistas ni los controladores actuales.

Trazabilidad: Fase 1 (idea y propuesta) → **Fase 2 (prototipo estructurado)** → fases posteriores (implementación funcional del Backend y la IA).

## 10. Referencias

*(Las referencias bibliográficas se ampliarán conforme se redacte el documento PDF final, utilizando formato APA 7.ª edición.)*

- Sommerville, I. (2011). *Ingeniería de software* (9.ª ed.). Pearson Educación.
- Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
