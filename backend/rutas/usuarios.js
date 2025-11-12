const express = require('express');
const router = express.Router();
const db = require('../configuracion/basedatos');
const { verificarToken } = require('../middleware/autenticacion');

// Obtener perfil del usuario autenticado
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, nombre, email, telefono, direccion, rol, fecha_creacion FROM usuarios WHERE id = ?',
      [req.usuario.id]
    );
    
    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message });
  }
});

// Actualizar perfil
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    
    const [resultado] = await db.query(
      'UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, telefono, direccion, req.usuario.id]
    );
    
    res.json({ mensaje: 'Perfil actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil', error: error.message });
  }
});

module.exports = router;
