// Importa bcryptjs para generar hashes seguros de contraseñas
const bcrypt = require('bcryptjs');

// Define la contraseña en texto plano que quieres hashear (solo para demostración)
const contrasena = 'admin123';
// Genera el hash de la contraseña con un factor de costo (salt rounds) de 10
const hash = bcrypt.hashSync(contrasena, 10);

// Muestra por consola la contraseña original y su hash resultante
console.log('Contraseña:', contrasena);
console.log('Hash:', hash);
