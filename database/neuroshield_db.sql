-- ============================================================================
-- SCRIPT OFICIAL DE BASE DE DATOS: NEUROSHIELD (POSTGRESQL / NEON)
-- Asignatura: Arquitectura de Software - Universidad Manuela Beltrán
-- ============================================================================

-- 1. Tabla de Grupos / Áreas de Entrenamiento
CREATE TABLE IF NOT EXISTS Grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios (Con RBAC y relación a Grupos)
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol VARCHAR(30) DEFAULT 'Estudiante' CHECK (rol IN ('Estudiante', 'Administrador')),
    nivel_vulnerabilidad INTEGER DEFAULT 50 CHECK (nivel_vulnerabilidad BETWEEN 0 AND 100),
    id_grupo INTEGER REFERENCES Grupos(id_grupo) ON DELETE SET NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Principal de Cursos
CREATE TABLE IF NOT EXISTS Cursos (
    id_curso SERIAL PRIMARY KEY,
    slug VARCHAR(120) UNIQUE NOT NULL,
    titulo VARCHAR(180) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    nivel VARCHAR(30) DEFAULT 'Básico',
    duracion VARCHAR(30) DEFAULT '5 min',
    icono VARCHAR(60) DEFAULT 'fa-shield-halved',
    color_tema VARCHAR(20) DEFAULT '#4ea82f',
    fondo_tema VARCHAR(20) DEFAULT '#eef8e8',
    portada_url TEXT DEFAULT NULL,
    resumen TEXT NOT NULL,
    como_funciona TEXT NOT NULL,
    senales_alerta JSONB DEFAULT '[]'::jsonb,
    prevencion TEXT NOT NULL,
    habilidades JSONB DEFAULT '[]'::jsonb,
    origen VARCHAR(40) DEFAULT 'Sistema',
    prompt_generacion TEXT DEFAULT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Módulos Teóricos y Multimedia por Curso (Relación 1:N)
CREATE TABLE IF NOT EXISTS Curso_Materiales (
    id_material SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    orden INTEGER DEFAULT 1,
    titulo VARCHAR(180) NOT NULL,
    tipo_recurso VARCHAR(30) DEFAULT 'lectura',
    archivo_url TEXT DEFAULT NULL,
    mime_type VARCHAR(80) DEFAULT NULL,
    contenido_texto TEXT DEFAULT NULL,
    es_post_quiz BOOLEAN DEFAULT FALSE
);

-- 5. Tabla de Evaluaciones / Quizzes por Curso (Relación 1:N)
CREATE TABLE IF NOT EXISTS Curso_Quizzes (
    id_quiz SERIAL PRIMARY KEY,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    orden INTEGER DEFAULT 1,
    pregunta TEXT NOT NULL,
    recurso_apoyo_url TEXT DEFAULT NULL,
    tipo_recurso_apoyo VARCHAR(30) DEFAULT NULL,
    opciones JSONB NOT NULL,
    explicacion TEXT DEFAULT NULL,
    puntos_riesgo_fallo INTEGER DEFAULT 15
);

-- 6. Tabla de Progreso y Logros Desbloqueados por Usuario (Relación N:M)
CREATE TABLE IF NOT EXISTS Progreso_Cursos (
    id_progreso SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
    completado BOOLEAN DEFAULT TRUE,
    puntaje_quiz INTEGER DEFAULT 0,
    intentos INTEGER DEFAULT 1,
    fecha_completado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_usuario, id_curso)
);

-- 7. Tabla de Escenarios de Simulación Multicanal
CREATE TABLE IF NOT EXISTS Misiones (
    id_mision SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    vector VARCHAR(50) NOT NULL,
    dificultad VARCHAR(40) DEFAULT 'Básico',
    tiempo_limite INTEGER DEFAULT 120,
    descripcion_corta TEXT NOT NULL,
    remitente_nombre VARCHAR(120) NOT NULL,
    remitente_identificador VARCHAR(150) NOT NULL,
    asunto_o_contexto VARCHAR(200) NOT NULL,
    contenido_principal TEXT NOT NULL,
    texto_boton_trampa VARCHAR(100) DEFAULT 'Verificar Cuenta Ahora',
    url_trampa VARCHAR(200) DEFAULT 'http://validacion-segura-col.org/login',
    pistas_forenses JSONB NOT NULL,
    modo_simulacion VARCHAR(40) DEFAULT 'reaccion',
    origen VARCHAR(40) DEFAULT 'Sistema',
    prompt_generacion TEXT DEFAULT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabla de Historial Forense de Simulaciones por Usuario
CREATE TABLE IF NOT EXISTS Historial_Simulaciones (
    id_simulacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
    id_mision INTEGER NOT NULL REFERENCES Misiones(id_mision) ON DELETE CASCADE,
    decision VARCHAR(30) NOT NULL,
    impacto_riesgo INTEGER NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);