# 🛍️ Tienda VirtMóvil

Aplicación de comercio electrónico completa con React Native (Expo 54) y backend Node.js + MySQL.

## Características

### App Móvil (Cliente)
- 📱 Navegación por productos con filtros por categoría
- 🔍 Búsqueda de productos
- 🛒 Carrito de compras
- 💳 Simulación de compra
- 👤 Perfil de usuario
- 📦 Historial de pedidos

### Panel de Administración
- ➕ Crear, editar y eliminar productos (CRUD completo)
- 📊 Gestión de inventario
- 📋 Gestión de pedidos
- 🔄 Actualización de estados de pedidos

## Estructura del Proyecto

```
tienda-virtual/
├── backend/              # API REST con Node.js + Express
│   ├── configuracion/    # Configuración de BD y SQL
│   ├── middleware/       # Autenticación JWT
│   ├── rutas/           # Endpoints de la API
│   └── servidor.js      # Servidor principal
│
└── frontend/            # App móvil con React Native + Expo
    ├── configuracion/   # Configuración de API
    ├── contexto/        # Context API (Auth, Carrito)
    ├── pantallas/       # Pantallas de la app
    └── App.js          # Componente principal
```

## Instalación

### 1. Configurar Base de Datos (XAMPP)

1. Instala y abre XAMPP
2. Inicia los servicios de Apache y MySQL
3. Abre phpMyAdmin (http://localhost/phpmyadmin)
4. Importa el archivo `backend/configuracion/basedatos.sql`
5. Esto creará la base de datos y las tablas necesarias

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` basado en `.env.ejemplo`:
```bash
cp .env.ejemplo .env
```

Edita `.env` con tus credenciales de MySQL:
```
PUERTO=3000
DB_HOST=localhost
DB_USUARIO=root
DB_CONTRASENA=
DB_NOMBRE=tienda_virtual
JWT_SECRETO=tu_clave_secreta_cambiar_en_produccion
```

Inicia el servidor:
```bash
npm start
```

El servidor estará corriendo en http://localhost:3000

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

Si vas a probar en un dispositivo físico, edita `frontend/configuracion/api.js` y cambia la URL:
```javascript
const URL_BASE = 'http://TU_IP_LOCAL:3000/api';
// Ejemplo: 'http://192.168.1.100:3000/api'
```

Inicia la app:
```bash
npm start
```

Escanea el código QR con Expo Go (Android/iOS) o presiona:
- `a` para Android
- `i` para iOS
- `w` para web

## Credenciales de Prueba

### Usuario Administrador
- Email: admin@tienda.com
- Contraseña: admin123

### Usuario Cliente
Puedes crear uno nuevo desde la app usando el botón "Crear cuenta nueva"

## 🚀 Tecnologías Utilizadas

### Backend (API REST)

#### Core
- **Node.js** - Entorno de ejecución JavaScript del lado del servidor
- **Express.js** - Framework web minimalista y flexible para crear APIs REST
- **MySQL** - Base de datos relacional para almacenar productos, usuarios, pedidos
- **XAMPP** - Paquete que incluye Apache y MySQL para desarrollo local

#### Seguridad y Autenticación
- **JWT (jsonwebtoken)** - Tokens de autenticación para sesiones seguras
- **bcryptjs** - Encriptación de contraseñas con hash y salt
- **CORS** - Middleware para permitir peticiones desde el frontend móvil

#### Utilidades
- **dotenv** - Gestión de variables de entorno (.env)
- **mysql2** - Driver moderno de MySQL con soporte para Promises
- **axios** - Cliente HTTP para consumir APIs externas (Fake Store API)
- **cloudinary** - Servicio de almacenamiento y gestión de imágenes en la nube
- **multer** - Middleware para manejo de archivos multipart/form-data

#### Desarrollo
- **nodemon** - Reinicio automático del servidor en desarrollo

### Frontend (Aplicación Móvil)

#### Core
- **React Native** - Framework para crear apps móviles nativas con JavaScript
- **Expo 54** - Plataforma que simplifica el desarrollo React Native
  - Expo Go para testing en dispositivos reales
  - Expo CLI para gestión del proyecto
  - Acceso a APIs nativas sin configuración

#### Navegación
- **React Navigation v6** - Sistema de navegación completo
  - **Stack Navigator** - Navegación entre pantallas con historial
  - **Bottom Tab Navigator** - Barra de navegación inferior (Inicio, Carrito, Perfil)
  - Deep linking y navegación condicional

#### Gestión de Estado
- **Context API** - Estado global sin librerías externas
  - AuthContext: Autenticación y datos del usuario
  - CarritoContext: Gestión del carrito de compras
- **React Hooks** - useState, useEffect, useContext para lógica de componentes

#### Persistencia y Almacenamiento
- **AsyncStorage** - Almacenamiento local persistente
  - Guardar token de autenticación
  - Mantener sesión activa
  - Cache de datos del usuario

#### Comunicación con Backend
- **Axios** - Cliente HTTP para peticiones a la API
  - Interceptores para agregar tokens JWT
  - Manejo de errores centralizado
  - Configuración base de URL

#### UI/UX
- **React Native Components** - Componentes nativos (View, Text, Image, etc.)
- **Expo Vector Icons** - Iconos de Ionicons para interfaz
- **StyleSheet API** - Estilos optimizados para rendimiento
- **FlatList** - Listas virtualizadas de alto rendimiento
- **TouchableOpacity** - Componentes táctiles con feedback visual

#### Características Adicionales
- **Image Picker** - Selección de imágenes de galería/cámara
- **Alert API** - Diálogos nativos de confirmación
- **ActivityIndicator** - Indicadores de carga nativos
- **ScrollView** - Contenedores con scroll suave

### Arquitectura del Proyecto

#### Backend - Patrón MVC Simplificado
```
backend/
├── configuracion/     # Configuración de BD, Cloudinary
├── middleware/        # Autenticación JWT, verificación de roles
├── rutas/            # Controladores y rutas (productos, usuarios, etc.)
└── servidor.js       # Punto de entrada, configuración Express
```

#### Frontend - Arquitectura por Capas
```
frontend/
├── configuracion/    # Config de API, constantes
├── contexto/         # Context API (estado global)
├── componentes/      # Componentes reutilizables
├── pantallas/        # Pantallas de la app
│   ├── admin/       # Panel de administración
│   └── ...          # Pantallas públicas
└── App.js           # Navegación principal
```

### Flujo de Datos

1. **Usuario interactúa** → Componente React Native
2. **Componente llama** → Context API o API directamente
3. **Axios envía petición** → Backend Express con JWT
4. **Middleware verifica** → Token y permisos
5. **Controlador procesa** → Lógica de negocio
6. **MySQL consulta** → Base de datos
7. **Respuesta JSON** → Regresa al frontend
8. **Estado actualiza** → UI se re-renderiza

### Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ Autenticación JWT con expiración (24h)
- ✅ Middleware de verificación de roles (admin/usuario)
- ✅ Validación de tokens en cada petición protegida
- ✅ CORS configurado para permitir solo orígenes específicos
- ✅ Variables sensibles en .env (no en código)
- ✅ SQL preparado (previene inyección SQL)

## API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Obtener producto
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)

### Categorías
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría (admin)
- `PUT /api/categorias/:id` - Actualizar categoría (admin)
- `DELETE /api/categorias/:id` - Eliminar categoría (admin)

### Pedidos
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos/mis-pedidos` - Pedidos del usuario
- `GET /api/pedidos` - Todos los pedidos (admin)
- `PUT /api/pedidos/:id/estado` - Actualizar estado (admin)

### Usuario
- `GET /api/usuarios/perfil` - Obtener perfil
- `PUT /api/usuarios/perfil` - Actualizar perfil

## Notas Importantes

1. **XAMPP**: Asegúrate de que MySQL esté corriendo antes de iniciar el backend
2. **Dispositivo físico**: Cambia la URL en `api.js` a tu IP local
3. **Imágenes**: Las URLs de imágenes deben ser públicas o usar placeholders
4. **Producción**: Cambia el `JWT_SECRETO` antes de desplegar

## Próximas Mejoras

- [ ] Subida de imágenes real
- [ ] Pasarela de pago real
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Filtros avanzados
- [ ] Wishlist/Favoritos
- [ ] Reseñas y calificaciones

## Licencia

MIT
