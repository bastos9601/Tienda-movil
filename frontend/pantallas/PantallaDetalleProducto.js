// ============================================================================
// PANTALLA: PantallaDetalleProducto
// ============================================================================
// Esta pantalla muestra información detallada de un producto individual.
// Permite seleccionar cantidad y agregar el producto al carrito.
// ============================================================================

// ============================================================================
// IMPORTACIONES DE REACT
// ============================================================================
// React: Librería principal
// useState: Hook para manejar el estado de la cantidad seleccionada
import React, { useState } from 'react';

// ============================================================================
// IMPORTACIONES DE REACT NATIVE
// ============================================================================
// View: Contenedor básico
// Text: Componente para mostrar texto
// Image: Componente para mostrar la imagen del producto
// TouchableOpacity: Botón táctil con efecto de opacidad
// StyleSheet: API para crear estilos
// ScrollView: Contenedor con scroll vertical (para contenido largo)
// Alert: API para mostrar alertas nativas
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

// ============================================================================
// IMPORTACIONES DE ICONOS
// ============================================================================
// Ionicons: Librería de iconos (cart, add, remove, checkmark, close, etc.)
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// IMPORTACIONES DE CONTEXTOS
// ============================================================================
// useCarrito: Hook para acceder al contexto del carrito
// Proporciona la función agregarAlCarrito
import { useCarrito } from '../contexto/CarritoContexto';

// ============================================================================
// COMPONENTE PRINCIPAL: PantallaDetalleProducto
// ============================================================================
// Props:
// - route: Objeto que contiene los parámetros de navegación (route.params.producto)
// - navigation: Objeto de React Navigation para navegar entre pantallas
export default function PantallaDetalleProducto({ route, navigation }) {
  
  // ==========================================================================
  // PARÁMETROS DE NAVEGACIÓN
  // ==========================================================================
  // Extrae el producto que fue pasado como parámetro desde la pantalla anterior
  // Ejemplo: navigation.navigate('DetalleProducto', { producto: item })
  const { producto } = route.params;
  
  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================
  // cantidad: Cantidad de unidades que el usuario quiere agregar al carrito
  // Valor inicial: 1
  const [cantidad, setCantidad] = useState(1);
  
  // ==========================================================================
  // CONTEXTO DEL CARRITO
  // ==========================================================================
  // agregarAlCarrito: Función del contexto para agregar productos al carrito
  const { agregarAlCarrito } = useCarrito();

  // ==========================================================================
  // FUNCIÓN: manejarAgregarCarrito
  // ==========================================================================
  // Agrega el producto al carrito con la cantidad seleccionada
  // Muestra una alerta de confirmación con opciones
  const manejarAgregarCarrito = () => {
    // Llama a la función del contexto para agregar el producto
    // Parámetros: (producto, cantidad)
    agregarAlCarrito(producto, cantidad);
    
    // Muestra una alerta nativa con título, mensaje y botones
    Alert.alert(
      'Producto agregado', // Título de la alerta
      // Mensaje dinámico que muestra la cantidad y el nombre del producto
      // Usa operador ternario para pluralizar "unidad" o "unidades"
      `${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} agregadas al carrito`,
      [
        // Botón "Seguir comprando" - Cierra la alerta y permanece en la pantalla
        { 
          text: 'Seguir comprando', 
          style: 'cancel' // Estilo de cancelación (iOS lo muestra diferente)
        },
        // Botón "Ir al carrito" - Navega a la pestaña del carrito
        { 
          text: 'Ir al carrito', 
          onPress: () => navigation.navigate('TabsInicio', { screen: 'Carrito' })
          // navigation.navigate con screen: navega a una pestaña específica dentro de TabsInicio
        }
      ]
    );
  };

  // ==========================================================================
  // RENDERIZADO PRINCIPAL
  // ==========================================================================
  return (
    // ScrollView: Permite hacer scroll vertical si el contenido es largo
    <ScrollView style={estilos.contenedor}>
      
      {/* ====================================================================
          IMAGEN PRINCIPAL DEL PRODUCTO
          ==================================================================== */}
      <Image 
        // source: Fuente de la imagen (URL)
        // Si no hay imagen, usa un placeholder genérico
        source={{ uri: producto.imagen || 'https://via.placeholder.com/400' }} 
        style={estilos.imagen}
      />

      {/* ====================================================================
          ETIQUETA DE DESCUENTO (CONDICIONAL)
          ==================================================================== */}
      {/* Solo se muestra si el producto tiene precio_anterior (está en oferta) */}
      {producto.precio_anterior && (
        <View style={estilos.etiquetaDescuento}>
          <Text style={estilos.textoDescuento}>
            {/* Calcula el porcentaje de descuento */}
            {/* Fórmula: (1 - precio_actual / precio_anterior) * 100 */}
            {/* Math.round: Redondea al entero más cercano */}
            {Math.round((1 - producto.precio / producto.precio_anterior) * 100)}% OFF
          </Text>
        </View>
      )}

      {/* ====================================================================
          CONTENIDO PRINCIPAL
          ==================================================================== */}
      <View style={estilos.contenido}>
        
        {/* ==================================================================
            ENCABEZADO: CATEGORÍA Y STOCK BAJO
            ================================================================== */}
        <View style={estilos.encabezado}>
          {/* Etiqueta de categoría */}
          <View style={estilos.etiquetaCategoria}>
            <Text style={estilos.textoCategoria}>{producto.categoria_nombre}</Text>
          </View>
          
          {/* Advertencia de stock bajo (solo si stock < 10 y stock > 0) */}
          {producto.stock < 10 && producto.stock > 0 && (
            <Text style={estilos.textoStockBajo}>
              ¡Solo quedan {producto.stock}!
            </Text>
          )}
        </View>

        {/* ==================================================================
            NOMBRE DEL PRODUCTO
            ================================================================== */}
        <Text style={estilos.nombre}>{producto.nombre}</Text>

        {/* ==================================================================
            PRECIOS (ACTUAL Y ANTERIOR SI HAY DESCUENTO)
            ================================================================== */}
        <View style={estilos.contenedorPrecio}>
          {/* Precio anterior (tachado) - Solo si existe */}
          {producto.precio_anterior && (
            <Text style={estilos.precioAnterior}>S/{producto.precio_anterior}</Text>
          )}
          
          {/* Precio actual (grande y destacado) */}
          <Text style={estilos.precio}>S/{producto.precio}</Text>
        </View>

        {/* Línea separadora */}
        <View style={estilos.separador} />

        {/* ==================================================================
            SECCIÓN: DESCRIPCIÓN
            ================================================================== */}
        <Text style={estilos.tituloSeccion}>Descripción</Text>
        <Text style={estilos.descripcion}>
          {/* Muestra la descripción o un mensaje por defecto si no hay */}
          {producto.descripcion || 'Sin descripción disponible'}
        </Text>

        {/* Línea separadora */}
        <View style={estilos.separador} />

        {/* ==================================================================
            SECCIÓN: CONTROLES DE CANTIDAD
            ================================================================== */}
        <Text style={estilos.tituloSeccion}>Cantidad</Text>
        <View style={estilos.controlesCantidad}>
          
          {/* Botón para disminuir cantidad (-) */}
          <TouchableOpacity 
            style={estilos.botonCantidad}
            // Solo permite disminuir si la cantidad es mayor a 1
            // Usa && (AND lógico) para ejecutar solo si la condición es true
            onPress={() => cantidad > 1 && setCantidad(cantidad - 1)}
          >
            <Ionicons name="remove" size={24} color="#6366f1" />
          </TouchableOpacity>
          
          {/* Muestra la cantidad actual */}
          <Text style={estilos.textoCantidad}>{cantidad}</Text>
          
          {/* Botón para aumentar cantidad (+) */}
          <TouchableOpacity 
            style={estilos.botonCantidad}
            // Solo permite aumentar si la cantidad es menor al stock disponible
            onPress={() => cantidad < producto.stock && setCantidad(cantidad + 1)}
          >
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* ==================================================================
            INFORMACIÓN DE STOCK
            ================================================================== */}
        <View style={estilos.infoStock}>
          {/* Icono que cambia según el stock */}
          <Ionicons 
            // Si hay stock: checkmark-circle (✓), si no: close-circle (✗)
            name={producto.stock > 0 ? "checkmark-circle" : "close-circle"} 
            size={20} 
            // Color verde si hay stock, rojo si no hay
            color={producto.stock > 0 ? "#10b981" : "#ef4444"} 
          />
          
          {/* Texto que muestra el stock disponible o "Sin stock" */}
          <Text style={[
            estilos.textoStock, 
            // Aplica color dinámico según el stock
            { color: producto.stock > 0 ? "#10b981" : "#ef4444" }
          ]}>
            {/* Operador ternario para mostrar mensaje según stock */}
            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
          </Text>
        </View>
      </View>

      {/* ====================================================================
          FOOTER FIJO: BOTÓN DE AGREGAR AL CARRITO
          ==================================================================== */}
      {/* position: 'absolute' lo mantiene fijo en la parte inferior */}
      <View style={estilos.footer}>
        <TouchableOpacity 
          // Aplica estilos condicionales:
          // - Si no hay stock, aplica estilo de deshabilitado (gris)
          style={[
            estilos.botonAgregar, 
            producto.stock === 0 && estilos.botonDeshabilitado
          ]}
          onPress={manejarAgregarCarrito}  // Ejecuta la función al presionar
          disabled={producto.stock === 0}   // Deshabilita el botón si no hay stock
        >
          {/* Icono de carrito */}
          <Ionicons name="cart" size={24} color="#fff" />
          
          {/* Texto del botón (cambia según el stock) */}
          <Text style={estilos.textoBotonAgregar}>
            {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// ESTILOS DEL COMPONENTE
// ============================================================================
const estilos = StyleSheet.create({
  // contenedor: Estilo del ScrollView principal
  contenedor: { 
    flex: 1,                    // Ocupa todo el espacio disponible
    backgroundColor: '#fff'     // Fondo blanco
  },
  
  // imagen: Estilo de la imagen principal del producto
  imagen: { 
    width: '100%',              // Ancho completo de la pantalla
    height: 400,                // Alto fijo de 400px
    backgroundColor: '#f0f0f0'  // Fondo gris claro mientras carga
  },
  
  // etiquetaDescuento: Estilo de la etiqueta de descuento (flotante)
  etiquetaDescuento: { 
    position: 'absolute',       // Posición absoluta (flotante sobre la imagen)
    top: 16,                    // 16px desde arriba
    right: 16,                  // 16px desde la derecha
    backgroundColor: '#ef4444', // Fondo rojo
    paddingHorizontal: 16,      // Espaciado horizontal interno
    paddingVertical: 8,         // Espaciado vertical interno
    borderRadius: 20            // Bordes muy redondeados (píldora)
  },
  
  // textoDescuento: Estilo del texto "X% OFF"
  textoDescuento: { 
    color: '#fff',              // Texto blanco
    fontSize: 16,               // Tamaño mediano
    fontWeight: 'bold'          // Negrita
  },
  
  // contenido: Estilo del contenedor del contenido principal
  contenido: { 
    padding: 20                 // Espaciado interno de 20px
  },
  
  // encabezado: Estilo del contenedor de categoría y stock bajo
  encabezado: { 
    flexDirection: 'row',       // Elementos en fila (horizontal)
    justifyContent: 'space-between',  // Distribuye el espacio entre elementos
    alignItems: 'center',       // Centra verticalmente
    marginBottom: 12            // Margen inferior
  },
  
  // etiquetaCategoria: Estilo de la etiqueta de categoría
  etiquetaCategoria: { 
    backgroundColor: '#e0e7ff', // Fondo azul claro
    paddingHorizontal: 12,      // Espaciado horizontal interno
    paddingVertical: 6,         // Espaciado vertical interno
    borderRadius: 12            // Bordes redondeados
  },
  
  // textoCategoria: Estilo del texto de la categoría
  textoCategoria: { 
    color: '#6366f1',           // Color morado/azul
    fontWeight: '600'           // Semi-negrita
  },
  
  // textoStockBajo: Estilo del texto de advertencia de stock bajo
  textoStockBajo: { 
    color: '#f59e0b',           // Color naranja (advertencia)
    fontWeight: '600'           // Semi-negrita
  },
  
  // nombre: Estilo del nombre del producto
  nombre: { 
    fontSize: 28,               // Tamaño muy grande
    fontWeight: 'bold',         // Negrita
    color: '#333',              // Gris oscuro
    marginBottom: 12            // Margen inferior
  },
  
  // contenedorPrecio: Estilo del contenedor de precios
  contenedorPrecio: { 
    flexDirection: 'row',       // Elementos en fila
    alignItems: 'center',       // Centra verticalmente
    marginBottom: 20            // Margen inferior
  },
  
  // precioAnterior: Estilo del precio anterior (tachado)
  precioAnterior: { 
    fontSize: 20,               // Tamaño mediano
    color: '#999',              // Gris claro
    textDecorationLine: 'line-through',  // Línea tachada
    marginRight: 12             // Margen derecho
  },
  
  // precio: Estilo del precio actual
  precio: { 
    fontSize: 36,               // Tamaño muy grande
    fontWeight: 'bold',         // Negrita
    color: '#6366f1'            // Color morado/azul
  },
  
  // separador: Estilo de la línea separadora
  separador: { 
    height: 1,                  // Alto de 1px (línea delgada)
    backgroundColor: '#e0e0e0', // Color gris claro
    marginVertical: 20          // Margen vertical (arriba y abajo)
  },
  
  // tituloSeccion: Estilo de los títulos de sección
  tituloSeccion: { 
    fontSize: 20,               // Tamaño grande
    fontWeight: 'bold',         // Negrita
    color: '#333',              // Gris oscuro
    marginBottom: 12            // Margen inferior
  },
  
  // descripcion: Estilo del texto de descripción
  descripcion: { 
    fontSize: 16,               // Tamaño mediano
    color: '#666',              // Gris medio
    lineHeight: 24              // Altura de línea (espaciado entre líneas)
  },
  
  // controlesCantidad: Estilo del contenedor de controles de cantidad
  controlesCantidad: { 
    flexDirection: 'row',       // Elementos en fila
    alignItems: 'center',       // Centra verticalmente
    marginBottom: 16            // Margen inferior
  },
  
  // botonCantidad: Estilo de los botones + y -
  botonCantidad: { 
    width: 50,                  // Ancho fijo
    height: 50,                 // Alto fijo
    borderRadius: 25,           // Circular (radio = mitad del ancho)
    backgroundColor: '#f0f0f0', // Fondo gris claro
    justifyContent: 'center',   // Centra verticalmente
    alignItems: 'center'        // Centra horizontalmente
  },
  
  // textoCantidad: Estilo del número de cantidad
  textoCantidad: { 
    marginHorizontal: 24,       // Margen horizontal (izq y der)
    fontSize: 24,               // Tamaño grande
    fontWeight: 'bold'          // Negrita
  },
  
  // infoStock: Estilo del contenedor de información de stock
  infoStock: { 
    flexDirection: 'row',       // Elementos en fila
    alignItems: 'center',       // Centra verticalmente
    marginBottom: 80            // Margen inferior grande (espacio para el footer)
  },
  
  // textoStock: Estilo del texto de stock
  textoStock: { 
    marginLeft: 8,              // Margen izquierdo
    fontSize: 16,               // Tamaño mediano
    fontWeight: '600'           // Semi-negrita
  },
  
  // footer: Estilo del footer fijo en la parte inferior
  footer: { 
    position: 'absolute',       // Posición absoluta (fijo)
    bottom: 0,                  // Pegado al fondo
    left: 0,                    // Pegado a la izquierda
    right: 0,                   // Pegado a la derecha
    backgroundColor: '#fff',    // Fondo blanco
    padding: 16,                // Espaciado interno
    borderTopWidth: 1,          // Borde superior de 1px
    borderTopColor: '#e0e0e0'   // Color del borde gris claro
  },
  
  // botonAgregar: Estilo del botón "Agregar al carrito"
  botonAgregar: { 
    flexDirection: 'row',       // Elementos en fila (icono + texto)
    backgroundColor: '#6366f1', // Fondo morado/azul
    padding: 16,                // Espaciado interno
    borderRadius: 12,           // Bordes redondeados
    alignItems: 'center',       // Centra verticalmente
    justifyContent: 'center'    // Centra horizontalmente
  },
  
  // botonDeshabilitado: Estilo del botón cuando está deshabilitado
  botonDeshabilitado: { 
    backgroundColor: '#ccc'     // Fondo gris (indica deshabilitado)
  },
  
  // textoBotonAgregar: Estilo del texto del botón
  textoBotonAgregar: { 
    color: '#fff',              // Texto blanco
    fontSize: 18,               // Tamaño grande
    fontWeight: 'bold',         // Negrita
    marginLeft: 8               // Margen izquierdo (separación del icono)
  },
});
