// Importa el SDK de Cloudinary (versión v2) para gestionar archivos multimedia
const cloudinary = require('cloudinary').v2;

// Configura las credenciales de Cloudinary usando variables de entorno
cloudinary.config({
  // Nombre de la nube (tu cuenta de Cloudinary)
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  // Clave pública para autenticación en la API
  api_key: process.env.CLOUDINARY_API_KEY,
  // Clave secreta para firmar operaciones seguras
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Exporta la instancia configurada para utilizarla en otros módulos
module.exports = cloudinary;
