const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../configuracion/basedatos');

// Registro de usuario
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, contrasena, telefono, direccion } = req.body;
    
    // Verificar si el email ya existe
    const [usuarioExistente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    
    // Encriptar contraseña
    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);
    
    // Crear usuario
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, contrasena, telefono, direccion) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, contrasenaEncriptada, telefono || null, direccion || null]
    );
    
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, contrasena } = req.body;
    
    // Buscar usuario
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ? AND activo = TRUE', [email]);
    
    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    const usuario = usuarios[0];
    
    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRETO,
      { expiresIn: '7d' }
    );
    
    // No enviar la contraseña en la respuesta
    delete usuario.contrasena;
    
    res.json({ mensaje: 'Login exitoso', token, usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;
