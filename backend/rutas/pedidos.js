const express = require('express');
const router = express.Router();
const db = require('../configuracion/basedatos');
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

// Crear pedido
router.post('/', verificarToken, async (req, res) => {
  const conexion = await db.getConnection();
  
  try {
    await conexion.beginTransaction();
    
    const { productos, direccion_envio, telefono_contacto, notas } = req.body;
    
    // Calcular total
    let total = 0;
    for (const item of productos) {
      const [producto] = await conexion.query('SELECT precio, stock FROM productos WHERE id = ?', [item.producto_id]);
      
      if (producto.length === 0) {
        throw new Error(`Producto ${item.producto_id} no encontrado`);
      }
      
      if (producto[0].stock < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ${item.producto_id}`);
      }
      
      total += producto[0].precio * item.cantidad;
    }
    
    // Crear pedido
    const [pedido] = await conexion.query(
      'INSERT INTO pedidos (usuario_id, total, direccion_envio, telefono_contacto, notas) VALUES (?, ?, ?, ?, ?)',
      [req.usuario.id, total, direccion_envio, telefono_contacto || null, notas || null]
    );
    
    // Crear detalles y actualizar stock
    for (const item of productos) {
      const [producto] = await conexion.query('SELECT precio FROM productos WHERE id = ?', [item.producto_id]);
      const precioUnitario = producto[0].precio;
      const subtotal = precioUnitario * item.cantidad;
      
      await conexion.query(
        'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [pedido.insertId, item.producto_id, item.cantidad, precioUnitario, subtotal]
      );
      
      await conexion.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.producto_id]
      );
    }
    
    await conexion.commit();
    res.status(201).json({ mensaje: 'Pedido creado exitosamente', id: pedido.insertId, total });
    
  } catch (error) {
    await conexion.rollback();
    res.status(500).json({ mensaje: 'Error al crear pedido', error: error.message });
  } finally {
    conexion.release();
  }
});

// Obtener pedidos del usuario
router.get('/mis-pedidos', verificarToken, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      'SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
      [req.usuario.id]
    );
    
    // Obtener detalles de cada pedido
    for (let pedido of pedidos) {
      const [detalles] = await db.query(
        `SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen 
         FROM detalles_pedido dp 
         JOIN productos p ON dp.producto_id = p.id 
         WHERE dp.pedido_id = ?`,
        [pedido.id]
      );
      pedido.detalles = detalles;
    }
    
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
});

// Obtener todos los pedidos (solo admin)
router.get('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [pedidos] = await db.query(
      `SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email 
       FROM pedidos p 
       JOIN usuarios u ON p.usuario_id = u.id 
       ORDER BY p.fecha_creacion DESC`
    );
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pedidos', error: error.message });
  }
});

// Actualizar estado del pedido (solo admin)
router.put('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const [resultado] = await db.query(
      'UPDATE pedidos SET estado = ? WHERE id = ?',
      [estado, req.params.id]
    );
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    res.json({ mensaje: 'Estado del pedido actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar estado', error: error.message });
  }
});

// Eliminar pedido (solo admin)
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const [resultado] = await db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
    
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    res.json({ mensaje: 'Pedido eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar pedido', error: error.message });
  }
});

module.exports = router;
