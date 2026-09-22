# NeuroShield Pro

## Simulador inteligente de escenarios de ciberataques para la capacitación en ciberseguridad

Proyecto académico de **Arquitectura de Software**  
Programa de **Ingeniería de Software**  
**Universidad Manuela Beltrán**

**Autores:**
- Diego Nicolas Cuervo Ochoa
- Karen Tatiana Chaves Bonilla

**Docente:** Ing. Jamilton Fernando Benavides

**Semestre:** Quinto semestre  
**Ubicación:** Bogotá D.C., Colombia

---

# 1. Descripción del proyecto

**NeuroShield Pro** es una propuesta de solución de software orientada a la capacitación práctica en ciberseguridad mediante la simulación de diferentes escenarios de ciberataques.

El sistema busca proporcionar a los usuarios un entorno **ficticio, seguro y controlado** en el cual puedan enfrentarse a situaciones similares a las que podrían encontrar durante el uso cotidiano de servicios digitales.

La plataforma plantea escenarios relacionados con diferentes modalidades de ingeniería social y ciberataques, entre ellos:

- Phishing.
- Vishing.
- Ingeniería social.
- Suplantación de identidad.
- Mensajes con enlaces sospechosos.
- Correos electrónicos fraudulentos.

El usuario deberá analizar cada situación y tomar una decisión frente al escenario presentado.

Posteriormente, el sistema evaluará su interacción y proporcionará retroalimentación sobre la decisión tomada.

La propuesta contempla además un **Motor de Inteligencia Artificial**, encargado de analizar los datos generados durante las simulaciones para estimar el nivel de vulnerabilidad del usuario y determinar posibles áreas de dificultad.

---

# 2. Contexto

El incremento en el uso de servicios digitales ha generado nuevas oportunidades de comunicación y acceso a información, pero también ha aumentado la exposición de los usuarios frente a diferentes modalidades de fraude y ciberataques.

Muchas de estas amenazas aprovechan principalmente el comportamiento humano mediante técnicas de engaño.

Los atacantes pueden utilizar elementos como:

- Confianza.
- Urgencia.
- Preocupación.
- Suplantación de identidad.
- Apariencia institucional.
- Mensajes fraudulentos.
- Enlaces maliciosos.

Esto puede provocar que personas sin conocimientos especializados en ciberseguridad realicen acciones que comprometan sus credenciales, información personal u otros datos.

Por esta razón, NeuroShield Pro propone complementar la capacitación tradicional mediante un entorno práctico donde el usuario pueda enfrentarse a escenarios simulados sin exponerse a una amenaza real.

---

# 3. Problemática

Los usuarios que utilizan diariamente medios digitales no necesariamente cuentan con los conocimientos suficientes para identificar las señales asociadas a una amenaza informática.

Por ejemplo, una persona puede recibir un correo electrónico que aparenta pertenecer a una entidad legítima y contener un enlace que solicita realizar determinada acción.

De manera similar, un usuario puede recibir una llamada o mensaje de alguien que afirma representar una organización conocida.

Este tipo de situaciones pueden aprovechar la confianza del usuario y generar respuestas impulsivas.

La problemática se encuentra principalmente en la falta de espacios prácticos y controlados donde las personas puedan aprender a reconocer estas señales y practicar cómo reaccionar frente a ellas.

La documentación del proyecto identifica precisamente esta necesidad de pasar de una capacitación exclusivamente teórica hacia experiencias prácticas y seguras.

---

# 4. Necesidad

Los usuarios necesitan herramientas que les permitan:

- Reconocer señales de riesgo.
- Identificar mensajes fraudulentos.
- Analizar enlaces sospechosos.
- Detectar intentos de suplantación.
- Reconocer técnicas de ingeniería social.
- Tomar decisiones frente a una posible amenaza.
- Recibir retroalimentación después de cada interacción.
- Conocer sus principales dificultades.
- Visualizar su progreso durante el proceso de capacitación.

NeuroShield Pro busca cubrir estas necesidades mediante escenarios ficticios, seguros e interactivos.

El sistema registra las decisiones tomadas por los usuarios y utiliza estos datos para generar evaluaciones y posteriormente incorporar mecanismos de análisis inteligente.

---

# 5. Pregunta problema

> **¿Cómo diseñar una solución de software basada en escenarios simulados e interactivos que contribuya a la capacitación de personas sin conocimientos especializados en ciberseguridad, para la identificación de amenazas digitales y la toma de decisiones frente a estas, en el contexto colombiano?**

---

# 6. Objetivos

## 6.1 Objetivo central

Diseñar una solución de software basada en escenarios simulados e interactivos que contribuya a la capacitación de personas sin conocimientos especializados en ciberseguridad, para la identificación de amenazas digitales y la toma de decisiones frente a estas, en el contexto colombiano.

---

## 6.2 Objetivos específicos

1. Identificar los principales tipos de ciberataques, como phishing, vishing, ingeniería social y suplantación de identidad, que afectan a los usuarios habituales en Colombia, con el propósito de determinar los escenarios en los que debe basarse el simulador.

2. Diseñar escenarios de simulación de ciberataques que permitan al usuario evaluar diferentes situaciones de riesgo y actuar en consecuencia.

3. Diseñar un algoritmo basado en Inteligencia Artificial para analizar los datos generados por el simulador de ciberseguridad y estimar el nivel de vulnerabilidad, así como determinar los puntos débiles en función de los resultados y acciones del usuario durante la simulación.

4. Diseñar y desarrollar la recopilación de datos para su visualización en el tablero de control, con el propósito de facilitar el seguimiento del progreso del usuario.

Los objetivos anteriores corresponden a los establecidos en la documentación del proyecto.

---

# 7. Alcance

El proyecto contempla el diseño y desarrollo progresivo de un simulador interactivo de escenarios de ciberataques.

## Incluye

- Diseño de una interfaz de usuario.
- Escenarios simulados de ciberataques.
- Capacitación mediante interacción.
- Evaluación de decisiones.
- Retroalimentación.
- Recopilación de datos.
- Visualización del progreso.
- Diseño de un Motor de Inteligencia Artificial.
- Arquitectura de software por capas.
- Modelado UML.
- Modelo relacional.
- Diseño basado en Cliente-Servidor.
- Aplicación del patrón MVC.

## Proyección

En fases posteriores se contempla:

- Implementación completa del Backend.
- Implementación de la base de datos.
- Persistencia de información.
- Integración del Motor de IA.
- Entrenamiento del modelo.
- Incorporación de nuevos escenarios.
- Análisis histórico del comportamiento del usuario.

---

# 8. Arquitectura de software

La arquitectura propuesta para NeuroShield Pro se basa en una estructura de **cinco capas**, donde cada componente tiene una responsabilidad específica.

La documentación establece las siguientes capas:

1. Capa de presentación.
2. Capa de lógica de negocio.
3. Capa de motor de IA.
4. Capa de acceso a datos.
5. Capa de base de datos.

```text
┌─────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN                │
│              INTERFAZ                       │
│                                             │
│    Escenarios de simulación                 │
│    Decisiones del usuario                   │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│        CAPA DE LÓGICA DE NEGOCIO            │
│                                             │
│    Generación de escenarios                 │
│    Evaluación de interacciones              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│            CAPA DE MOTOR DE IA              │
│                                             │
│    Cálculo de vulnerabilidad                │
│    Generación de feedback                   │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          CAPA DE ACCESO A DATOS             │
│                                             │
│    Abstracción de persistencia              │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             CAPA DE BASE DE DATOS           │
│                                             │
│    Usuarios · Escenarios · Interacciones    │
└─────────────────────────────────────────────┘
```

---

# 9. Descripción de las capas

## 9.1 Capa de presentación

Es la capa con la que interactúa directamente el usuario.

Sus principales responsabilidades son:

- Mostrar los escenarios.
- Presentar la información de los ataques.
- Permitir tomar decisiones.
- Mostrar resultados.
- Mostrar indicadores.
- Presentar el progreso del usuario.

En el prototipo actual esta capa está representada mediante una interfaz web.

---

## 9.2 Capa de lógica de negocio

Será responsable de controlar las reglas de funcionamiento del sistema.

Entre sus responsabilidades estarán:

- Generar escenarios.
- Administrar las interacciones.
- Evaluar decisiones.
- Coordinar la comunicación entre componentes.
- Gestionar el flujo de las simulaciones.

---

## 9.3 Capa de Motor de IA

Esta capa estará encargada del análisis inteligente de los datos generados durante las simulaciones.

Entre sus responsabilidades se plantea:

- Analizar las interacciones.
- Calcular el nivel de vulnerabilidad.
- Identificar posibles puntos débiles.
- Generar retroalimentación.
- Analizar el progreso del usuario.

La implementación del modelo de IA corresponde a una etapa posterior del proyecto.

---

## 9.4 Capa de acceso a datos

Esta capa será responsable de abstraer las operaciones relacionadas con la persistencia.

Permitirá separar la lógica de negocio de la tecnología específica utilizada para almacenar los datos.

Sus responsabilidades incluirán:

- Consultar información.
- Registrar interacciones.
- Recuperar resultados.
- Gestionar usuarios.
- Gestionar escenarios.

---

## 9.5 Capa de base de datos

Será responsable del almacenamiento persistente de la información.

Entre los datos contemplados se encuentran:

- Usuarios.
- Escenarios.
- Interacciones.
- Resultados.
- Información de progreso.

---

# 10. Modelado UML

El proyecto cuenta con diferentes diagramas UML para representar la estructura y comportamiento de la solución.

Los diagramas desarrollados son:

- Diagrama de casos de uso.
- Diagrama de clases.
- Diagrama de componentes.
- Modelo relacional.
- Modelo MVC.

---

## 10.1 Diagrama de casos de uso

El diagrama de casos de uso representa las interacciones principales entre los actores y el sistema.

### Actores principales

**Usuario**

Interactúa con el simulador para:

- Iniciar el proceso de capacitación.
- Visualizar escenarios.
- Analizar amenazas.
- Tomar decisiones.
- Recibir retroalimentación.
- Consultar su progreso.

**Administrador**

Representa el rol encargado de las funciones administrativas y de gestión del sistema.

### Diagrama

Coloca aquí la imagen correspondiente:

```text
docs/diagramas/casos-de-uso.png
```

![Diagrama de casos de uso](docs/diagramas/casos-de-uso.png)

---

# 11. Diagrama de clases

El diagrama de clases representa las principales entidades que conforman el dominio de NeuroShield Pro y las relaciones existentes entre ellas.

Entre las entidades consideradas se encuentran:

- Usuario.
- Escenario.
- Interacción.
- Reporte.
- Motor de IA.

### Diagrama

Coloca aquí la imagen correspondiente:

```text
docs/diagramas/diagrama-clases.png
```

![Diagrama de clases](docs/diagramas/diagrama-clases.png)

---

# 12. Diagrama de componentes

El diagrama de componentes representa la organización de los principales componentes de software y su comunicación.

Permite visualizar la separación entre:

- Interfaz.
- Lógica de negocio.
- Motor de IA.
- Acceso a datos.
- Base de datos.

### Diagrama

Coloca aquí la imagen correspondiente:

```text
docs/diagramas/diagrama-componentes.png
```

![Diagrama de componentes](docs/diagramas/diagrama-componentes.png)

---

# 13. Modelo relacional

El modelo relacional representa la estructura propuesta para almacenar la información del sistema.

Las principales entidades contempladas son:

```text
USUARIOS
    │
    │
    ▼
INTERACCIONES
    │
    │
    ▼
ESCENARIOS
    │
    │
    ▼
REPORTES
```

### Entidades principales

| Entidad | Descripción |
|---|---|
| Usuarios | Información de los usuarios de la plataforma |
| Escenarios | Situaciones de ciberataques utilizadas para capacitación |
| Interacciones | Registro de las acciones realizadas por el usuario |
| Reportes | Resultados y retroalimentación generados |

### Modelo relacional

Coloca aquí la imagen correspondiente:

```text
docs/diagramas/modelo-relacional.png
```

![Modelo relacional](docs/diagramas/modelo-relacional.png)

---

# 14. Modelo MVC

El patrón MVC permitirá separar las responsabilidades principales de la aplicación.

## Modelo

Representa los datos y entidades del sistema.

Ejemplos:

- Usuario.
- Escenario.
- Interacción.
- Reporte.

## Vista

Corresponde a la interfaz con la que interactúa el usuario.

## Controlador

Coordina las solicitudes y la lógica necesaria para procesar las acciones del usuario.

### Modelo MVC

Coloca aquí la imagen correspondiente:

```text
docs/diagramas/modelo-mvc.png
```

![Modelo MVC](docs/diagramas/modelo-mvc.png)

---

# 15. Modelo de datos

El modelo de datos propuesto contempla inicialmente las siguientes entidades:

## Usuarios

| Campo | Descripción |
|---|---|
| `id_usuario` | Identificador del usuario |
| `correo` | Correo electrónico |
| `password_hash` | Contraseña almacenada mediante hash |
| `rol` | Rol del usuario |
| `nivel_vulnerabilidad` | Nivel de vulnerabilidad |

## Escenarios

| Campo | Descripción |
|---|---|
| `id_escenario` | Identificador del escenario |
| `tipo` | Tipo de ciberataque |
| `descripcion` | Descripción del escenario |
| `nivel_dificultad` | Nivel de dificultad |

## Interacciones

| Campo | Descripción |
|---|---|
| `id_interaccion` | Identificador de la interacción |
| `id_usuario` | Usuario que realizó la interacción |
| `id_escenario` | Escenario utilizado |
| `decision` | Decisión tomada |
| `fecha` | Fecha de la interacción |

## Reportes

| Campo | Descripción |
|---|---|
| `id_reporte` | Identificador del reporte |
| `id_interaccion` | Interacción evaluada |
| `nivel_vulnerabilidad` | Resultado de la evaluación |
| `feedback` | Retroalimentación |

---

# 16. Flujo general del sistema

El flujo general planteado para NeuroShield Pro es:

```text
              ┌───────────────┐
              │    Usuario    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Interfaz    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Escenario   │
              │   simulado    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Decisión    │
              │   usuario     │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Evaluación    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Motor IA    │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │ Retroaliment. │
              └───────┬───────┘
                      │
                      ▼
              ┌───────────────┐
              │   Progreso    │
              └───────────────┘
```

---

# 17. Tecnologías

## Frontend

El prototipo actual utiliza tecnologías web para construir la interfaz:

- HTML5.
- CSS3.
- JavaScript.
- Chart.js.

## Diseño

Se utilizan elementos visuales orientados a una interfaz tecnológica y de ciberseguridad.

Entre ellos:

- Inter.
- JetBrains Mono.
- Componentes gráficos.
- Indicadores visuales.
- Paneles de información.

## Backend

El Backend será implementado en una fase posterior.

La arquitectura contempla la utilización de una API para comunicar el Frontend con las capas de lógica de negocio y procesamiento.

## Base de datos

La arquitectura contempla una base de datos relacional para almacenar la información generada por el sistema.

---

# 18. Estructura del proyecto

La estructura propuesta del repositorio es:

```text
AR_SOFT_A2_NeuroShield/
│
├── frontend/
│   └── src/
│       └── pages/
│           └── index.html
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── ai_engine/
│       └── config/
│
├── docs/
│   └── diagramas/
│       ├── casos-de-uso.png
│       ├── diagrama-clases.png
│       ├── diagrama-componentes.png
│       ├── modelo-relacional.png
│       └── modelo-mvc.png
│
└── README.md
```

La carpeta `docs/diagramas/` está destinada a almacenar las imágenes utilizadas como evidencia del modelado arquitectónico y UML.

---

# 19. Prototipo actual

La versión actual corresponde a un **prototipo estructurado e interactivo**.

El prototipo representa el flujo general de una plataforma de capacitación y permite visualizar los principales componentes de la solución.

Entre los elementos representados se encuentran:

- Pantalla de acceso.
- Dashboard.
- Sandbox de simulación.
- Escenario de Phishing.
- Análisis del mensaje.
- Información técnica.
- Temporizador.
- Decisiones del usuario.
- Evaluación.
- Indicadores de riesgo.
- Retroalimentación.

---

# 20. Escenario de Phishing

Uno de los escenarios representados en el prototipo corresponde a una simulación de Phishing.

El escenario permite presentar al usuario un correo electrónico ficticio con diferentes elementos que pueden ser analizados.

Entre ellos:

- Remitente.
- Asunto.
- Contenido.
- Enlaces.
- Información institucional.
- Elementos de urgencia.
- Información técnica.

El propósito es que el usuario analice el escenario antes de seleccionar una acción.

---

# 21. Evaluación del usuario

El sistema contempla la evaluación de las decisiones realizadas durante cada simulación.

Las acciones representadas en el prototipo incluyen:

- **Caer:** interactuar con la amenaza simulada.
- **Ignorar:** no realizar la acción solicitada.
- **Reportar:** identificar la situación como una posible amenaza.

Estas decisiones son utilizadas para representar cómo el comportamiento del usuario puede influir en su evaluación.

En la versión de prototipo, este comportamiento es simulado mediante reglas de evaluación.

La implementación de un modelo de Inteligencia Artificial corresponde a una etapa posterior.

---

# 22. Dashboard

El Dashboard constituye el espacio destinado a visualizar información relacionada con el progreso del usuario.

Entre los datos que se plantea mostrar se encuentran:

- Nivel de vulnerabilidad.
- Resultados de simulaciones.
- Evolución del desempeño.
- Estadísticas.
- Historial.
- Indicadores de progreso.

La recopilación y visualización de estos datos forma parte del cuarto objetivo específico del proyecto.

---

# 23. Seguridad

Debido a que NeuroShield Pro está orientado a la capacitación en ciberseguridad, la seguridad constituye un aspecto importante de la arquitectura.

Para las futuras fases se contempla:

- Autenticación de usuarios.
- Control de acceso.
- Protección de credenciales.
- Uso de contraseñas almacenadas mediante hash.
- Validación de datos.
- Separación entre Frontend y Backend.
- Protección de los endpoints.
- Uso de variables de entorno.
- Control de acceso según roles.

Los escenarios utilizados por el sistema serán ficticios y controlados, evitando realizar ataques reales sobre sistemas externos.

---

# 24. Estado del proyecto

### Fase actual: Prototipo estructurado

| Componente | Estado |
|---|---|
| Investigación del problema | Completado |
| Definición de objetivos | Completado |
| Arquitectura | Diseñada |
| Modelado UML | Diseñado |
| Modelo relacional | Diseñado |
| Modelo MVC | Diseñado |
| Interfaz gráfica | Prototipo desarrollado |
| Dashboard | Prototipo desarrollado |
| Sandbox | Prototipo desarrollado |
| Escenario de Phishing | Prototipo desarrollado |
| Evaluación simulada | Implementada en prototipo |
| Backend productivo | Pendiente |
| Base de datos | Pendiente |
| Persistencia | Pendiente |
| Motor de IA | Pendiente |
| Entrenamiento del modelo | Pendiente |

---

# 25. Limitaciones actuales

La versión actual presenta las siguientes limitaciones:

1. El sistema se encuentra en etapa de prototipo.
2. La información utilizada para determinadas funcionalidades es simulada.
3. El Backend todavía no se encuentra implementado completamente.
4. La base de datos todavía no está integrada con el prototipo.
5. El Motor de IA todavía no ha sido entrenado.
6. La evaluación actual utiliza lógica simulada.
7. La persistencia de resultados será implementada posteriormente.
8. El número de escenarios disponibles es limitado durante esta fase.

Estas limitaciones corresponden al estado de desarrollo actual y no representan necesariamente las características previstas para la versión final.

---

# 26. Próximas fases

Las siguientes etapas del proyecto estarán orientadas a transformar el prototipo en una solución funcional.

## Backend

- Implementación de API REST.
- Implementación de controladores.
- Implementación de modelos.
- Gestión de usuarios.
- Gestión de escenarios.
- Gestión de simulaciones.

## Base de datos

- Implementación del modelo relacional.
- Creación de tablas.
- Relaciones.
- Persistencia.
- Consultas.

## Motor de IA

- Definición de variables.
- Preparación de datos.
- Selección del algoritmo.
- Entrenamiento.
- Evaluación.
- Integración con el Backend.

## Integración

Se conectarán los diferentes componentes:

```text
Frontend
    │
    ▼
Backend
    │
    ├──────────────► Motor de IA
    │
    ▼
Acceso a datos
    │
    ▼
Base de datos
```

---

# 27. Trazabilidad del proyecto

## Fase 1

- Identificación del problema.
- Investigación.
- Definición de la necesidad.
- Pregunta problema.
- Objetivos.
- Propuesta inicial.

## Fase 2

- Diseño arquitectónico.
- Modelado UML.
- Modelo relacional.
- Modelo MVC.
- Diseño de componentes.
- Desarrollo del prototipo.
- Implementación de la interfaz.
- Simulación de escenarios.
- Evaluación mediante reglas.

## Fases posteriores

- Desarrollo Backend.
- Implementación de base de datos.
- Integración del motor de IA.
- Persistencia.
- Pruebas.
- Integración completa.
- Evolución del sistema.

---

# 28. Diagramas y documentación

Todos los diagramas correspondientes al proyecto se encuentran almacenados en:

```text
docs/diagramas/
```

Actualmente se contemplan:

```text
docs/
└── diagramas/
    ├── casos-de-uso.png
    ├── diagrama-clases.png
    ├── diagrama-componentes.png
    ├── modelo-relacional.png
    └── modelo-mvc.png
```

Para agregar un nuevo diagrama:

1. Guardar la imagen dentro de `docs/diagramas/`.
2. Utilizar un nombre descriptivo.
3. Agregar la referencia Markdown correspondiente en este README.

Ejemplo:

```markdown
![Descripción del diagrama](docs/diagramas/nombre-del-diagrama.png)
```

---

# 29. Conclusiones

NeuroShield Pro plantea una solución orientada a fortalecer la capacitación práctica en ciberseguridad mediante la utilización de escenarios simulados e interactivos.

La propuesta permite que los usuarios puedan enfrentarse a situaciones ficticias relacionadas con amenazas digitales, analizar sus características y tomar decisiones dentro de un entorno seguro.

Desde el punto de vista de Arquitectura de Software, el proyecto establece una separación clara de responsabilidades mediante cinco capas:

- Presentación.
- Lógica de negocio.
- Motor de IA.
- Acceso a datos.
- Base de datos.

Esta organización permite establecer una base para la evolución del sistema y facilita la incorporación posterior de componentes como una API, una base de datos y un modelo de Inteligencia Artificial.

El prototipo desarrollado durante la fase actual representa el funcionamiento general de la plataforma y permite visualizar el flujo de interacción, evaluación y retroalimentación.

---

# 30. Autores

### Diego Nicolas Cuervo Ochoa

Ingeniería de Software  
Universidad Manuela Beltrán

### Karen Tatiana Chaves Bonilla

Ingeniería de Software  
Universidad Manuela Beltrán

### Docente

**Ing. Jamilton Fernando Benavides**

### Asignatura

**Arquitectura de Software**

### Semestre

**Quinto semestre**

### Ubicación

**Bogotá D.C., Colombia**

---

# 31. Referencias

Las referencias utilizadas para la fundamentación del proyecto se encuentran documentadas en el documento académico correspondiente.

Para mantener la trazabilidad académica, las referencias definitivas deberán conservarse de acuerdo con el formato utilizado en la documentación entregada para el proyecto.