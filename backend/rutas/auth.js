// Rutas de autenticación y registro de usuarios
const express = require('express');
const router = express.Router();
// Librerías para hashear contraseñas y generar/verificar tokens JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Pool de conexión MySQL (interfaz basada en promesas)
const db = require('../configuracion/basedatos');

// ===== Registro de usuario =====
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, contrasena, telefono, direccion } = req.body;
    
    // Verificar si el email ya existe para evitar duplicados
    const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    
    // Encriptar la contraseña con bcrypt (10 rondas de sal)
    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
    
    // Insertar el nuevo usuario en la base de datos
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, contrasenaEncriptada, telefono || null, direccion || null]
    );
    
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
});

// ===== Inicio de sesión (login) =====
router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    
    // Buscar al usuario activo por email
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = TRUE', [email]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar que la contraseña enviada coincida con el hash guardado
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Generar un token JWT con los datos mínimos del usuario
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRETO,
      { expiresIn: '7d' }
    );
    
    // No enviar la contraseña (hash) en la respuesta
    delete usuario.contrasena;
    
    res.json({ mensaje: 'Login exitoso', token, usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

// Exporta el router para que sea montado en servidor.js bajo /api/auth
module.exports = router;
