// Importa la librería JSON Web Token para firmar y verificar tokens de acceso
const jwt = require('jsonwebtoken');

// Middleware para verificar que la solicitud incluya un token válido (formato Bearer)
const verificarToken = (req, res, next) => {
  // Extrae el token del encabezado Authorization: 'Bearer <token>'
  const token = req.headers['authorization']?.split(' ')[1];

  // Si no hay token, se rechaza la solicitud
  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    // Verifica y decodifica el token usando el secreto JWT de las variables de entorno
    const decodificado = jwt.verify(token, process.env.JWT_SECRETO);
    // Adjunta la información del usuario decodificada al objeto req para uso posterior
    req.usuario = decodificado;
    // Continúa al siguiente middleware/controlador
    next();
  } catch (error) {
    // Si la verificación falla, se retorna error de autenticación
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

// Middleware para autorizar solo a usuarios con rol 'admin'
const verificarAdmin = (req, res, next) => {
  // Comprueba el rol del usuario decodificado en el token
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere rol de administrador' });
  }
  // Continúa si el rol es correcto
  next();
};

// Exporta los middlewares para usarlos en las rutas que lo requieran
module.exports = { verificarToken, verificarAdmin };
