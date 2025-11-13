# 📚 DOCUMENTACIÓN COMPLETA - PANTALLAS FRONTEND

## ✅ Archivos Ya Comentados Línea por Línea:

1. ✅ **PantallaInicio.js** - Pantalla principal con lista de productos
2. ✅ **PantallaCarrito.js** - Carrito de compras y checkout

## 📝 Resumen de Pantallas Restantes:

### 3. PantallaDetalleProducto.js
**Propósito**: Muestra información detallada de un producto individual
**Funcionalidades**:
- Muestra imagen grande del producto
- Información completa (nombre, descripción, precio, stock)
- Controles de cantidad
- Botón para agregar al carrito
- Indicador de stock bajo
- Cálculo de descuento si hay precio anterior

**Flujo**:
1. Recibe el producto como parámetro de navegación
2. Usuario selecciona cantidad con botones +/-
3. Al presionar "Agregar al carrito", agrega el producto
4. Muestra alerta de confirmación con opción de ir al carrito

---

### 4. PantallaPerfil.js
**Propósito**: Muestra información del usuario y opciones de administración
**Funcionalidades**:
- Muestra datos del usuario (nombre, email, teléfono, dirección)
- Lista de pedidos recientes del usuario
- Botón de cerrar sesión
- Acceso al panel de administración (solo si rol = 'admin')
- Vista de invitado si no hay usuario logueado

**Flujo**:
1. Verifica si hay usuario logueado
2. Si no hay usuario, muestra vista de invitado con botón de login
3. Si hay usuario, muestra su información y pedidos
4. Si es admin, muestra botones para gestionar productos, categorías y pedidos

---

### 5. PantallaLogin.js
**Propósito**: Permite a los administradores iniciar sesión
**Funcionalidades**:
- Formulario de login (email y contraseña)
- Validación de campos
- Autenticación contra el backend
- Guarda token JWT en AsyncStorage
- Redirección automática tras login exitoso

**Flujo**:
1. Usuario ingresa email y contraseña
2. Al presionar "Iniciar Sesión", valida los campos
3. Envía credenciales al backend (POST /api/auth/login)
4. Si es exitoso, guarda token y datos del usuario
5. Navega de vuelta a la pantalla anterior

---

## 📁 Pantallas de Administración:

### 6. PantallaAdminProductos.js
**Propósito**: Lista todos los productos para gestión administrativa
**Funcionalidades**:
- Lista de productos con imagen, nombre, precio, stock
- Indicador de estado (activo/inactivo)
- Botón para editar producto
- Botón para eliminar producto (o agregar stock si stock = 0)
- Botón flotante para crear nuevo producto

---

### 7. PantallaAdminFormularioProducto.js
**Propósito**: Formulario para crear o editar productos
**Funcionalidades**:
- Campos: nombre, descripción, precio, precio anterior, stock, categoría
- Selector de imagen (galería o cámara)
- Subida de imagen a Cloudinary
- Toggle de producto destacado
- Toggle de producto activo
- Validación de campos
- Modo crear o editar según parámetros

---

### 8. PantallaAdminCategorias.js
**Propósito**: Lista todas las categorías para gestión
**Funcionalidades**:
- Lista de categorías con nombre y descripción
- Indicador de estado (activa/inactiva)
- Botón para activar/desactivar categoría (clickeable)
- Botón para editar categoría
- Botón para eliminar categoría
- Botón flotante para crear nueva categoría

---

### 9. PantallaAdminFormularioCategoria.js
**Propósito**: Formulario para crear o editar categorías
**Funcionalidades**:
- Campos: nombre, descripción
- Toggle de categoría activa
- Validación de campos
- Modo crear o editar según parámetros

---

### 10. PantallaAdminPedidos.js
**Propósito**: Lista y gestiona todos los pedidos
**Funcionalidades**:
- Lista de pedidos con información del cliente
- Detalles de productos en cada pedido
- Estado del pedido (pendiente, procesando, enviado, entregado, cancelado)
- Botón para cambiar estado del pedido
- Información de envío y contacto
- Total del pedido

---

### 11. PantallaImportarProductos.js
**Propósito**: Importa productos de prueba desde Fake Store API
**Funcionalidades**:
- Botón para importar productos
- Indicador de carga durante importación
- Muestra resultado (productos importados, omitidos)
- Crea categorías automáticamente si no existen
- No duplica productos existentes

---

## 🔄 Flujo General de la Aplicación:

```
App.js (Raíz)
├── AuthProvider (Contexto de autenticación)
│   └── CarritoProvider (Contexto del carrito)
│       └── NavigationContainer
│           └── Stack Navigator
│               ├── Bottom Tabs (Principal)
│               │   ├── PantallaInicio
│               │   ├── PantallaCarrito
│               │   └── PantallaPerfil
│               ├── PantallaDetalleProducto
│               ├── PantallaLogin
│               └── Pantallas Admin (solo si rol = 'admin')
│                   ├── PantallaAdminProductos
│                   ├── PantallaAdminFormularioProducto
│                   ├── PantallaAdminCategorias
│                   ├── PantallaAdminFormularioCategoria
│                   ├── PantallaAdminPedidos
│                   └── PantallaImportarProductos
```

---

## 📊 Patrones Comunes en Todas las Pantallas:

### 1. **Estructura de Estado**
```javascript
const [datos, setDatos] = useState([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState(null);
```

### 2. **Carga de Datos**
```javascript
useEffect(() => {
  cargarDatos();
}, []);

const cargarDatos = async () => {
  try {
    const respuesta = await api.get('/endpoint');
    setDatos(respuesta.data);
  } catch (error) {
    console.error(error);
  } finally {
    setCargando(false);
  }
};
```

### 3. **Renderizado Condicional**
```javascript
if (cargando) {
  return <ActivityIndicator />;
}

if (error) {
  return <Text>Error: {error}</Text>;
}

return <View>...</View>;
```

### 4. **Navegación**
```javascript
// Navegar a otra pantalla
navigation.navigate('NombrePantalla', { parametro: valor });

// Volver atrás
navigation.goBack();

// Reemplazar pantalla actual
navigation.replace('NombrePantalla');
```

### 5. **Uso de Contextos**
```javascript
// Carrito
const { items, agregarAlCarrito, eliminarDelCarrito } = useCarrito();

// Autenticación
const { usuario, login, cerrarSesion } = useAuth();
```

---

## 🎨 Convenciones de Estilos:

### Colores Principales:
- **Primario**: `#6366f1` (Morado/Azul)
- **Éxito**: `#10b981` (Verde)
- **Error**: `#ef4444` (Rojo)
- **Advertencia**: `#f59e0b` (Naranja)
- **Fondo**: `#f5f5f5` (Gris claro)
- **Texto**: `#333` (Gris oscuro)

### Espaciados Comunes:
- **Pequeño**: 8px
- **Mediano**: 12px
- **Grande**: 16px
- **Extra grande**: 20px

### Bordes Redondeados:
- **Pequeño**: 8px
- **Mediano**: 12px
- **Grande**: 20px
- **Circular**: 50% (borderRadius = width/2)

---

## 🔐 Seguridad y Validaciones:

### Validaciones Comunes:
1. **Campos requeridos**: Verificar que no estén vacíos
2. **Email**: Formato válido
3. **Números**: Valores positivos
4. **Stock**: No permitir valores negativos
5. **Precios**: Mayores a 0

### Manejo de Errores:
```javascript
try {
  await api.post('/endpoint', datos);
  Alert.alert('Éxito', 'Operación completada');
} catch (error) {
  Alert.alert('Error', error.response?.data?.mensaje || 'Error desconocido');
}
```

---

## 📱 Optimizaciones de Rendimiento:

1. **FlatList**: Usa `keyExtractor` y `renderItem` optimizados
2. **Imágenes**: Usa placeholders mientras cargan
3. **Contextos**: Solo re-renderiza componentes que usan el contexto
4. **useEffect**: Limpia listeners en el cleanup
5. **AsyncStorage**: Carga datos en paralelo cuando es posible

---

## 🚀 Próximos Pasos para Mejorar:

1. Agregar paginación en listas largas
2. Implementar caché de imágenes
3. Agregar modo offline
4. Implementar notificaciones push
5. Agregar animaciones de transición
6. Implementar modo oscuro
7. Agregar tests unitarios
8. Mejorar accesibilidad (a11y)

---

**Nota**: Todos los archivos principales (App.js, PantallaInicio.js, PantallaCarrito.js) 
ya están completamente comentados línea por línea en el código fuente.
