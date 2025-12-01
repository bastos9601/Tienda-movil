// Rutas para importar datos externos (productos de prueba)
const express = require('express'); // Importa Express, framework web para Node.js.
const router = express.Router(); // Crea un router de Express para agrupar las rutas. 

// Cliente HTTP para consumir APIs externas
const axios = require('axios'); // Importa axios, cliente HTTP usado para hacer peticiones externas (GET/POST/etc).

// Conexión a base de datos
const db = require('../configuracion/basedatos'); // Importa la configuración/cliente de base de datos (ej. pool con promesas).

// Middlewares de autenticación/autorización
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion'); // Importa middlewares para proteger la ruta (token y rol admin).

// Importar productos desde Fake Store API
router.post('/productos-prueba', verificarToken, verificarAdmin, async (req, res) => { // Define la ruta POST '/productos-prueba' protegida por verificarToken y verificarAdmin.
  try { // Inicio del bloque try para manejo de errores asíncronos.
    // 1. Obtener categorías de la API externa
    const respuestaCategorias = await axios.get('https://fakestoreapi.com/products/categories'); // Llama a la API externa para traer nombres de categorías.
    const categoriasAPI = respuestaCategorias.data; // Extrae el cuerpo de la respuesta (array de nombres de categorías).

    // Mapeo de nombres de categorías para mostrarlas en español
    const mapeoNombres = { // Diccionario que traduce/normaliza nombres de categoría de la API al nombre que usaremos en la BD.
      "electronics": "Electrónica",
      "jewelery": "Joyería", 
      "men's clothing": "Ropa de Hombre",
      "women's clothing": "Ropa de Mujer"
    };

    // Descripciones asociadas a cada categoría
    const mapeoDescripciones = { // Diccionario con descripciones en español para cada categoría.
      "electronics": "Dispositivos y accesorios electrónicos",
      "jewelery": "Joyas y accesorios elegantes",
      "men's clothing": "Ropa y accesorios para hombre",
      "women's clothing": "Ropa y accesorios para mujer"
    };

    // 2. Insertar categorías si no existen en nuestra base de datos local
    const categoriaIds = {}; // Objeto para almacenar mapping { nombreAPI: idEnDB } para usar cuando creemos productos.
    for (const catAPI of categoriasAPI) { // Recorre cada nombre de categoría obtenido de la API externa.
      const nombreCategoria = mapeoNombres[catAPI] || catAPI; // Usa la traducción si existe, si no, usa el nombre tal cual.
      const descripcionCategoria = mapeoDescripciones[catAPI] || ''; // Obtiene la descripción mapeada o cadena vacía si no hay.

      // Verificar si la categoría ya existe por nombre
      const [existente] = await db.query( // Ejecuta una consulta SELECT para buscar la categoría por nombre.
        'SELECT id FROM categorias WHERE nombre = ?',
        [nombreCategoria]
      );

      if (existente.length > 0) { // Si la consulta devolvió al menos una fila, la categoría ya existe.
        categoriaIds[catAPI] = existente[0].id; // Guarda el id existente en el objeto mapping.
      } else {
        // Si no existe, crearla como activa
        const [resultado] = await db.query( // Inserta la nueva categoría en la tabla 'categorias'.
          'INSERT INTO categorias (nombre, descripcion, activo) VALUES (?, ?, TRUE)',
          [nombreCategoria, descripcionCategoria]
        );
        categoriaIds[catAPI] = resultado.insertId; // Guarda el id generado por la BD para esa categoría.
      }
    }

    // 3. Obtener productos de la API externa
    const respuestaProductos = await axios.get('https://fakestoreapi.com/products'); // Llama a la API para traer todos los productos de prueba.
    const productosAPI = respuestaProductos.data; // Extrae el array de productos del cuerpo de la respuesta.

    let productosImportados = 0; // Contador para productos que se insertan.
    let productosOmitidos = 0; // Contador para productos que ya existían y por tanto se omiten.

    // 4. Insertar productos en la base si no existían anteriormente
    for (const prod of productosAPI) { // Recorre cada producto retornado por la API.
      // Verificar si el producto ya existe por nombre
      const [existente] = await db.query( // Consulta por nombre (prod.title) para evitar duplicados.
        'SELECT id FROM productos WHERE nombre = ?',
        [prod.title]
      );

      if (existente.length === 0) { // Si no existe ninguna fila, el producto es nuevo y debe insertarse.
        const categoriaId = categoriaIds[prod.category]; // Obtiene el id de categoría mapeado anteriormente.
        // Generar stock aleatorio entre 10 y 60 para pruebas
        const stock = Math.floor(Math.random() * 50) + 10; // Genera un número entero aleatorio en [10, 59] + 1 -> [10,60].

        await db.query( // Inserta el producto en la tabla 'productos' con los campos proporcionados.
          'INSERT INTO productos (nombre, descripcion, precio, stock, imagen, categoria_id, activo, destacado) VALUES (?, ?, ?, ?, ?, ?, TRUE, FALSE)',
          [
            prod.title, // nombre del producto
            prod.description, // descripción del producto
            prod.price, // precio
            stock, // stock generado
            prod.image, // URL de la imagen
            categoriaId // FK a la categoría en nuestra BD
          ]
        );
        productosImportados++; // Incrementa contador de importados.
      } else {
        // Si ya existe, no duplicar y contar como omitido
        productosOmitidos++; // Incrementa contador de omitidos (ya existía).
      }
    }

    // Resumen de la operación de importación
    res.json({ // Envía respuesta JSON con el resumen de lo realizado.
      mensaje: 'Importación completada',
      productosImportados,
      productosOmitidos,
      categoriasCreadas: Object.keys(categoriaIds).length // Número de categorías procesadas (creadas o existentes).
    });

  } catch (error) { // Captura errores de la llamada HTTP, consultas a BD, etc.
    // Manejo de errores de red, base de datos u otros
    console.error('Error en importación:', error); // Loggea el error en el servidor para depuración.
    res.status(500).json({  // Responde con status 500 y detalle del error (mensaje).
      mensaje: 'Error al importar productos',
      error: error.message
    });
  }
});

// Exporta el router para montarlo bajo /api/importar
module.exports = router; // Exporta el router para que, al hacer app.use('/api/importar', router), se activen estas rutas.
