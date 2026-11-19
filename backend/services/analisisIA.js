// =========================================================================
// ANÁLISIS DE VULNERABILIDAD CON IA
// Arma el historial del usuario desde PostgreSQL, lo envía al servicio de IA
// y guarda el resultado para que la aplicación lo use.
// =========================================================================
const iaClient = require('./iaClient');

const VECTORES = ['Phishing', 'Smishing', 'Vishing', 'Ing. Social'];
const DECISIONES = ['caer', 'ignorar', 'tiempo', 'reportar'];
const MAX_INTERACCIONES = 20; // las que recibe la red neuronal

// Crea las tablas y columnas que necesita la integración (idempotente).
async function asegurarEsquemaIA(pool) {
  await pool.query(`
    ALTER TABLE Historial_Simulaciones ADD COLUMN IF NOT EXISTS tiempo_respuesta INTEGER;

    CREATE TABLE IF NOT EXISTS Respuestas_Quiz (
        id_respuesta SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
        id_curso INTEGER NOT NULL REFERENCES Cursos(id_curso) ON DELETE CASCADE,
        id_quiz INTEGER REFERENCES Curso_Quizzes(id_quiz) ON DELETE SET NULL,
        correcta BOOLEAN NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Analisis_IA (
        id_analisis SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
        puntaje INTEGER NOT NULL CHECK (puntaje BETWEEN 0 AND 100),
        nivel VARCHAR(10) NOT NULL,
        riesgo_por_vector JSONB NOT NULL,
        vectores_prioritarios JSONB DEFAULT '[]'::jsonb,
        vectores_sin_practica JSONB DEFAULT '[]'::jsonb,
        recomendaciones JSONB DEFAULT '[]'::jsonb,
        interacciones_analizadas INTEGER DEFAULT 0,
        modelo VARCHAR(40),
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Segunda salida de la red: perfil de refuerzo (probabilidades) y refuerzos activados
    ALTER TABLE Analisis_IA ADD COLUMN IF NOT EXISTS perfil_refuerzo JSONB DEFAULT '{}'::jsonb;
    ALTER TABLE Analisis_IA ADD COLUMN IF NOT EXISTS refuerzos JSONB DEFAULT '[]'::jsonb;
  `);
}

// Consulta común: simulaciones y respuestas de quiz en un mismo formato.
const SQL_INTERACCIONES = `
  SELECT h.id_usuario, 'simulacion' AS tipo, m.vector, m.dificultad, h.decision AS resultado,
         h.tiempo_respuesta, m.tiempo_limite, h.fecha, h.id_simulacion AS consecutivo
  FROM Historial_Simulaciones h
  JOIN Misiones m ON m.id_mision = h.id_mision
  UNION ALL
  SELECT r.id_usuario, 'quiz', c.categoria, c.nivel,
         CASE WHEN r.correcta THEN 'correcta' ELSE 'incorrecta' END,
         NULL, NULL, r.fecha, r.id_respuesta
  FROM Respuestas_Quiz r
  JOIN Cursos c ON c.id_curso = r.id_curso
`;

// Fila de la base de datos -> interacción que entiende el servicio de IA.
function aInteraccion(fila) {
  if (!VECTORES.includes(fila.vector)) return null;
  if (fila.tipo === 'simulacion' && !DECISIONES.includes(fila.resultado)) return null;
  return {
    tipo: fila.tipo,
    vector: fila.vector,
    dificultad: fila.dificultad || 'Básico',
    resultado: fila.resultado,
    tiempo_respuesta: fila.tiempo_respuesta,
    tiempo_limite: fila.tiempo_limite
  };
}

// Últimas interacciones del usuario, en orden cronológico.
async function obtenerHistorial(pool, idUsuario) {
  const { rows } = await pool.query(
    `SELECT * FROM (${SQL_INTERACCIONES}) t
     WHERE t.id_usuario = $1
     ORDER BY t.fecha DESC, t.consecutivo DESC
     LIMIT $2`,
    [idUsuario, MAX_INTERACCIONES]
  );
  return rows.reverse().map(aInteraccion).filter(Boolean);
}

// Cursos activos de los vectores débiles que el usuario aún no ha aprobado.
async function cursosRecomendados(pool, idUsuario, vectores) {
  if (!Array.isArray(vectores) || vectores.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT c.id_curso, c.titulo, c.categoria, c.nivel, c.duracion
     FROM Cursos c
     WHERE c.activo = TRUE
       AND c.categoria = ANY($2::text[])
       AND NOT EXISTS (
         SELECT 1 FROM Progreso_Cursos p
         WHERE p.id_curso = c.id_curso AND p.id_usuario = $1 AND p.puntaje_quiz >= 60
       )
     ORDER BY array_position($2::text[], c.categoria::text), c.id_curso
     LIMIT 4`,
    [idUsuario, vectores]
  );
  return rows;
}

// Cada refuerzo que decide la red se practica mejor con una dinámica del simulador.
const PLAN_POR_REFUERZO = {
  teoria: { modo: 'redflags', dificultad: 'Básico', motivo: 'Identifica las señales de alerta del engaño' },
  presion: { modo: 'reaccion', dificultad: null, motivo: 'Decide con calma aunque el tiempo sea corto' },
  reportar: { modo: 'dialogo', dificultad: null, motivo: 'Practica reportar en lugar de solo ignorar' },
  avanzar: { modo: 'urlinspector', dificultad: 'Avanzado', motivo: 'Analiza un escenario más sofisticado' }
};
const PLAN_POR_DEFECTO = { modo: 'reaccion', dificultad: null, motivo: 'Practica tu vector más débil' };

// Misiones del simulador recomendadas según la salida de la red: riesgo por vector
// (salida 1) y tipo de refuerzo (salida 2).
//   - Subir de dificultad: primero la dificultad Avanzado, en cualquier vector.
//   - Resto: primero los vectores prioritarios y las misiones que aún no ha superado.
async function misionesRecomendadas(pool, idUsuario, analisis) {
  const riesgo = analisis.riesgo_por_vector || {};
  const vectores = [...VECTORES].sort((a, b) => (riesgo[b] ?? 0) - (riesgo[a] ?? 0));
  const prioritarios = Array.isArray(analisis.vectores_prioritarios) && analisis.vectores_prioritarios.length > 0
    ? analisis.vectores_prioritarios : vectores.slice(0, 1);
  const principal = Array.isArray(analisis.refuerzos) && analisis.refuerzos.length > 0
    ? analisis.refuerzos[0].tipo : null;
  const plan = PLAN_POR_REFUERZO[principal] || PLAN_POR_DEFECTO;

  const avanzar = principal === 'avanzar';
  const orden = avanzar
    ? `COALESCE(m.dificultad = $3, FALSE) DESC, superada ASC, array_position($2::text[], m.vector::text)`
    : `(m.vector = ANY($4::text[])) DESC, superada ASC, COALESCE(m.dificultad = $3, FALSE) DESC,
       array_position($2::text[], m.vector::text),
       CASE WHEN $5 THEN m.tiempo_limite END ASC NULLS LAST`;
  const parametros = avanzar
    ? [idUsuario, vectores, plan.dificultad]
    : [idUsuario, vectores, plan.dificultad, prioritarios, principal === 'presion'];

  const { rows } = await pool.query(
    `SELECT m.id_mision, m.titulo, m.vector, m.dificultad, m.tiempo_limite, superada
     FROM (
       SELECT m.*, EXISTS (SELECT 1 FROM Historial_Simulaciones h
                           WHERE h.id_mision = m.id_mision AND h.id_usuario = $1
                             AND h.decision = 'reportar') AS superada
       FROM Misiones m
       WHERE m.activo = TRUE
     ) m
     ORDER BY ${orden}, m.id_mision
     LIMIT 2`,
    parametros
  );
  return rows.map(m => ({ ...m, modo_sugerido: plan.modo, motivo: plan.motivo, refuerzo: principal }));
}

// Una falla al buscar misiones no debe impedir entregar el análisis de la red.
async function misionesRecomendadasSeguro(pool, idUsuario, analisis) {
  try {
    return await misionesRecomendadas(pool, idUsuario, analisis);
  } catch (error) {
    console.error('No se pudieron calcular las misiones recomendadas:', error.message);
    return [];
  }
}

// Flujo completo: historial -> servicio de IA -> guardar -> respuesta para el frontend.
// Devuelve { disponible: false, motivo } cuando no se pudo usar la IA.
async function analizarUsuario(pool, idUsuario) {
  const interacciones = await obtenerHistorial(pool, idUsuario);
  if (interacciones.length === 0) {
    return { disponible: false, motivo: 'El usuario aún no tiene interacciones para analizar.' };
  }

  const analisis = await iaClient.predecir(Number(idUsuario), interacciones);
  if (!analisis) {
    return { disponible: false, motivo: 'El servicio de IA no respondió; se aplicó el motor de reglas.' };
  }

  await pool.query(
    `INSERT INTO Analisis_IA
       (id_usuario, puntaje, nivel, riesgo_por_vector, vectores_prioritarios, vectores_sin_practica,
        recomendaciones, interacciones_analizadas, modelo, perfil_refuerzo, refuerzos)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      idUsuario, analisis.puntaje, analisis.nivel,
      JSON.stringify(analisis.riesgo_por_vector),
      JSON.stringify(analisis.vectores_prioritarios || []),
      JSON.stringify(analisis.vectores_sin_practica || []),
      JSON.stringify(analisis.recomendaciones || []),
      analisis.interacciones_analizadas || interacciones.length,
      analisis.modelo || null,
      JSON.stringify(analisis.perfil_refuerzo || {}),
      JSON.stringify(analisis.refuerzos || [])
    ]
  );
  // La vulnerabilidad oficial del usuario pasa a ser la que estima la red.
  await pool.query('UPDATE Usuarios SET nivel_vulnerabilidad = $1 WHERE id_usuario = $2', [
    Math.max(0, Math.min(100, analisis.puntaje)), idUsuario
  ]);

  return {
    disponible: true,
    ...analisis,
    cursos_recomendados: await cursosRecomendados(pool, idUsuario, analisis.vectores_prioritarios),
    misiones_recomendadas: await misionesRecomendadasSeguro(pool, idUsuario, analisis)
  };
}

// Último análisis guardado (para restaurar el perfil al iniciar sesión).
async function ultimoAnalisis(pool, idUsuario) {
  const { rows } = await pool.query(
    'SELECT * FROM Analisis_IA WHERE id_usuario = $1 ORDER BY fecha DESC, id_analisis DESC LIMIT 1',
    [idUsuario]
  );
  if (rows.length === 0) return { disponible: false, motivo: 'Aún no hay análisis de IA para este usuario.' };
  const a = rows[0];
  return {
    disponible: true,
    puntaje: a.puntaje,
    nivel: a.nivel,
    riesgo_por_vector: a.riesgo_por_vector,
    vectores_prioritarios: a.vectores_prioritarios,
    vectores_sin_practica: a.vectores_sin_practica,
    recomendaciones: a.recomendaciones,
    perfil_refuerzo: a.perfil_refuerzo || {},
    refuerzos: a.refuerzos || [],
    interacciones_analizadas: a.interacciones_analizadas,
    modelo: a.modelo,
    fecha: a.fecha,
    cursos_recomendados: await cursosRecomendados(pool, idUsuario, a.vectores_prioritarios),
    misiones_recomendadas: await misionesRecomendadasSeguro(pool, idUsuario, a)
  };
}

// Últimas interacciones de cada usuario de un grupo (o de todos), agrupadas por usuario.
async function historialesDeGrupo(pool, idGrupo) {
  const { rows } = await pool.query(
    `SELECT * FROM (
       SELECT t.*, ROW_NUMBER() OVER (PARTITION BY t.id_usuario ORDER BY t.fecha DESC, t.consecutivo DESC) AS posicion
       FROM (${SQL_INTERACCIONES}) t
       JOIN Usuarios u ON u.id_usuario = t.id_usuario
       WHERE ($1::int IS NULL OR u.id_grupo = $1::int)
     ) x
     WHERE x.posicion <= $2
     ORDER BY x.id_usuario, x.fecha ASC, x.consecutivo ASC`,
    [idGrupo || null, MAX_INTERACCIONES]
  );

  const porUsuario = new Map();
  rows.forEach(fila => {
    const interaccion = aInteraccion(fila);
    if (!interaccion) return;
    if (!porUsuario.has(fila.id_usuario)) porUsuario.set(fila.id_usuario, []);
    porUsuario.get(fila.id_usuario).push(interaccion);
  });

  return [...porUsuario].map(([id_usuario, interacciones]) => ({ id_usuario, interacciones }));
}

const SIN_DATOS = 'Todavía no hay simulaciones ni quizzes registrados para analizar.';

// Borrador de curso para el administrador a partir del historial de un grupo (o de todos).
async function sugerirCursoParaGrupo(pool, idGrupo, vector) {
  const usuarios = await historialesDeGrupo(pool, idGrupo);
  if (usuarios.length === 0) return { disponible: false, motivo: SIN_DATOS };

  const sugerencia = await iaClient.sugerirCurso(usuarios, VECTORES.includes(vector) ? vector : null);
  if (!sugerencia) {
    return { disponible: false, motivo: 'El servicio de IA no está disponible. Verifica que esté encendido.' };
  }
  return { disponible: true, ...sugerencia };
}

// Borrador de misión del simulador a partir del historial de un grupo (o de todos).
// Envía también los títulos de las misiones activas para que la IA no repita escenarios.
async function sugerirMisionParaGrupo(pool, idGrupo, vector) {
  const usuarios = await historialesDeGrupo(pool, idGrupo);
  if (usuarios.length === 0) return { disponible: false, motivo: SIN_DATOS };

  const { rows } = await pool.query('SELECT titulo FROM Misiones WHERE activo = TRUE');
  const sugerencia = await iaClient.sugerirMision(
    usuarios, VECTORES.includes(vector) ? vector : null, rows.map(r => r.titulo)
  );
  if (!sugerencia) {
    return { disponible: false, motivo: 'El servicio de IA no está disponible. Verifica que esté encendido.' };
  }
  return { disponible: true, ...sugerencia };
}

module.exports = {
  asegurarEsquemaIA,
  obtenerHistorial,
  analizarUsuario,
  ultimoAnalisis,
  sugerirCursoParaGrupo,
  sugerirMisionParaGrupo
};
