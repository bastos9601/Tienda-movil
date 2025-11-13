// Importa el cliente MySQL2 para conectarse a la base de datos
const mysql = require('mysql2');
// Carga variables de entorno (host, usuario, contraseña, nombre BD)
require('dotenv').config();

// Crea un pool de conexiones para manejar múltiples solicitudes concurrentes
const conexion = mysql.createPool({
  // Dirección del servidor de base de datos
  host: process.env.DB_HOST,
  // Usuario de la base de datos
  user: process.env.DB_USUARIO,
  // Contraseña del usuario de base de datos
  password: process.env.DB_CONTRASENA,
  // Nombre de la base de datos
  database: process.env.DB_NOMBRE,
  // Espera por conexiones disponibles en lugar de fallar de inmediato
  waitForConnections: true,
  // Número máximo de conexiones simultáneas en el pool
  connectionLimit: 10,
  // Límite de la cola de solicitudes pendientes (0 = sin límite)
  queueLimit: 0
});

// Convierte el pool a una interfaz basada en promesas para usar async/await
const promesaConexion = conexion.promise();

// Exporta el pool de conexión basado en promesas
module.exports = promesaConexion;
