const bcrypt = require('bcryptjs');

const contrasena = 'admin123';
const hash = bcrypt.hashSync(contrasena, 10);

console.log('Contraseña:', contrasena);
console.log('Hash:', hash);
