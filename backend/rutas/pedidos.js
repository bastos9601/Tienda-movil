// Rutas para gestionar pedidos y sus detalles
const express = require('express'); // Importa Express (framework web para Node.js)
const router = express.Router(); // Crea un router modular para agrupar las rutas relacionadas a pedidos
// Conexión a base de datos (pool con promesas)
const db = require('../configuracion/basedatos'); // Importa el módulo de conexión a la base de datos (se asume que exporta un pool/promesas)
// Middlewares de autenticación y autorización
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion'); // Importa middlewares para verificar token y rol admin

// Crear un nuevo pedido (con o sin autenticación)
router.post('/', async (req, res) => {
  const conexion = await db.getConnection(); // Toma una conexión del pool (útil para transacciones y queries encadenadas)
  
  try {
    // Inicia una transacción para asegurar consistencia entre pedido, detalles y stock
    await conexion.beginTransaction(); // Comienza una transacción: si algo falla, se hará rollback
    
    const { productos, nombre, apellido, direccion_envio, telefono_contacto, notas } = req.body;
    // Extrae del body los datos esperados: lista de productos y datos del cliente
    
    // Validar que se proporcionen los datos mínimos requeridos
    if (!nombre || !apellido || !direccion_envio || !telefono_contacto) {
      throw new Error('Nombre, apellido, dirección y teléfono son requeridos');
      // Si falta algún dato obligatorio, lanza un error para que se haga rollback y devolver 500 más abajo
    }
    
    if (!productos || productos.length === 0) {
      throw new Error('Debe incluir al menos un producto');
      // Validación: no se permite crear pedidos sin items
    }
    
    // Calcular el total del pedido y validar stock de cada producto
    let total = 0; // Inicializa el acumulador del total
    for (const item of productos) {
      // Por cada item en la lista de productos solicitados:
      const [producto] = await conexion.query('SELECT precio, stock FROM productos WHERE id = ?', [item.producto_id]);
      // Consulta el precio y stock actual del producto en la BD (usa la misma conexión)
      
      if (producto.length === 0) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
        // Si no existe el producto en la BD, detener la operación
      }
      
      if (producto[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ${item.producto_id}`);
        // Si el stock es menor a la cantidad pedida, detener la operación
      }
      
      total += producto[0].precio * item.cantidad; // Acumula el subtotal del item al total
    }
    
    // Crear el registro del pedido con el total calculado
    // usuario_id puede ser NULL para compras sin autenticación
    const [pedido] = await conexion.query(
      'INSERT INTO pedidos (usuario_id, total, nombre_cliente, apellido_cliente, direccion_envio, telefono_contacto, notas) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [null, total, nombre, apellido, direccion_envio, telefono_contacto || null, notas || null]
    );
    // Inserta el pedido en la tabla 'pedidos'. Aquí usuario_id está como NULL (para compras de invitado).
    // El resultado (pedido) contendrá insertId y otros metadatos según el driver.

    // Crear detalles del pedido y actualizar el stock de cada producto
    for (const item of productos) {
      // Re-obtiene el precio (podría evitarse si se guardó antes, pero se consulta de nuevo para mayor seguridad)
      const [producto] = await conexion.query('SELECT precio FROM productos WHERE id = ?', [item.producto_id]);
      const precioUnitario = producto[0].precio; // Precio unitario actual
      const subtotal = precioUnitario * item.cantidad; // Calcula subtotal del detalle
      
      await conexion.query(
        'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [pedido.insertId, item.producto_id, item.cantidad, precioUnitario, subtotal]
      );
      // Inserta un registro por cada producto en la tabla 'detalles_pedido' asociada al pedido recién creado
      
      await conexion.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
      // Actualiza el stock del producto restando la cantidad comprada.
      // IMPORTANTE: esta resta se hace dentro de la misma transacción para evitar condiciones de carrera.
    }
    
    // Confirma la transacción si todo salió bien
    await conexion.commit(); // Hace commit de la transacción: todos los cambios son persistidos
    res.status(201).json({ mensaje: 'Pedido creado exitosamente', id: pedido.insertId, total });
    // Responde con 201 Created y devuelve el id del pedido y el total calculado
    
  } catch (error) {
    // Revierte la transacción ante cualquier error
    await conexion.rollback(); // Si ocurre un error, se deshacen todos los cambios hechos en la transacción
    res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
    // Devuelve un error 500 con el mensaje para debugging/cliente
  } finally {
    // Libera la conexión al pool
    conexion.release(); // Muy importante: devolver la conexión al pool siempre, así haya ocurrido error o no
  }
});

// Obtener los pedidos del usuario autenticado (con detalles)
router.get('/mis-pedidos', verificarToken, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [req.usuario.id]
    );
    // Consulta todos los pedidos del usuario autenticado (req.usuario se establece en verificarToken)
    // Ordena por fecha de creación descendente (más recientes primero)
    
    // Obtener detalles de cada pedido (join para traer nombre e imagen del producto)
    for (let pedido of pedidos) {
      const [detalles] = await db.query(
        `SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen 
         FROM detalles_pedido dp 
         JOIN productos p ON dp.producto_id = p.id 
         WHERE dp.pedido_id = ?`,
        [pedido.id]
      );
      pedido.detalles = detalles; // Añade un array 'detalles' dentro de cada objeto pedido
    }
    
    res.json(pedidos); // Devuelve la lista de pedidos con sus detalles al cliente
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
});

// Obtener todos los pedidos  si el usuario es invitado con LEFT JOIN el usuario el null(requiere rol admin)
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email,
       p.nombre_cliente, p.apellido_cliente
       FROM pedidos p 
       LEFT JOIN usuarios u ON p.usuario_id = u.id 
       ORDER BY p.fecha_creacion DESC`
    );
    // Consulta todos los pedidos de la tabla. Usa LEFT JOIN para incluir info del usuario si existe.
    // Si el pedido fue de invitado (usuario_id = NULL), las columnas del usuario quedarán en NULL.
    res.json(pedidos); // Devuelve la lista completa (requiere role admin por el middleware)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
});

// Actualizar el estado de un pedido (requiere rol admin)
router.put('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body; // Nuevo estado enviado por el cliente (ej: 'pendiente', 'enviado', 'cancelado')
    const [resultado] = await db.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );
    // Ejecuta el update y resultado.affectedRows indica cuántas filas fueron modificadas
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      // Si no se modificó ninguna fila, el id no existe -> 404
    }
    
    res.json({ mensaje: 'Estado del pedido actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
  }
});

// Eliminar un pedido (requiere rol admin)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [resultado] = await db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
    // Ejecuta delete en la tabla pedidos
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
      // Si no se eliminó ninguna fila, el id no existe -> 404
    }
    
    res.json({ mensaje: 'Pedido eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar pedido', error: error.message });
  }
});

// Exporta el router para montarlo bajo /api/pedidos
module.exports = router; // Permite que este router sea importado y usado en el archivo principal (ej: app.js)
