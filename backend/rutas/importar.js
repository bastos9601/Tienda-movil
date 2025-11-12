const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../configuracion/basedatos');
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

// Importar productos desde Fake Store API
router.post('/productos-prueba', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // 1. Obtener categorías de la API
    const respuestaCategorias = await axios.get('https://fakestoreapi.com/products/categories');
    const categoriasAPI = respuestaCategorias.data;

    // Mapeo de nombres de categorías
    const mapeoNombres = {
      "electronics": "Electrónica",
      "jewelery": "Joyería",
      "men's clothing": "Ropa de Hombre",
      "women's clothing": "Ropa de Mujer"
    };

    const mapeoDescripciones = {
      "electronics": "Dispositivos y accesorios electrónicos",
      "jewelery": "Joyas y accesorios elegantes",
      "men's clothing": "Ropa y accesorios para hombre",
      "women's clothing": "Ropa y accesorios para mujer"
    };

    // 2. Insertar categorías si no existen
    const categoriaIds = {};
    for (const catAPI of categoriasAPI) {
      const nombreCategoria = mapeoNombres[catAPI] || catAPI;
      const descripcionCategoria = mapeoDescripciones[catAPI] || '';

      // Verificar si ya existe
      const [existente] = await db.query(
        'SELECT id FROM categorias WHERE nombre = ?',
        [nombreCategoria]
      );

      if (existente.length > 0) {
        categoriaIds[catAPI] = existente[0].id;
      } else {
        const [resultado] = await db.query(
          'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, TRUE)',
          [nombreCategoria, descripcionCategoria]
        );
        categoriaIds[catAPI] = resultado.insertId;
      }
    }

    // 3. Obtener productos de la API
    const respuestaProductos = await axios.get('https://fakestoreapi.com/products');
    const productosAPI = respuestaProductos.data;

    let productosImportados = 0;
    let productosOmitidos = 0;

    // 4. Insertar productos
    for (const prod of productosAPI) {
      // Verificar si el producto ya existe por nombre
      const [existente] = await db.query(
        'SELECT id FROM productos WHERE nombre = ?',
        [prod.title]
      );

      if (existente.length === 0) {
        const categoriaId = categoriaIds[prod.category];
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
        productosOmitidos++;
      }
    }

    res.json({
      mensaje: 'Importación completada',
      productosImportados,
      productosOmitidos,
      categoriasCreadas: Object.keys(categoriaIds).length
    });

  } catch (error) {
    console.error('Error en importación:', error);
    res.status(500).json({ 
      mensaje: 'Error al importar productos', 
      error: error.message 
    });
  }
});

module.exports = router;
