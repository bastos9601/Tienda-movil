const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PUERTO = process.env.PUERTO || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/subidas', express.static('subidas'));

// Rutas
app.use('/api/productos', require('./rutas/productos'));
app.use('/api/categorias', require('./rutas/categorias'));
app.use('/api/usuarios', require('./rutas/usuarios'));
app.use('/api/pedidos', require('./rutas/pedidos'));
app.use('/api/auth', require('./rutas/auth'));
app.use('/api/importar', require('./rutas/importar'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Tienda Virtual funcionando correctamente' });
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
