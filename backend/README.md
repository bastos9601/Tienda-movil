# Backend - Tienda Virtual

API REST para la aplicación de tienda virtual móvil.

## Instalación

```bash
npm install
```

## Configuración

1. Crea un archivo `.env` basado en `.env.ejemplo`
2. Configura las credenciales de tu base de datos MySQL
3. Importa el archivo `configuracion/basedatos.sql` en phpMyAdmin

## Ejecutar

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

## Estructura

```
backend/
├── configuracion/
│   ├── basedatos.js      # Conexión a MySQL
│   └── basedatos.sql     # Script de creación de BD
├── middleware/
│   └── autenticacion.js  # Middleware JWT
├── rutas/
│   ├── auth.js          # Login y registro
│   ├── productos.js     # CRUD de productos
│   ├── categorias.js    # CRUD de categorías
│   ├── pedidos.js       # Gestión de pedidos
│   └── usuarios.js      # Perfil de usuario
├── .env.ejemplo         # Plantilla de variables de entorno
├── .gitignore
├── package.json
└── servidor.js          # Punto de entrada
```

## Variables de Entorno

```
PUERTO=3000
DB_HOST=localhost
DB_USUARIO=root
DB_CONTRASENA=
DB_NOMBRE=tienda_virtual
JWT_SECRETO=tu_clave_secreta
```

## Dependencias

- express - Framework web
- mysql2 - Cliente MySQL
- cors - Habilitar CORS
- dotenv - Variables de entorno
- bcryptjs - Encriptación de contraseñas
- jsonwebtoken - Autenticación JWT
- multer - Subida de archivos (futuro)


api publica usada: https://fakestoreapi.com/
para importar productos al apk