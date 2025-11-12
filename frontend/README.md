# Frontend - Tienda Virtual App

Aplicación móvil de tienda virtual desarrollada con React Native y Expo 54.

## Instalación

```bash
npm install
```

## Configuración

Si vas a probar en un dispositivo físico, edita `configuracion/api.js`:

```javascript
const URL_BASE = 'http://TU_IP_LOCAL:3000/api';
```

Para encontrar tu IP local:
- Windows: `ipconfig` en CMD
- Mac/Linux: `ifconfig` en Terminal

## Ejecutar

```bash
# Iniciar Expo
npm start

# Opciones:
# - Escanea el QR con Expo Go
# - Presiona 'a' para Android
# - Presiona 'i' para iOS
# - Presiona 'w' para web
```

## Estructura

```
frontend/
├── configuracion/
│   └── api.js              # Cliente Axios
├── contexto/
│   ├── AuthContexto.js     # Autenticación
│   └── CarritoContexto.js  # Carrito de compras
├── pantallas/
│   ├── admin/              # Pantallas de administración
│   │   ├── PantallaAdminProductos.js
│   │   ├── PantallaAdminFormularioProducto.js
│   │   └── PantallaAdminPedidos.js
│   ├── PantallaInicio.js
│   ├── PantallaCarrito.js
│   ├── PantallaPerfil.js
│   ├── PantallaLogin.js
│   ├── PantallaRegistro.js
│   └── PantallaDetalleProducto.js
├── app.json               # Configuración de Expo
├── App.js                 # Componente principal
└── package.json
```

## Características

### Pantallas Principales
- **Inicio**: Lista de productos con búsqueda y filtros
- **Carrito**: Gestión del carrito y checkout
- **Perfil**: Información del usuario y pedidos

### Panel Admin (solo usuarios admin)
- Gestión completa de productos (CRUD)
- Gestión de pedidos
- Actualización de estados

## Dependencias Principales

- expo ~54.0.0
- react-native 0.76.5
- @react-navigation/native - Navegación
- @react-navigation/bottom-tabs - Tabs inferiores
- @react-navigation/stack - Stack navigation
- axios - Peticiones HTTP
- @react-native-async-storage/async-storage - Almacenamiento local
- expo-linear-gradient - Gradientes

## Contextos

### AuthContexto
Maneja la autenticación del usuario:
- `login(email, contrasena)`
- `registro(datos)`
- `cerrarSesion()`
- `usuario` - Usuario actual

### CarritoContexto
Maneja el carrito de compras:
- `agregarAlCarrito(producto, cantidad)`
- `eliminarDelCarrito(productoId)`
- `actualizarCantidad(productoId, cantidad)`
- `vaciarCarrito()`
- `obtenerTotal()`
- `items` - Items del carrito

## Navegación

La app usa una combinación de Stack y Bottom Tab Navigation:

```
Stack Navigator
├── Login (si no hay usuario)
├── Registro
└── TabsInicio (si hay usuario)
    ├── Tab: Inicio
    ├── Tab: Carrito
    └── Tab: Perfil
```

## Credenciales de Prueba

Admin:
- Email: admin@tienda.com
- Contraseña: admin123
