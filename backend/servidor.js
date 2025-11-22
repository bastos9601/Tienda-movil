// Importa el framework Express para crear el servidor HTTP
const express = require('express');
// Importa CORS para permitir solicitudes desde otros orígenes (frontends móviles/web)
const cors = require('cors');
// Carga las variables de entorno desde el archivo .env (por ejemplo PUERTO, claves, etc.)
require('dotenv').config();

// Crea una instancia de la aplicación Express
const app = express();
// Define el puerto del servidor, usando la variable de entorno o 3000 por defecto
const PUERTO = process.env.PUERTO || 3000;

// ===== Middlewares =====
// Habilita CORS para que la API pueda ser consumida desde otros dominios
app.use(cors());
// Parseo de cuerpos en JSON para las solicitudes con contenido application/json
// Aumenta el límite a 10MB para permitir subida de imágenes en base64
app.use(express.json({ limit: '10mb' }));
// Parseo de cuerpos para formularios (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Sirve archivos estáticos (imágenes u otros) desde la carpeta 'subidas' bajo la ruta /subidas
app.use('/subidas', express.static('subidas'));

// ===== Rutas de la API =====
// Endpoints para gestionar productos (listar, crear, actualizar, eliminar)
app.use('/api/productos', require('./rutas/productos'));
// Endpoints para gestionar categorías de productos
app.use('/api/categorias', require('./rutas/categorias'));
// Endpoints para usuarios (registro, perfil, etc.)
app.use('/api/usuarios', require('./rutas/usuarios'));
// Endpoints para pedidos (creación, listado, estados)
app.use('/api/pedidos', require('./rutas/pedidos'));
// Endpoints de autenticación (login, verificación de token)
app.use('/api/auth', require('./rutas/auth'));
// Endpoints para importar datos masivos
app.use('/api/importar', require('./rutas/importar'));

// Ruta raíz de prueba para verificar que el servidor esté operativo
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Tienda Virtual funcionando correctamente' });
});

// ===== Inicio del servidor =====
// Arranca el servidor HTTP escuchando en el puerto configurado
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
