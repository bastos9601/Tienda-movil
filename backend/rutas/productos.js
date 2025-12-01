// Rutas para gestionar productos del catálogo
// Archivo: rutas/productos.js (ejemplo de ubicación)

// Importa Express para crear un router modular
const express = require('express');
// Crea una instancia de Router que agrupa rutas relacionadas
const router = express.Router();
// Conexión a base de datos (pool con promesas configurado en ../configuracion/basedatos)
const db = require('../configuracion/basedatos');
// Importa middlewares que validan token y privilegios de administrador
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');
// SDK/instancia de Cloudinary configurada en ../configuracion/cloudinary para subir imágenes
const cloudinary = require('../configuracion/cloudinary');


// --------------------------------------------------
// Obtener productos con filtros opcionales (público)
// Método: GET /api/productos
// --------------------------------------------------
router.get('/', async (req, res) => {
  try {
    // Extrae posibles filtros desde la query string: ?categoria=1&busqueda=camisa&destacado=true
    const { categoria, busqueda, destacado } = req.query;

    // Construimos la consulta SQL base (se usa LEFT JOIN para traer el nombre de la categoría)
    // NOTA: se filtra por p.activo = TRUE y c.activo = TRUE para excluir registros "desactivados".
    let consulta = `
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      WHERE p.activo = TRUE AND c.activo = TRUE
    `;

    // Array que contendrá los parámetros para la consulta preparada (evita inyección SQL)
    const parametros = [];

    // Si se recibió el filtro de categoría, agregamos la condición y su parámetro
    if (categoria) {
      consulta += ' AND p.categoria_id = ?';
      parametros.push(categoria);
    }

    // Si hay término de búsqueda, añadimos condiciones para nombre y descripción usando LIKE
    if (busqueda) {
      consulta += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
      // Se usan comodines % para buscar subcadenas
      parametros.push(`%${busqueda}%`, `%${busqueda}%`);
    }

    // Filtro booleano para productos "destacados". Se compara explícitamente con la cadena 'true'.
    if (destacado === 'true') {
      consulta += ' AND p.destacado = TRUE';
    }

    // Orden por fecha de creación descendente (más recientes primero)
    consulta += ' ORDER BY p.fecha_creacion DESC';

    // Ejecuta la consulta usando pool de conexiones (db.query devuelve una promesa que resuelve un array)
    const [productos] = await db.query(consulta, parametros);

    // Devuelve JSON con el listado de productos
    res.json(productos);
  } catch (error) {
    // En caso de error, responde con código 500 y mensaje de error (útil para debugging)
    res.status(500).json({ mensaje: 'Error al obtener productos', error: error.message });
  }
});


// --------------------------------------------------
// Obtener un producto específico por ID (público)
// Método: GET /api/productos/:id
// --------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    // Ejecuta consulta preparada para buscar el producto por id, asegurando que esté activo
    const [productos] = await db.query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ? AND p.activo = TRUE AND c.activo = TRUE',
      [req.params.id]
    );
    
    // Si no existe resultado, devolvemos 404
    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Devolver el primer (y único) producto encontrado
    res.json(productos[0]);
  } catch (error) {
    // Manejo de error general
    res.status(500).json({ mensaje: 'Error al obtener producto', error: error.message });
  }
});


// --------------------------------------------------
// Subir imagen a Cloudinary (solo admin)
// Método: POST /api/productos/subir-imagen
// Requiere: verificarToken + verificarAdmin
// --------------------------------------------------
router.post('/subir-imagen', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Se espera recibir en el body una cadena Base64 o URL legible por Cloudinary
    const { imagen } = req.body; // Cadena Base64
    
    // Validación simple: si no viene imagen, respondemos 400
    if (!imagen) {
      return res.status(400).json({ mensaje: 'No se proporcionó imagen' });
    }

    // Subimos la imagen a Cloudinary en la carpeta indicada. resource_type: 'auto' detecta imagen/video.
    const resultado = await cloudinary.uploader.upload(imagen, {
      folder: 'tienda-virtual/productos',
      resource_type: 'auto'
    });

    // Respondemos con la URL segura que devuelve Cloudinary
    res.json({ 
      mensaje: 'Imagen subida exitosamente', 
      url: resultado.secure_url 
    });
  } catch (error) {
    // En caso de fallo en la subida, devolver error 500 con mensaje
    res.status(500).json({ mensaje: 'Error al subir imagen', error: error.message });
  }
});


// --------------------------------------------------
// Crear nuevo producto (solo admin)
// Método: POST /api/productos
// Requiere: verificarToken + verificarAdmin
// --------------------------------------------------
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Extraemos campos esperados desde el body
    const { nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado } = req.body;
    
    // Insertamos usando consulta preparada para evitar inyección SQL. Valores opcionales manejados con ||
    const [resultado] = await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, descripcion, precio, precio_anterior || null, stock || 0, imagen || null, categoria_id, destacado || false]
    );
    
    // Devuelve 201 Created con el id del nuevo producto
    res.status(201).json({ mensaje: 'Producto creado exitosamente', id: resultado.insertId });
  } catch (error) {
    // Error genérico
    res.status(500).json({ mensaje: 'Error al crear producto', error: error.message });
  }
});


// --------------------------------------------------
// Actualizar información de un producto (solo admin)
// Método: PUT /api/productos/:id
// Requiere: verificarToken + verificarAdmin
// --------------------------------------------------
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Campos que se pueden actualizar
    const { nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado, activo } = req.body;
    
    // Ejecuta UPDATE con los valores recibidos
    const [resultado] = await db.query(
      'UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, precio_anterior = ?, stock = ?, imagen = ?, categoria_id = ?, destacado = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, precio, precio_anterior, stock, imagen, categoria_id, destacado, activo, req.params.id]
    );
    
    // Si no se afectaron filas, el producto no existe -> 404
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Respuesta exitosa
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    // Manejo de error
    res.status(500).json({ mensaje: 'Error al actualizar producto', error: error.message });
  }
});


// --------------------------------------------------
// Eliminar un producto (solo admin)
// Método: DELETE /api/productos/:id
// Requiere: verificarToken + verificarAdmin
// --------------------------------------------------
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Ejecuta eliminación física. Alternativa recomendada: marcar como activo=false (soft delete).
    const [resultado] = await db.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
    
    // Si no se afectaron filas, devolver 404
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Respuesta exitosa
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    // Error en la eliminación
    res.status(500).json({ mensaje: 'Error al eliminar producto', error: error.message });
  }
});


// Exporta el router para montarlo en la aplicación principal bajo la ruta /api/productos
module.exports = router;
