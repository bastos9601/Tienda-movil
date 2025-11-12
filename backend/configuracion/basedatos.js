const mysql = require('mysql2');
require('dotenv').config();

const conexion = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USUARIO,
  password: process.env.DB_CONTRASENA,
  database: process.env.DB_NOMBRE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promesaConexion = conexion.promise();

module.exports = promesaConexion;
