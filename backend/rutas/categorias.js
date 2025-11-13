// Rutas para gestionar categorías del catálogo
const express = require('express');
const router = express.Router();
// Conexión a base de datos
const db = require('../configuracion/basedatos');
// Middlewares de autenticación/autorización
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

// Obtener todas las categorías activas (acceso público)
router.get('/', async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias WHERE activo = TRUE ORDER BY nombre');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
});

// Obtener todas las categorías incluyendo inactivas (requiere rol admin)
router.get('/admin/todas', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
});

// Crear nueva categoría (requiere rol admin)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, imagen } = req.body;
    const [resultado] = await db.query(
      'INSERT INTO categorias (nombre, descripcion, imagen) VALUES (?, ?, ?)',
      [nombre, descripcion, imagen || null]
    );
    res.status(201).json({ mensaje: 'Categoría creada exitosamente', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear categoría', error: error.message });
  }
});

// Actualizar una categoría existente (requiere rol admin)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, imagen, activo } = req.body;
    const [resultado] = await db.query(
      'UPDATE categorias SET nombre = ?, descripcion = ?, imagen = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, imagen, activo, req.params.id]
    );
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    res.json({ mensaje: 'Categoría actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error: error.message });
  }
});

// Activar/Desactivar una categoría (requiere rol admin)
router.patch('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { activo } = req.body;
    const [resultado] = await db.query(
      'UPDATE categorias SET activo = ? WHERE id = ?',
      [activo, req.params.id]
    );
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    res.json({ mensaje: `Categoría ${activo ? 'activada' : 'desactivada'} exitosamente` });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado de categoría', error: error.message });
  }
});

// Eliminar una categoría (requiere rol admin)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [resultado] = await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    res.json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error: error.message });
  }
});

// Exporta el router para montarlo bajo /api/categorias
module.exports = router;
