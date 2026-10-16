# NeuroShield — Fase 2: Prototipo Estructurado

**Proyecto:** Simulador inteligente de escenarios de ciberataques para la capacitación en ciberseguridad  
**Asignatura:** Arquitectura de Software - Universidad Manuela Beltrán  
**Autores:** Diego Nicolas Cuervo Ochoa, Karen Tatiana Chaves Bonilla  

---

## Descripción del avance

Este prototipo evoluciona la propuesta de la Fase 1 hacia una estructura de software organizada estrictamente bajo el patrón **MVC (Modelo-Vista-Controlador)** en el entorno del cliente (Frontend). Se materializa la interfaz de usuario, la navegación dinámica y la simulación de la lógica de evaluación (Motor de IA) mediante reglas estandarizadas, aislando completamente el manejo de datos de la manipulación visual.

## Qué incluye esta fase

* **Pantallas:** Acceso (Login), Mi Progreso (Dashboard predictivo), Sandbox de Ataques (Simulador ICETEX) y Reporte Forense (Resultados).
* **Navegación SPA Real:** Transiciones dinámicas entre pantallas mediante el uso de rutas de hash (`#/login`, `#/dashboard`, `#/simulador`, `#/resultados`).
* **Arquitectura MVC Estricta:** Separación absoluta de responsabilidades:
  * **Modelo (`js/models/data.js`):** Gestión del estado, historial y métricas del usuario.
  * **Vista (`js/views/ui.js`):** Renderizado del DOM, gráficas de Chart.js y estilos, sin contener ninguna lógica de negocio.
  * **Controlador (`js/controllers/app.js`):** Enrutador principal, temporizadores y procesamiento de eventos de usuario.
* **Datos en memoria (Mock Data):** Simulación del perfil del usuario y su historial de aprendizaje (sin conexión a base de datos en esta fase).

## Estructura del proyecto

```text
AR_SOFT_A2_NeuroShield/
├── index.html               # Shell visual principal (Plantillas SPA)
├── css/
│   └── styles.css           # Capa de estilos (Diseño SaaS moderno y minimalista)
├── js/
│   ├── models/
│   │   └── data.js          # (M) Gestión de datos, estado y lógica de puntuación
│   ├── views/
│   │   └── ui.js            # (V) Funciones de actualización de UI y gráficas
│   └── controllers/
│       └── app.js           # (C) Enrutador principal y conexión Modelo-Vista
└── Diagramas/
    ├── Diagrama de casos de uso.jpeg
    ├── Diagrama de clases.jpeg
    ├── Diagrama de componentes.jpeg
    ├── Diagrama.jpeg
    ├── Modelo MVC.jpeg
    └── Modelo relacional.jpeg
```

## Cómo ejecutar

1. Abre el archivo `index.html` directamente en cualquier navegador web moderno.
2. **No requiere servidor local, backend ni instalación de dependencias.**
3. *Datos de prueba:* En la pantalla de login, los campos ya contienen credenciales de demostración. Solo debes hacer clic en "Iniciar Sesión" para acceder al sistema y probar la navegación.

## Reglas de negocio implementadas (Lógica Forense Simulada)

Durante la evaluación en el Sandbox, el Controlador consulta al Modelo para simular el cálculo predictivo del Motor de IA según las decisiones del usuario:

- **Acceder al enlace (Caer):** Penalización crítica. Aumenta la vulnerabilidad en un +25%.
- **Ignorar correo (o quedarse sin tiempo):** Penalización leve por omisión de protocolo de seguridad. Disminuye la vulnerabilidad en un -5%.
- **Reportar Phishing:** Refuerzo positivo. Acción correcta que neutraliza la amenaza y reduce la vulnerabilidad en un -30%.
- **Límites de resiliencia:** El modelo de datos valida matemáticamente que el porcentaje de vulnerabilidad nunca sea menor a 0% ni mayor a 100%.

## Diagramas del proyecto

### Diagrama de casos de uso
![Diagrama de casos de uso](Diagramas/Diagrama%20de%20casos%20de%20uso.jpeg)

### Diagrama de clases
![Diagrama de clases](Diagramas/Diagrama%20de%20clases.jpeg)

### Diagrama de componentes
![Diagrama de componentes](Diagramas/Diagrama%20de%20componentes.jpeg)

### Modelo MVC
![Modelo MVC](Diagramas/Modelo%20MVC.jpeg)

### Modelo relacional
![Modelo relacional](Diagramas/Modelo%20relacional.jpeg)

## Próximos pasos (Fases posteriores)

- **Capa de Base de Datos:** Migración de los datos en memoria hacia una base de datos relacional (PostgreSQL) para persistencia real del historial.
- **Capa de Lógica de Negocio (Backend):** Implementación de una API REST que asuma el rol del Controlador en el servidor de forma segura.
- **Capa Motor de IA:** Reemplazo de las reglas matemáticas estáticas por un modelo de Procesamiento de Lenguaje Natural (NLP) que permita una evaluación semántica de amenazas reales.
