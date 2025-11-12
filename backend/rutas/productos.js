const express = require('express');
const router = express.Router();
const db = require('../configuracion/basedatos');
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');
const cloudinary = require('../configuracion/cloudinary');

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const { categoria, busqueda, destacado } = req.query;
    let consulta = `
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      WHERE p.activo = TRUE AND c.activo = TRUE
    `;
    const parametros = [];

    if (categoria) {
      consulta += ' AND p.categoria_id = ?';
      parametros.push(categoria);
    }

    if (busqueda) {
      consulta += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
      parametros.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    if (destacado === 'true') {
      consulta += ' AND p.destacado = TRUE';
    }

    consulta += ' ORDER BY p.fecha_creacion DESC';

    const [productos] = await db.query(consulta, parametros);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const [productos] = await db.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ? AND p.activo = TRUE AND c.activo = TRUE',
      [req.params.id]
    );
    
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json(productos[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
  }
});

// Subir imagen a Cloudinary
router.post('/subir-imagen', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { imagen } = req.body; // Base64 string
    
    if (!imagen) {
      return res.status(400).json({ mensaje: 'No se proporcionó imagen' });
    }

    // Subir a Cloudinary
    const resultado = await cloudinary.uploader.upload(imagen, {
      folder: 'tienda-virtual/productos',
      resource_type: 'auto'
    });

    res.json({ 
      mensaje: 'Imagen subida exitosamente', 
      url: resultado.secure_url 
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir imagen', error: error.message });
  }
});

// Crear producto (solo admin)
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado } = req.body;
    
    const [resultado] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, precio_anterior || null, stock || 0, imagen || null, categoria_id, destacado || false]
    );
    
    res.status(201).json({ mensaje: 'Producto creado exitosamente', id: resultado.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
});

// Actualizar producto (solo admin)
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado, activo } = req.body;
    
    const [resultado] = await db.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, precio_anterior = ?, stock = ?, imagen = ?, categoria_id = ?, destacado = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado, activo, req.params.id]
    );
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
});

// Eliminar producto (solo admin)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [resultado] = await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});

module.exports = router;
