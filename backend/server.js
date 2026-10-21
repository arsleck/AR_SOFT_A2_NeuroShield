require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'NeuroShield_Secret_Fallback_2026';

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Backend activo' });
});

// Endpoint: Iniciar Sesión
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

// Endpoint: Registrar nuevo usuario
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

// === ENDPOINTS DE MICROCURSOS (ALMACENADOS EN BD PARA ADMIN E IA) ===

// 1. Obtener todos los microcursos activos
app.get('/api/cursos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Cursos WHERE activo = TRUE ORDER BY id_curso ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al consultar cursos:', error);
    res.status(500).json({ error: 'No se pudieron obtener los cursos de la base de datos' });
  }
});

// 2. Crear un nuevo microcurso (Para Administrador o Motor IA)
app.post('/api/cursos', async (req, res) => {
  const { slug, titulo, categoria, nivel, duracion, icono, color_tema, fondo_tema, resumen, como_funciona, senales_alerta, prevencion, origen } = req.body;
  if (!titulo || !categoria || !resumen || !como_funciona) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para crear el curso' });
  }

  try {
    const slugFinal = slug || `curso-${Date.now()}`;
    const result = await pool.query(
      `INSERT INTO Cursos (slug, titulo, categoria, nivel, duracion, icono, color_tema, fondo_tema, resumen, como_funciona, senales_alerta, prevencion, origen)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        slugFinal, titulo, categoria, nivel || 'Básico', duracion || '4 min',
        icono || 'fa-shield-halved', color_tema || '#4f46e5', fondo_tema || '#eef2ff',
        resumen, como_funciona, JSON.stringify(senales_alerta || []), prevencion || '', origen || 'Administrador'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ error: 'Error interno al guardar el curso' });
  }
});

// 3. Modificar un microcurso existente (Para Administrador o Motor IA)
app.put('/api/cursos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, categoria, nivel, duracion, resumen, como_funciona, senales_alerta, prevencion } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Cursos 
       SET titulo = $1, categoria = $2, nivel = $3, duracion = $4, resumen = $5, como_funciona = $6, senales_alerta = $7, prevencion = $8, fecha_actualizacion = CURRENT_TIMESTAMP
       WHERE id_curso = $9 RETURNING *`,
      [titulo, categoria, nivel, duracion, resumen, como_funciona, JSON.stringify(senales_alerta || []), prevencion, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ error: 'Error interno al actualizar el curso' });
  }
});

app.listen(port, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${port}`);
});