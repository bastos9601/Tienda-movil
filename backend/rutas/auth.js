// Rutas de autenticación y registro de usuarios
const express = require('express');                // Importamos Express para manejar rutas HTTP
const router = express.Router();                   // Creamos un router modular de Express

// Librerías para hashear contraseñas y generar/verificar tokens JWT
const bcrypt = require('bcryptjs');                // Librería para comparar/crear hashes de contraseñas
const jwt = require('jsonwebtoken');               // Para crear y verificar tokens JWT

// Pool de conexión MySQL (interfaz basada en promesas)
const db = require('../configuracion/basedatos');  // Importamos la conexión a la BD




// ===== Inicio de sesión (login) =====
router.post('/login', async (req, res) => {        // Definimos una ruta POST asincrónica para /login
  try {
    const { email, contrasena } = req.body;        // Extraemos email y contraseña enviados desde el frontend

    
        // Buscar al usuario activo por email
    const [usuarios] = await db.query(             // Ejecutamos una consulta SQL
      'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
      [email]                                      // Parámetro para evitar SQL Injection
    );
    
    if (usuarios.length === 0) {                   // Si no existe un usuario activo con ese email
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    const usuario = usuarios[0];                   // Obtenemos el primer resultado (el usuario)

    
        // Verificar que la contraseña enviada coincida con el hash guardado
    const contrasenaValida = await bcrypt.compare(
      contrasena,                                  // Contraseña enviada desde el frontend
      usuario.contrasena                           // Hash almacenado en la BD
    );
    
    if (!contrasenaValida) {                       // Si no coincide la contraseña
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    
        // Generar un token JWT con los datos mínimos del usuario
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },   // Carga útil del token
      process.env.JWT_SECRETO,                     // Clave privada para firmar el token
      { expiresIn: '7d' }                          // Tiempo de expiración del token
    );
    // No enviar la contraseña (hash) en la respuesta
    delete usuario.contrasena;
    
        res.json({ mensaje: 'Login exitoso', token, usuario });  // Enviamos token y datos del usuario
  } catch (error) {                               // Manejo de errores
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});


// Exporta el router para que sea montado en servidor.js bajo /api/auth
module.exports = router;
