# Instrucciones de Instalación - Frontend

## Requisitos Previos

- Node.js instalado (versión 18 o superior)
- Backend corriendo en http://localhost:3000
- Expo Go instalado en tu teléfono (opcional, para probar en dispositivo físico)

## Paso 1: Instalar Dependencias

1. Abre una terminal en la carpeta `frontend`
2. Ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias.

## Paso 2: Configurar la URL de la API

### Si vas a probar en el EMULADOR o NAVEGADOR:
No necesitas cambiar nada, la configuración por defecto funciona.

### Si vas a probar en un DISPOSITIVO FÍSICO:
1. Abre el archivo `frontend/configuracion/api.js`
2. Encuentra tu IP local:
   - **Windows**: Abre CMD y ejecuta `ipconfig`, busca "Dirección IPv4"
   - **Mac/Linux**: Abre Terminal y ejecuta `ifconfig`, busca "inet"
3. Cambia la línea:
   ```javascript
   const URL_BASE = 'http://localhost:3000/api';
   ```
   Por:
   ```javascript
   const URL_BASE = 'http://TU_IP_LOCAL:3000/api';
   ```
   Ejemplo: `http://192.168.1.100:3000/api`

## Paso 3: Iniciar la Aplicación

En la terminal, dentro de la carpeta `frontend`, ejecuta:

```bash
npm start
```

Se abrirá Expo Dev Tools en tu navegador.

## Paso 4: Ejecutar la App

Tienes varias opciones:

### Opción 1: En el Navegador Web
- Presiona `w` en la terminal
- Se abrirá la app en tu navegador

### Opción 2: En Emulador Android
- Presiona `a` en la terminal
- Necesitas tener Android Studio instalado

### Opción 3: En Emulador iOS (solo Mac)
- Presiona `i` en la terminal
- Necesitas tener Xcode instalado

### Opción 4: En Dispositivo Físico
1. Instala "Expo Go" desde:
   - Google Play Store (Android)
   - App Store (iOS)
2. Escanea el código QR que aparece en la terminal con:
   - Android: La app Expo Go
   - iOS: La cámara del iPhone
3. La app se cargará en tu teléfono

## Paso 5: Probar la Aplicación

### Iniciar Sesión como Administrador:
- Email: `admin@tienda.com`
- Contraseña: `admin123`

Como admin podrás:
- Ver el panel de administración en el perfil
- Gestionar productos (crear, editar, eliminar)
- Gestionar pedidos

### Crear una Cuenta Nueva:
1. En la pantalla de login, toca "Crear cuenta nueva"
2. Completa el formulario
3. Inicia sesión con tu nueva cuenta

Como cliente podrás:
- Ver productos
- Agregar al carrito
- Realizar pedidos
- Ver tu historial de pedidos

## Solución de Problemas

### Error: "Network request failed"
- Verifica que el backend esté corriendo
- Si usas dispositivo físico, verifica que la IP en `api.js` sea correcta
- Asegúrate de que tu teléfono y computadora estén en la misma red WiFi

### Error: "Unable to resolve module"
- Ejecuta `npm install` nuevamente
- Limpia la caché: `npx expo start -c`

### La app se ve mal o no carga
- Cierra la app y vuelve a abrirla
- Reinicia el servidor de Expo: Presiona `r` en la terminal

### No aparece el código QR
- Presiona `shift + d` para mostrar el menú de desarrollo
- O ve a http://localhost:8081 en tu navegador

## Estructura de la App

```
Pantallas:
├── Login / Registro
└── Tabs Principales (después de login)
    ├── Inicio
    │   ├── Lista de productos
    │   ├── Búsqueda
    │   ├── Filtros por categoría
    │   └── Detalle de producto
    ├── Carrito
    │   ├── Lista de items
    │   ├── Modificar cantidades
    │   └── Finalizar compra
    └── Perfil
        ├── Información del usuario
        ├── Historial de pedidos
        └── Panel Admin (solo admin)
            ├── Gestión de productos
            └── Gestión de pedidos
```

## Características Principales

### Para Clientes:
- ✅ Ver catálogo de productos
- ✅ Buscar productos
- ✅ Filtrar por categoría
- ✅ Ver detalles del producto
- ✅ Agregar al carrito
- ✅ Modificar cantidades en el carrito
- ✅ Finalizar compra
- ✅ Ver historial de pedidos

### Para Administradores:
- ✅ Todo lo anterior +
- ✅ Crear nuevos productos
- ✅ Editar productos existentes
- ✅ Eliminar productos
- ✅ Ver todos los pedidos
- ✅ Cambiar estado de pedidos

## Próximos Pasos

Una vez que la app esté funcionando:
1. Explora las diferentes pantallas
2. Prueba agregar productos al carrito
3. Realiza una compra de prueba
4. Si eres admin, prueba el panel de administración

¡Disfruta tu tienda virtual! 🛒📱
