// Rutas para gestionar productos del catálogo
const express = require('express');
const router = express.Router();
// Conexión a base de datos
const db = require('../configuracion/basedatos');
// Middlewares de autenticación/autorización
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');
// SDK de Cloudinary para subir imágenes
const cloudinary = require('../configuracion/cloudinary');

// Obtener productos con filtros opcionales (público)
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

// Obtener un producto específico por ID (público)
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

// Subir imagen a Cloudinary (solo admin)
router.post('/subir-imagen', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { imagen } = req.body; // Cadena Base64
    
    if (!imagen) {
      return res.status(400).json({ mensaje: 'No se proporcionó imagen' });
    }

    // Subir a Cloudinary dentro de la carpeta indicada; auto-detecta tipo de recurso
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

// Crear nuevo producto (solo admin)
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

// Actualizar información de un producto (solo admin)
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

// Eliminar un producto (solo admin)
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

// Exporta el router para montarlo bajo /api/productos
module.exports = router;
