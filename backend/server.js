require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'NeuroShield_Secret_Fallback_2026';

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Conexión a PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// =========================================================================
// CONFIGURACIÓN DE ARCHIVOS MULTIMEDIA (IMÁGENES, VIDEOS, AUDIOS, PDFS)
// =========================================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Exponer la carpeta uploads públicamente para que el frontend pueda reproducirlos
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombreLimpio = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${Date.now()}_${nombreLimpio}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // Hasta 50MB para videos o audios
});

// Validaciones Regex
const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// =========================================================================
// MIDDLEWARES DE SEGURIDAD Y CONTROL DE ROLES (RBAC)
// =========================================================================
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.usuario = decoded; // Contiene { id, rol }
    next();
  });
};

const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'Administrador') {
    return res.status(403).json({ error: 'Acceso restringido: Se requieren permisos de Administrador' });
  }
  next();
};

// Healthcheck del Servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Backend activo' });
});

// =========================================================================
// ENDPOINTS DE AUTENTICACIÓN (LOGIN Y REGISTRO)
// =========================================================================

// 1. Iniciar Sesión
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) return res.status(400).json({ error: 'Faltan credenciales' });
  if (!regexCorreo.test(correo)) return res.status(400).json({ error: 'Formato de correo inválido' });

  try {
    const result = await pool.query('SELECT * FROM Usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = result.rows[0];
    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    const isPlainMatch = password === usuario.password_hash;

    if (!isMatch && !isPlainMatch) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id_usuario, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token: token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        riesgoActual: usuario.nivel_vulnerabilidad
      }
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Registrar nuevo usuario
app.post('/api/registro', async (req, res) => {
  const { nombre, correo, password } = req.body;

  if (!nombre || !correo || !password) return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  if (!regexNombre.test(nombre.trim())) return res.status(400).json({ error: 'El nombre solo debe contener letras (mínimo 3).' });
  if (!regexCorreo.test(correo.trim())) return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  if (password.length < 6 || password.length > 50) return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 50 caracteres.' });

  try {
    const userExist = await pool.query('SELECT * FROM Usuarios WHERE correo = $1', [correo]);
    if (userExist.rows.length > 0) return res.status(400).json({ error: 'El correo ya está registrado en el sistema' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO Usuarios (nombre, correo, password_hash, rol, nivel_vulnerabilidad) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, correo, rol, nivel_vulnerabilidad',
      [nombre.trim(), correo.trim(), passwordHash, 'Estudiante', 50]
    );

    const nuevoUsuario = result.rows[0];
    const token = jwt.sign(
      { id: nuevoUsuario.id_usuario, rol: nuevoUsuario.rol },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token: token,
      usuario: {
        id: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        riesgoActual: nuevoUsuario.nivel_vulnerabilidad
      }
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar' });
  }
});

// =========================================================================
// ENDPOINT DE SUBIDA DE ARCHIVOS MULTIMEDIA
// =========================================================================
app.post('/api/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo' });
  }

  const mime = req.file.mimetype;
  let tipoRecurso = 'documento';
  if (mime.startsWith('image/')) tipoRecurso = 'imagen';
  else if (mime.startsWith('video/')) tipoRecurso = 'video';
  else if (mime.startsWith('audio/')) tipoRecurso = 'audio';

  res.status(201).json({
    mensaje: 'Archivo subido correctamente',
    archivo_url: `http://localhost:${port}/uploads/${req.file.filename}`,
    mime_type: mime,
    tipo_recurso: tipoRecurso
  });
});

// =========================================================================
// ENDPOINTS DE MICROCURSOS RELACIONALES (CURSOS + MATERIALES + QUIZZES)
// =========================================================================

// 1. Obtener todos los cursos activos con sus materiales multimedia y quizzes anidados
app.get('/api/cursos', async (req, res) => {
  try {
    const query = `
      SELECT 
        c.*,
        COALESCE(
          (SELECT json_agg(m ORDER BY m.orden ASC, m.id_material ASC)
           FROM Curso_Materiales m
           WHERE m.id_curso = c.id_curso),
          '[]'::json
        ) AS materiales,
        COALESCE(
          (SELECT json_agg(q ORDER BY q.orden ASC, q.id_quiz ASC)
           FROM Curso_Quizzes q
           WHERE q.id_curso = c.id_curso),
          '[]'::json
        ) AS quizzes
      FROM Cursos c
      WHERE c.activo = TRUE
      ORDER BY c.id_curso ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al consultar cursos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los cursos de la base de datos' });
  }
});

// 2. Obtener un curso específico por ID (útil para edición en panel Admin)
app.get('/api/cursos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        c.*,
        COALESCE(
          (SELECT json_agg(m ORDER BY m.orden ASC, m.id_material ASC)
           FROM Curso_Materiales m
           WHERE m.id_curso = c.id_curso),
          '[]'::json
        ) AS materiales,
        COALESCE(
          (SELECT json_agg(q ORDER BY q.orden ASC, q.id_quiz ASC)
           FROM Curso_Quizzes q
           WHERE q.id_curso = c.id_curso),
          '[]'::json
        ) AS quizzes
      FROM Cursos c
      WHERE c.id_curso = $1;
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener curso por ID:', error);
    res.status(500).json({ error: 'Error interno al consultar el curso' });
  }
});

// 3. Crear un curso completo con múltiples materiales y múltiples quizzes (Solo Admin)
app.post('/api/cursos', verificarToken, soloAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      slug, titulo, categoria, nivel, duracion, icono, color_tema, fondo_tema,
      portada_url, resumen, como_funciona, senales_alerta, prevencion,
      habilidades, origen, prompt_generacion, materiales, quizzes
    } = req.body;

    if (!titulo || !categoria || !resumen || !como_funciona) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para crear el curso' });
    }

    await client.query('BEGIN');

    const slugFinal = slug || `curso-${Date.now()}`;
    const insertCurso = await client.query(
      `INSERT INTO Cursos 
       (slug, titulo, categoria, nivel, duracion, icono, color_tema, fondo_tema, portada_url, resumen, como_funciona, senales_alerta, prevencion, habilidades, origen, prompt_generacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        slugFinal,
        titulo,
        categoria,
        nivel || 'Básico',
        duracion || '5 min',
        icono || 'fa-shield-halved',
        color_tema || '#4ea82f',
        fondo_tema || '#eef8e8',
        portada_url || null,
        resumen,
        como_funciona,
        JSON.stringify(senales_alerta || []),
        prevencion || '',
        JSON.stringify(habilidades || []),
        origen || 'Administrador',
        prompt_generacion || null
      ]
    );

    const nuevoCurso = insertCurso.rows[0];

    // Insertar materiales de apoyo (pre-quiz o post-quiz) si se enviaron
    if (Array.isArray(materiales) && materiales.length > 0) {
      for (let i = 0; i < materiales.length; i++) {
        const mat = materiales[i];
        await client.query(
          `INSERT INTO Curso_Materiales 
           (id_curso, orden, titulo, tipo_recurso, archivo_url, mime_type, contenido_texto, es_post_quiz)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            nuevoCurso.id_curso,
            mat.orden || (i + 1),
            mat.titulo || `Material ${i + 1}`,
            mat.tipo_recurso || 'lectura',
            mat.archivo_url || null,
            mat.mime_type || null,
            mat.contenido_texto || '',
            Boolean(mat.es_post_quiz)
          ]
        );
      }
    }

    // Insertar preguntas de quiz si se enviaron
    if (Array.isArray(quizzes) && quizzes.length > 0) {
      for (let i = 0; i < quizzes.length; i++) {
        const q = quizzes[i];
        await client.query(
          `INSERT INTO Curso_Quizzes 
           (id_curso, orden, pregunta, recurso_apoyo_url, tipo_recurso_apoyo, opciones, explicacion, puntos_riesgo_fallo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            nuevoCurso.id_curso,
            q.orden || (i + 1),
            q.pregunta,
            q.recurso_apoyo_url || null,
            q.tipo_recurso_apoyo || null,
            JSON.stringify(q.opciones || []),
            q.explicacion || '',
            q.puntos_riesgo_fallo || 15
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ mensaje: 'Curso creado exitosamente', curso: nuevoCurso });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear curso completo:', error);
    res.status(500).json({ error: 'Error interno al guardar el curso y sus módulos' });
  } finally {
    client.release();
  }
});

// 4. Modificar un curso existente, incluyendo habilidades, materiales y quizzes (Solo Admin)
app.put('/api/cursos/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    const {
      titulo, categoria, nivel, duracion, icono, color_tema, fondo_tema,
      portada_url, resumen, como_funciona, senales_alerta, prevencion,
      habilidades, materiales, quizzes
    } = req.body;

    await client.query('BEGIN');

    const updateResult = await client.query(
      `UPDATE Cursos 
       SET titulo = $1,
           categoria = $2,
           nivel = $3,
           duracion = $4,
           icono = COALESCE($5, icono),
           color_tema = COALESCE($6, color_tema),
           fondo_tema = COALESCE($7, fondo_tema),
           portada_url = $8,
           resumen = $9,
           como_funciona = $10,
           senales_alerta = $11,
           prevencion = $12,
           habilidades = $13,
           fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_curso = $14
       RETURNING *`,
      [
        titulo,
        categoria,
        nivel || 'Básico',
        duracion || '5 min',
        icono || null,
        color_tema || null,
        fondo_tema || null,
        portada_url || null,
        resumen,
        como_funciona,
        JSON.stringify(senales_alerta || []),
        prevencion || '',
        JSON.stringify(habilidades || []),
        id
      ]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    // Sincronizar materiales del curso
    if (Array.isArray(materiales)) {
      await client.query('DELETE FROM Curso_Materiales WHERE id_curso = $1', [id]);
      for (let i = 0; i < materiales.length; i++) {
        const mat = materiales[i];
        await client.query(
          `INSERT INTO Curso_Materiales 
           (id_curso, orden, titulo, tipo_recurso, archivo_url, mime_type, contenido_texto, es_post_quiz)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            mat.orden || (i + 1),
            mat.titulo || `Material ${i + 1}`,
            mat.tipo_recurso || 'lectura',
            mat.archivo_url || null,
            mat.mime_type || null,
            mat.contenido_texto || '',
            Boolean(mat.es_post_quiz)
          ]
        );
      }
    }

    // Sincronizar preguntas del curso
    if (Array.isArray(quizzes)) {
      await client.query('DELETE FROM Curso_Quizzes WHERE id_curso = $1', [id]);
      for (let i = 0; i < quizzes.length; i++) {
        const q = quizzes[i];
        await client.query(
          `INSERT INTO Curso_Quizzes 
           (id_curso, orden, pregunta, recurso_apoyo_url, tipo_recurso_apoyo, opciones, explicacion, puntos_riesgo_fallo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            id,
            q.orden || (i + 1),
            q.pregunta,
            q.recurso_apoyo_url || null,
            q.tipo_recurso_apoyo || null,
            JSON.stringify(q.opciones || []),
            q.explicacion || '',
            q.puntos_riesgo_fallo || 15
          ]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ mensaje: 'Curso actualizado correctamente', curso: updateResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ error: 'Error interno al actualizar el curso' });
  } finally {
    client.release();
  }
});

// 5. Eliminar (desactivar) un curso (Solo Admin)
app.delete('/api/cursos/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE Cursos SET activo = FALSE WHERE id_curso = $1 RETURNING id_curso', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ mensaje: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ error: 'Error interno al eliminar el curso' });
  }
});

// 6. Registrar el progreso y calificación de un usuario al completar el Quiz de un curso
app.post('/api/cursos/:id/progreso', async (req, res) => {
  const { id } = req.params;
  const { id_usuario, puntaje_quiz, nuevo_riesgo } = req.body;

  if (!id_usuario) return res.status(400).json({ error: 'Falta id_usuario' });

  try {
    const progresoResult = await pool.query(
      `INSERT INTO Progreso_Cursos (id_usuario, id_curso, completado, puntaje_quiz, intentos, fecha_completado)
       VALUES ($1, $2, TRUE, $3, 1, CURRENT_TIMESTAMP)
       ON CONFLICT (id_usuario, id_curso)
       DO UPDATE SET 
         completado = TRUE,
         puntaje_quiz = EXCLUDED.puntaje_quiz,
         intentos = Progreso_Cursos.intentos + 1,
         fecha_completado = CURRENT_TIMESTAMP
       RETURNING *`,
      [id_usuario, id, puntaje_quiz || 0]
    );

    if (typeof nuevo_riesgo === 'number') {
      await pool.query(
        'UPDATE Usuarios SET nivel_vulnerabilidad = $1 WHERE id_usuario = $2',
        [Math.max(0, Math.min(100, nuevo_riesgo)), id_usuario]
      );
    }

    res.json({ mensaje: 'Progreso guardado', progreso: progresoResult.rows[0] });
  } catch (error) {
    console.error('Error al guardar progreso:', error);
    res.status(500).json({ error: 'No se pudo registrar el progreso del curso' });
  }
});

// =========================================================================
// ENDPOINTS DE PERFIL Y LOGROS DEL USUARIO
// =========================================================================

// 1. Actualizar datos personales del usuario
app.put('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, nuevaPassword } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ error: 'El nombre y el correo son obligatorios.' });
  }
  if (!regexNombre.test(nombre.trim())) {
    return res.status(400).json({ error: 'El nombre solo debe contener letras (mínimo 3).' });
  }
  if (!regexCorreo.test(correo.trim())) {
    return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  }

  try {
    const checkEmail = await pool.query(
      'SELECT id_usuario FROM Usuarios WHERE correo = $1 AND id_usuario != $2',
      [correo.trim(), id]
    );
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Ese correo ya está en uso por otra cuenta.' });
    }

    let result;
    if (nuevaPassword && nuevaPassword.trim().length > 0) {
      if (nuevaPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener mínimo 6 caracteres.' });
      }
      const passwordHash = await bcrypt.hash(nuevaPassword, 10);
      result = await pool.query(
        `UPDATE Usuarios 
         SET nombre = $1, correo = $2, password_hash = $3 
         WHERE id_usuario = $4 
         RETURNING id_usuario, nombre, correo, rol, nivel_vulnerabilidad`,
        [nombre.trim(), correo.trim(), passwordHash, id]
      );
    } else {
      result = await pool.query(
        `UPDATE Usuarios 
         SET nombre = $1, correo = $2 
         WHERE id_usuario = $3 
         RETURNING id_usuario, nombre, correo, rol, nivel_vulnerabilidad`,
        [nombre.trim(), correo.trim(), id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const u = result.rows[0];
    res.json({
      mensaje: 'Información actualizada correctamente',
      usuario: {
        id: u.id_usuario,
        nombre: u.nombre,
        correo: u.correo,
        rol: u.rol,
        riesgoActual: u.nivel_vulnerabilidad
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno al actualizar los datos del usuario.' });
  }
});

// 2. Obtener los cursos aprobados (logros desbloqueados) por un usuario
app.get('/api/usuarios/:id/progreso', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id_curso, completado, puntaje_quiz, intentos, fecha_completado FROM Progreso_Cursos WHERE id_usuario = $1',
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener logros del usuario:', error);
    res.status(500).json({ error: 'No se pudo consultar el progreso' });
  }
});

// =========================================================================
// ENDPOINTS DE SIMULADORES PRÁCTICOS (CRUD COMPLETO PARA ADMIN E IA)
// =========================================================================

// 1. Obtener todas las misiones activas para el Simulador
app.get('/api/misiones', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Misiones WHERE activo = TRUE ORDER BY id_mision ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener misiones:', error);
    res.status(500).json({ error: 'No se pudieron obtener las misiones' });
  }
});

// 2. Crear un nuevo escenario de simulación / ataque (Solo Admin o Red Neuronal IA)
app.post('/api/misiones', verificarToken, soloAdmin, async (req, res) => {
  const {
    titulo, vector, dificultad, tiempo_limite, descripcion_corta,
    remitente_nombre, remitente_identificador, asunto_o_contexto,
    contenido_principal, texto_boton_trampa, url_trampa,
    pistas_forenses, origen, prompt_generacion
  } = req.body;

  if (!titulo || !vector || !contenido_principal || !remitente_identificador) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para crear el escenario de simulación' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Misiones 
       (titulo, vector, dificultad, tiempo_limite, descripcion_corta, remitente_nombre, remitente_identificador, asunto_o_contexto, contenido_principal, texto_boton_trampa, url_trampa, pistas_forenses, origen, prompt_generacion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        titulo.trim(),
        vector,
        dificultad || 'Básico',
        parseInt(tiempo_limite, 10) || 120,
        descripcion_corta || '',
        remitente_nombre || 'Remitente Desconocido',
        remitente_identificador.trim(),
        asunto_o_contexto || '',
        contenido_principal.trim(),
        texto_boton_trampa || 'Verificar Ahora',
        url_trampa || 'http://enlace-sospechoso.org',
        JSON.stringify(pistas_forenses || []),
        origen || 'Administrador',
        prompt_generacion || null
      ]
    );
    res.status(201).json({ mensaje: 'Simulador creado exitosamente', mision: result.rows[0] });
  } catch (error) {
    console.error('Error al crear misión:', error);
    res.status(500).json({ error: 'Error interno al guardar el simulador' });
  }
});

// 3. Modificar un escenario de simulación existente (Solo Admin)
app.put('/api/misiones/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    titulo, vector, dificultad, tiempo_limite, descripcion_corta,
    remitente_nombre, remitente_identificador, asunto_o_contexto,
    contenido_principal, texto_boton_trampa, url_trampa, pistas_forenses
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Misiones 
       SET titulo = $1, vector = $2, dificultad = $3, tiempo_limite = $4,
           descripcion_corta = $5, remitente_nombre = $6, remitente_identificador = $7,
           asunto_o_contexto = $8, contenido_principal = $9, texto_boton_trampa = $10,
           url_trampa = $11, pistas_forenses = $12
       WHERE id_mision = $13
       RETURNING *`,
      [
        titulo.trim(),
        vector,
        dificultad || 'Básico',
        parseInt(tiempo_limite, 10) || 120,
        descripcion_corta || '',
        remitente_nombre || '',
        remitente_identificador.trim(),
        asunto_o_contexto || '',
        contenido_principal.trim(),
        texto_boton_trampa || 'Verificar Ahora',
        url_trampa || 'http://enlace-sospechoso.org',
        JSON.stringify(pistas_forenses || []),
        id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Simulador no encontrado' });
    res.json({ mensaje: 'Simulador actualizado correctamente', mision: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar misión:', error);
    res.status(500).json({ error: 'Error interno al actualizar el simulador' });
  }
});

// 4. Eliminar (desactivar) un escenario de simulación (Solo Admin)
app.delete('/api/misiones/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE Misiones SET activo = FALSE WHERE id_mision = $1 RETURNING id_mision', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Simulador no encontrado' });
    res.json({ mensaje: 'Simulador eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar misión:', error);
    res.status(500).json({ error: 'Error interno al eliminar el simulador' });
  }
});

// 5. Registrar el resultado de una simulación práctica jugada por un usuario
app.post('/api/misiones/:id/evaluar', async (req, res) => {
  const { id } = req.params;
  const { id_usuario, decision, impacto_riesgo, nuevo_riesgo_global } = req.body;

  try {
    if (id_usuario) {
      await pool.query(
        `INSERT INTO Historial_Simulaciones (id_usuario, id_mision, decision, impacto_riesgo)
         VALUES ($1, $2, $3, $4)`,
        [id_usuario, id, decision, impacto_riesgo || 0]
      );

      if (typeof nuevo_riesgo_global === 'number') {
        await pool.query(
          'UPDATE Usuarios SET nivel_vulnerabilidad = $1 WHERE id_usuario = $2',
          [Math.max(0, Math.min(100, nuevo_riesgo_global)), id_usuario]
        );
      }
    }
    res.json({ mensaje: 'Simulación registrada en base de datos' });
  } catch (error) {
    console.error('Error al registrar simulación:', error);
    res.status(500).json({ error: 'Error interno al guardar la simulación' });
  }
});

// =========================================================================
// ENDPOINTS DE ADMINISTRACIÓN: GESTIÓN DE USUARIOS Y GRUPOS (SOLO ADMIN)
// =========================================================================

// 1. Obtener lista completa de usuarios con su grupo
app.get('/api/admin/usuarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const query = `
      SELECT u.id_usuario, u.nombre, u.correo, u.rol, u.nivel_vulnerabilidad, u.id_grupo,
             g.nombre_grupo
      FROM Usuarios u
      LEFT JOIN Grupos g ON u.id_grupo = g.id_grupo
      ORDER BY u.id_usuario ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error interno al obtener los usuarios' });
  }
});

// 2. Actualizar el Rol y el Grupo de un usuario
app.put('/api/admin/usuarios/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  const { rol, id_grupo } = req.body;

  const rolesPermitidos = ['Estudiante', 'Administrador'];
  if (!rolesPermitidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol no válido' });
  }

  try {
    const grupoValor = id_grupo ? parseInt(id_grupo, 10) : null;
    const result = await pool.query(
      `UPDATE Usuarios 
       SET rol = $1, id_grupo = $2 
       WHERE id_usuario = $3 
       RETURNING id_usuario, nombre, correo, rol, nivel_vulnerabilidad, id_grupo`,
      [rol, grupoValor, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado por el administrador', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar rol/grupo del usuario:', error);
    res.status(500).json({ error: 'No se pudo actualizar el usuario' });
  }
});

// 3. Obtener todos los grupos con la cantidad de miembros inscritos
app.get('/api/admin/grupos', verificarToken, soloAdmin, async (req, res) => {
  try {
    const query = `
      SELECT g.*, COUNT(u.id_usuario)::int AS total_usuarios,
             COALESCE(ROUND(AVG(u.nivel_vulnerabilidad)), 0)::int AS riesgo_promedio
      FROM Grupos g
      LEFT JOIN Usuarios u ON g.id_grupo = u.id_grupo
      GROUP BY g.id_grupo
      ORDER BY g.id_grupo ASC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({ error: 'Error interno al consultar los grupos' });
  }
});

// 4. Crear un nuevo grupo de usuarios
app.post('/api/admin/grupos', verificarToken, soloAdmin, async (req, res) => {
  const { nombre_grupo, descripcion } = req.body;
  if (!nombre_grupo || nombre_grupo.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre del grupo debe tener al menos 3 caracteres' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Grupos (nombre_grupo, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre_grupo.trim(), descripcion ? descripcion.trim() : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(400).json({ error: 'El nombre del grupo ya existe o hubo un error al guardarlo' });
  }
});

// 5. Eliminar un grupo
app.delete('/api/admin/grupos/:id', verificarToken, soloAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Grupos WHERE id_grupo = $1', [id]);
    res.json({ mensaje: 'Grupo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({ error: 'No se pudo eliminar el grupo' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${port}`);
});