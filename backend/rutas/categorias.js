/*
  Rutas para gestionar categorías del catálogo - Comentadas línea por línea
  Archivo: RutasCategoriasComentadas.js
  Descripción: este fichero exporta un router de Express que contiene
  endpoints CRUD para la entidad "categorías". Incluye middlewares de
  autenticación y autorización para operaciones administrativas.
*/

// Importa el framework Express (necesario para crear routers y manejar rutas)
const express = require('express');
// Crea un nuevo router de Express. Un router actúa como mini-app para agrupar rutas.
const router = express.Router();
// Conexión a la base de datos (se asume que '../configuracion/basedatos' exporta un pool o cliente con método query)
const db = require('../configuracion/basedatos');
// Importa middlewares que validan token y privilegios de administrador
const { verificarToken, verificarAdmin } = require('../middleware/autenticacion');

// =========================
// RUTA: GET /
// Obtener todas las categorías activas (acceso público)
// =========================
router.get('/', async (req, res) => {
  try {
    // Ejecuta una consulta para traer sólo las categorías activas y ordenarlas por nombre
    const [categorias] = await db.query('SELECT * FROM categorias WHERE activo = TRUE ORDER BY nombre');
    // Devuelve las categorías en formato JSON (HTTP 200 implícito)
    res.json(categorias);
  } catch (error) {
    // Si ocurre un error, responde con estado 500 y un mensaje de error
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
});

// =========================
// RUTA: GET /admin/todas
// Obtener todas las categorías incluyendo inactivas (requiere rol admin)
// =========================
// Aplica los middlewares verificarToken y verificarAdmin antes del handler
router.get('/admin/todas', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Consulta para traer todas las categorías sin filtrar por 'activo'
    const [categorias] = await db.query('SELECT * FROM categorias ORDER BY nombre');
    // Devuelve la lista completa
    res.json(categorias);
  } catch (error) {
    // En caso de error, responde con 500 y detalles
    res.status(500).json({ mensaje: 'Error al obtener categorías', error: error.message });
  }
});

// =========================
// RUTA: POST /
// Crear nueva categoría (requiere rol admin)
// =========================
router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Extrae los campos esperados desde el cuerpo de la petición
    const { nombre, descripcion, imagen } = req.body;
    // Inserta una nueva fila en la tabla categorias; si imagen es undefined usa null
    const [resultado] = await db.query(
      'INSERT INTO categorias (nombre, descripcion, imagen) VALUES (?, ?, ?)',
      [nombre, descripcion, imagen || null]
    );
    // Responde con 201 Created y devuelve el id de la nueva categoría
    res.status(201).json({ mensaje: 'Categoría creada exitosamente', id: resultado.insertId });
  } catch (error) {
    // Manejo de errores: 500 y mensaje
    res.status(500).json({ mensaje: 'Error al crear categoría', error: error.message });
  }
});

// =========================
// RUTA: PUT /:id
// Actualizar una categoría existente (requiere rol admin)
// =========================
router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Extrae campos que se desean actualizar
    const { nombre, descripcion, imagen, activo } = req.body;
    // Ejecuta el UPDATE con parámetros para evitar inyección SQL
    const [resultado] = await db.query(
      'UPDATE categorias SET nombre = ?, descripcion = ?, imagen = ?, activo = ? WHERE id = ?',
      [nombre, descripcion, imagen, activo, req.params.id]
    );
    // Si no se afectaron filas, significa que la categoría no existe (id inválido)
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    // Si todo fue bien, devuelve mensaje de éxito
    res.json({ mensaje: 'Categoría actualizada exitosamente' });
  } catch (error) {
    // En caso de error, responde con 500
    res.status(500).json({ mensaje: 'Error al actualizar categoría', error: error.message });
  }
});

// =========================
// RUTA: PATCH /:id/estado
// Activar/Desactivar una categoría (requiere rol admin)
// =========================
router.patch('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Lee sólo el campo 'activo' del body (true/false)
    const { activo } = req.body;
    // Actualiza únicamente el campo 'activo' para cambiar el estado
    const [resultado] = await db.query(
      'UPDATE categorias SET activo = ? WHERE id = ?',
      [activo, req.params.id]
    );
    // Si no se afectaron filas, la categoría no existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    // Mensaje dinámico según el nuevo estado
    res.json({ mensaje: `Categoría ${activo ? 'activada' : 'desactivada'} exitosamente` });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ mensaje: 'Error al cambiar estado de categoría', error: error.message });
  }
});

// =========================
// RUTA: DELETE /:id
// Eliminar una categoría (requiere rol admin)
// =========================
router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    // Ejecuta DELETE por id
    const [resultado] = await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
    // Si no se eliminaron filas significa que el id no existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    // Respuesta de éxito
    res.json({ mensaje: 'Categoría eliminada exitosamente' });
  } catch (error) {
    // Error genérico
    res.status(500).json({ mensaje: 'Error al eliminar categoría', error: error.message });
  }
});

// Exporta el router para montarlo en la app principal, por ejemplo bajo /api/categorias
module.exports = router;
