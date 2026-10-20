require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// === RESTRICCIONES DE SEGURIDAD (REGEX) ===
// Solo permite letras (incluyendo tildes y ñ) y espacios. Entre 3 y 50 caracteres.
const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
// Formato estricto de correo electrónico (texto@texto.dominio)
const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor Backend activo' });
});

// Endpoint: Iniciar Sesión
app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  // Filtro rápido: Si el correo es una aberración, ni siquiera consultamos la BD
  if (!regexCorreo.test(correo)) {
    return res.status(400).json({ error: 'Formato de correo inválido' });
  }

  try {
    const result = await pool.query('SELECT * FROM Usuarios WHERE correo = $1', [correo]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = result.rows[0];
    
    const isMatch = await bcrypt.compare(password, usuario.password_hash);
    const isPlainMatch = password === usuario.password_hash; // Por si probamos con el admin manual

    if (!isMatch && !isPlainMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({
      mensaje: 'Inicio de sesión exitoso',
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

  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // === VALIDACIONES ESTRICTAS (ANTI-ABERRACIONES) ===
  if (!regexNombre.test(nombre.trim())) {
    return res.status(400).json({ error: 'El nombre solo debe contener letras y tener entre 3 y 50 caracteres.' });
  }
  if (!regexCorreo.test(correo.trim())) {
    return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  }
  if (password.length < 6 || password.length > 50) {
    return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 50 caracteres.' });
  }

  try {
    const userExist = await pool.query('SELECT * FROM Usuarios WHERE correo = $1', [correo]);
    if (userExist.rows.length > 0) return res.status(400).json({ error: 'El correo ya está registrado en el sistema' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO Usuarios (nombre, correo, password_hash, rol, nivel_vulnerabilidad) VALUES ($1, $2, $3, $4, $5) RETURNING id_usuario, nombre, correo, rol, nivel_vulnerabilidad',
      [nombre.trim(), correo.trim(), passwordHash, 'Estudiante', 50]
    );

    const nuevoUsuario = result.rows[0];

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
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

app.listen(port, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${port}`);
});