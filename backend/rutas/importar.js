// Rutas para importar datos externos (productos de prueba)
const express = require('express');
const router = express.Router();
// Cliente HTTP para consumir APIs externas
const axios = require('axios');
// Conexión a base de datos
const db = require('../configuracion/basedatos');
// Middlewares de autenticación/autorización
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

// Importar productos desde Fake Store API
router.post('/productos-prueba', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // 1. Obtener categorías de la API externa
    const respuestaCategorias = await axios.get('https://fakestoreapi.com/products/categories');
    const categoriasAPI = respuestaCategorias.data;

    // Mapeo de nombres de categorías para mostrarlas en español
    const mapeoNombres = {
      "electronics": "Electrónica",
      "jewelery": "Joyería",
      "men's clothing": "Ropa de Hombre",
      "women's clothing": "Ropa de Mujer"
    };

    // Descripciones asociadas a cada categoría
    const mapeoDescripciones = {
      "electronics": "Dispositivos y accesorios electrónicos",
      "jewelery": "Joyas y accesorios elegantes",
      "men's clothing": "Ropa y accesorios para hombre",
      "women's clothing": "Ropa y accesorios para mujer"
    };

    // 2. Insertar categorías si no existen en nuestra base de datos local
    const categoriaIds = {};
    for (const catAPI of categoriasAPI) {
      const nombreCategoria = mapeoNombres[catAPI] || catAPI;
      const descripcionCategoria = mapeoDescripciones[catAPI] || '';

      // Verificar si la categoría ya existe por nombre
      const [existente] = await db.query(
        'SELECT id FROM categorias WHERE nombre = ?',
        [nombreCategoria]
      );

      if (existente.length > 0) {
        categoriaIds[catAPI] = existente[0].id;
      } else {
        // Si no existe, crearla como activa
        const [resultado] = await db.query(
          'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, TRUE)',
          [nombreCategoria, descripcionCategoria]
        );
        categoriaIds[catAPI] = resultado.insertId;
      }
    }

    // 3. Obtener productos de la API externa
    const respuestaProductos = await axios.get('https://fakestoreapi.com/products');
    const productosAPI = respuestaProductos.data;

    let productosImportados = 0;
    let productosOmitidos = 0;

    // 4. Insertar productos en la base si no existían anteriormente
    for (const prod of productosAPI) {
      // Verificar si el producto ya existe por nombre
      const [existente] = await db.query(
        'SELECT id FROM productos WHERE nombre = ?',
        [prod.title]
      );

      if (existente.length === 0) {
        const categoriaId = categoriaIds[prod.category];
        // Generar stock aleatorio entre 10 y 60 para pruebas
        const stock = Math.floor(Math.random() * 50) + 10; // Stock aleatorio entre 10-60

        await db.query(
          'INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria_id, activo, destacado) VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)',
          [
            prod.title,
            prod.description,
            prod.price,
            stock,
            prod.image,
            categoriaId
          ]
        );
        productosImportados++;
      } else {
        // Si ya existe, no duplicar y contar como omitido
        productosOmitidos++;
      }
    }

    // Resumen de la operación de importación
    res.json({
      mensaje: 'Importación completada',
      productosImportados,
      productosOmitidos,
      categoriasCreadas: Object.keys(categoriaIds).length
    });

  } catch (error) {
    // Manejo de errores de red, base de datos u otros
    console.error('Error en importación:', error);
    res.status(500).json({ 
      mensaje: 'Error al importar productos', 
      error: error.message 
    });
  }
});

// Exporta el router para montarlo bajo /api/importar
module.exports = router;
