// ============================================================================
// PANTALLA: PantallaCarrito
// ============================================================================
// Esta pantalla muestra los productos agregados al carrito, permite modificar
// cantidades, eliminar productos y finalizar la compra ingresando datos de envío.
// ============================================================================

// ============================================================================
// IMPORTACIONES DE REACT
// ============================================================================
// React: Librería principal
// useState: Hook para manejar estado local (dirección, teléfono, procesando)
import React, { useState } from 'react';

// ============================================================================
// IMPORTACIONES DE REACT NATIVE
// ============================================================================
// View: Contenedor básico
// Text: Componente para mostrar texto
// FlatList: Lista optimizada para renderizar items del carrito
// TouchableOpacity: Botón táctil con efecto de opacidad
// Image: Componente para mostrar imágenes de productos
// StyleSheet: API para crear estilos
// TextInput: Input de texto para dirección y teléfono
// Alert: API para mostrar alertas nativas del sistema
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Alert } from 'react-native';

// ============================================================================
// IMPORTACIONES DE ICONOS
// ============================================================================
// Ionicons: Librería de iconos (cart, trash, add, remove, etc.)
import { Ionicons } from '@expo/vector-icons';

// ============================================================================
// IMPORTACIONES DE CONTEXTOS
// ============================================================================
// useCarrito: Hook para acceder al contexto del carrito
// Proporciona: items, eliminarDelCarrito, actualizarCantidad, obtenerTotal, vaciarCarrito
import { useCarrito } from '../contexto/CarritoContexto';

// useAuth: Hook para acceder al contexto de autenticación
// Proporciona: usuario (con dirección y teléfono si está logueado)
import { useAuth } from '../contexto/AuthContexto';

// ============================================================================
// IMPORTACIONES DE CONFIGURACIÓN
// ============================================================================
// api: Instancia de axios para hacer peticiones al backend
import api from '../configuracion/api';

// ============================================================================
// COMPONENTE PRINCIPAL: PantallaCarrito
// ============================================================================
export default function PantallaCarrito() {
  
  // ==========================================================================
  // CONTEXTO DEL CARRITO
  // ==========================================================================
  // Desestructura las funciones y datos del contexto del carrito
  const { 
    items,                  // Array de productos en el carrito
    eliminarDelCarrito,     // Función para eliminar un producto
    actualizarCantidad,     // Función para cambiar la cantidad de un producto
    obtenerTotal,           // Función que calcula el total del carrito
    vaciarCarrito           // Función para limpiar todo el carrito
  } = useCarrito();
  
  // ==========================================================================
  // CONTEXTO DE AUTENTICACIÓN
  // ==========================================================================
  // Obtiene el usuario logueado (puede ser null si no hay sesión)
  const { usuario } = useAuth();
  
  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================
  // nombre: Nombre del cliente (siempre vacío, el cliente debe ingresarlo)
  const [nombre, setNombre] = useState('');
  
  // apellido: Apellido del cliente (siempre vacío, el cliente debe ingresarlo)
  const [apellido, setApellido] = useState('');
   
  // direccion: Dirección de envío (siempre vacía, el cliente debe ingresarla)
  const [direccion, setDireccion] = useState('');
  
  // telefono: Teléfono de contacto (siempre vacío, el cliente debe ingresarlo)
  const [telefono, setTelefono] = useState('');
  
  // procesando: Indica si se está procesando el pedido
  // true = deshabilita el botón y muestra "Procesando..."
  // false = botón habilitado y muestra "Finalizar Compra"
  const [procesando, setProcesando] = useState(false);

  // ==========================================================================
  // FUNCIÓN: finalizarCompra
  // ==========================================================================
  // Valida los datos, muestra confirmación y crea el pedido en el backend
  const finalizarCompra = async () => {
    // ========================================================================
    // VALIDACIÓN 1: Verificar que el carrito no esté vacío
    // ========================================================================
    if (items.length === 0) {
      // Muestra una alerta nativa con título y mensaje
      Alert.alert('Carrito vacío', 'Agrega productos antes de finalizar la compra');
      return; // Detiene la ejecución de la función
    }

    // ========================================================================
    // VALIDACIÓN 2: Verificar que se haya ingresado el nombre
    // ========================================================================
    if (!nombre.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa tu nombre');
      return;
    }

    // ========================================================================
    // VALIDACIÓN 3: Verificar que se haya ingresado el apellido
    // ========================================================================
    if (!apellido.trim()) {
      Alert.alert('Apellido requerido', 'Por favor ingresa tu apellido');
      return;
    }

    // ========================================================================
    // VALIDACIÓN 4: Verificar que se haya ingresado una dirección
    // ========================================================================
    // trim() elimina espacios en blanco al inicio y final
    if (!direccion.trim()) {
      Alert.alert('Dirección requerida', 'Por favor ingresa tu dirección de envío');
      return;
    }

    // ========================================================================
    // CONFIRMACIÓN: Mostrar diálogo de confirmación
    // ========================================================================
    // Alert.alert con 3 parámetros: título, mensaje, array de botones
    Alert.alert(
      'Confirmar compra', // Título del diálogo
      `Total: ${obtenerTotal().toFixed(2)}\n¿Deseas confirmar tu pedido?`, // Mensaje
      [
        // Botón "Cancelar" - No hace nada, solo cierra el diálogo
        { 
          text: 'Cancelar', 
          style: 'cancel' // Estilo de cancelación (iOS lo muestra diferente)
        },
        // Botón "Confirmar" - Ejecuta la lógica de crear el pedido
        {
          text: 'Confirmar',
          onPress: async () => {
            // ==============================================================
            // INICIO DEL PROCESO DE COMPRA
            // ==============================================================
            // Activa el estado de procesando (deshabilita el botón)
            setProcesando(true);
            
            try {
              // ============================================================
              // PREPARAR DATOS DEL PEDIDO
              // ============================================================
              // Transforma el array de items del carrito al formato que espera el backend
              // De: [{ id, nombre, precio, cantidad, ... }]
              // A: [{ producto_id, cantidad }]
              const productos = items.map(item => ({
                producto_id: item.id,      // ID del producto
                cantidad: item.cantidad    // Cantidad a comprar
              }));

              // ============================================================
              // ENVIAR PEDIDO AL BACKEND
              // ============================================================
              // POST http://localhost:3000/api/pedidos
              // Body: { productos, nombre, apellido, direccion_envio, telefono_contacto }
              await api.post('/pedidos', {
                productos,                      // Array de productos
                nombre,                         // Nombre del cliente
                apellido,                       // Apellido del cliente
                direccion_envio: direccion,     // Dirección ingresada
                telefono_contacto: telefono     // Teléfono ingresado
              });

              // ============================================================
              // PEDIDO CREADO EXITOSAMENTE
              // ============================================================
              // Muestra alerta de éxito
              Alert.alert('¡Éxito!', 'Tu pedido ha sido creado exitosamente');
              
              // Limpia el carrito (elimina todos los productos)
              vaciarCarrito();
              
              // Limpia los campos del formulario
              setNombre('');
              setApellido('');
              setDireccion('');
              setTelefono('');
              
            } catch (error) {
              // ============================================================
              // ERROR AL CREAR EL PEDIDO
              // ============================================================
              // Muestra el mensaje de error del backend o un mensaje genérico
              Alert.alert(
                'Error', 
                error.response?.data?.mensaje || 'No se pudo procesar el pedido'
              );
              
            } finally {
              // ============================================================
              // FINALIZAR PROCESO
              // ============================================================
              // finally: Se ejecuta siempre, haya error o no
              // Desactiva el estado de procesando (habilita el botón)
              setProcesando(false);
            }
          }
        }
      ]
    );
  };

  // ==========================================================================
  // FUNCIÓN: renderItem
  // ==========================================================================
  // Renderiza cada producto del carrito en la FlatList
  // Parámetros:
  // - item: El producto actual del carrito
  const renderItem = ({ item }) => (
    // Contenedor de cada item del carrito
    <View style={estilos.itemCarrito}>
      
      {/* ====================================================================
          IMAGEN DEL PRODUCTO
          ==================================================================== */}
      <Image 
        // source: Fuente de la imagen (URL)
        // Si no hay imagen, usa un placeholder
        source={{ uri: item.imagen || 'https://via.placeholder.com/80' }} 
        style={estilos.imagenItem}
      />
      
      {/* ====================================================================
          INFORMACIÓN DEL PRODUCTO
          ==================================================================== */}
      <View style={estilos.infoItem}>
        {/* Nombre del producto */}
        <Text style={estilos.nombreItem}>{item.nombre}</Text>
        
        {/* Precio unitario */}
        <Text style={estilos.precioItem}>S/{item.precio}</Text>
        
        {/* Controles de cantidad (-, cantidad, +) */}
        <View style={estilos.controlesCantidad}>
          {/* Botón para disminuir cantidad */}
          <TouchableOpacity 
            style={estilos.botonCantidad}
            // Al presionar, disminuye la cantidad en 1
            // Si la cantidad llega a 0, el producto se elimina automáticamente
            onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
          >
            <Ionicons name="remove" size={20} color="#6366f1" />
          </TouchableOpacity>
          
          {/* Muestra la cantidad actual */}
          <Text style={estilos.textoCantidad}>{item.cantidad}</Text>
          
          {/* Botón para aumentar cantidad */}
          <TouchableOpacity 
            style={estilos.botonCantidad}
            // Al presionar, aumenta la cantidad en 1
            onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
          >
            <Ionicons name="add" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* ====================================================================
          SECCIÓN DERECHA: ELIMINAR Y SUBTOTAL
          ==================================================================== */}
      <View style={estilos.contenedorDerecha}>
        {/* Botón para eliminar el producto del carrito */}
        <TouchableOpacity onPress={() => eliminarDelCarrito(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
        
        {/* Subtotal del producto (precio * cantidad) */}
        {/* toFixed(2): Redondea a 2 decimales */}
        <Text style={estilos.subtotal}>
          S/{(item.precio * item.cantidad).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  // ==========================================================================
  // RENDERIZADO CONDICIONAL: CARRITO VACÍO
  // ==========================================================================
  // Si no hay items en el carrito, muestra un mensaje
  if (items.length === 0) {
    return (
      <View style={estilos.carritoVacio}>
        {/* Icono grande de carrito */}
        <Ionicons name="cart-outline" size={100} color="#ccc" />
        
        {/* Mensaje principal */}
        <Text style={estilos.textoVacio}>Tu carrito está vacío</Text>
        
        {/* Mensaje secundario */}
        <Text style={estilos.subtextoVacio}>Agrega productos para comenzar</Text>
      </View>
    );
  }

  // ==========================================================================
  // RENDERIZADO PRINCIPAL: CARRITO CON PRODUCTOS
  // ==========================================================================
  return (
    // Contenedor principal
    <View style={estilos.contenedor}>
      
      {/* ====================================================================
          ENCABEZADO
          ==================================================================== */}
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Mi Carrito</Text>
      </View>

      {/* ====================================================================
          LISTA DE PRODUCTOS EN EL CARRITO
          ==================================================================== */}
      <FlatList
        // data: Array de productos en el carrito
        data={items}
        
        // keyExtractor: Función que devuelve una key única para cada item
        keyExtractor={(item) => String(item.id)}
        
        // renderItem: Función que renderiza cada item
        renderItem={renderItem}
        
        // contentContainerStyle: Estilos del contenedor interno
        contentContainerStyle={estilos.lista}
      />

      {/* ====================================================================
          SECCIÓN DE CHECKOUT (INFORMACIÓN Y TOTAL)
          ==================================================================== */}
      <View style={estilos.seccionCheckout}>
        {/* Subtítulo de la sección */}
        <Text style={estilos.subtituloCheckout}>Información de envío</Text>
        
        {/* Input de nombre */}
        <TextInput
          style={estilos.input}
          placeholder="Nombre"
          value={nombre}
          onChangeText={setNombre}
        />
        
        {/* Input de apellido */}
        <TextInput
          style={estilos.input}
          placeholder="Apellido"
          value={apellido}
          onChangeText={setApellido}
        />
        
        {/* Input de dirección de envío */}
        <TextInput
          style={estilos.input}
          placeholder="Dirección de envío"  // Texto de ayuda
          value={direccion}                  // Valor actual (estado)
          onChangeText={setDireccion}        // Actualiza el estado al escribir
          multiline                          // Permite múltiples líneas
        />
        
        {/* Input de teléfono de contacto */}
        <TextInput
          style={estilos.input}
          placeholder="Teléfono de contacto"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"           // Teclado numérico para teléfonos
        />

        {/* Resumen del total */}
        <View style={estilos.resumen}>
          {/* Texto "Total:" */}
          <Text style={estilos.textoTotal}>Total:</Text>
          
          {/* Monto total calculado */}
          {/* obtenerTotal(): Suma todos los subtotales */}
          {/* toFixed(2): Redondea a 2 decimales */}
          <Text style={estilos.montoTotal}>
            S/{obtenerTotal().toFixed(2)}
          </Text>
        </View>

        {/* Botón para finalizar la compra */}
        <TouchableOpacity 
          // Aplica estilos condicionales:
          // - Si está procesando, aplica estilo de deshabilitado
          style={[
            estilos.botonFinalizar, 
            procesando && estilos.botonDeshabilitado
          ]}
          onPress={finalizarCompra}  // Ejecuta la función al presionar
          disabled={procesando}       // Deshabilita el botón si está procesando
        >
          {/* Texto del botón (cambia según el estado) */}
          <Text style={estilos.textoBotonFinalizar}>
            {procesando ? 'Procesando...' : 'Finalizar Compra'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// ESTILOS DEL COMPONENTE
// ============================================================================
const estilos = StyleSheet.create({
  // contenedor: Estilo del contenedor principal
  contenedor: { 
    flex: 1,                    // Ocupa todo el espacio disponible
    backgroundColor: '#f5f5f5'  // Fondo gris claro
  },
  
  // encabezado: Estilo del header con el título
  encabezado: { 
    backgroundColor: '#fff',    // Fondo blanco
    padding: 16,                // Espaciado interno
    paddingTop: 50              // Espaciado superior extra
  },
  
  // titulo: Estilo del texto "Mi Carrito"
  titulo: { 
    fontSize: 28,               // Tamaño grande
    fontWeight: 'bold',         // Negrita
    color: '#333'               // Gris oscuro
  },
  
  // lista: Estilo del contenedor de la FlatList
  lista: { 
    padding: 16                 // Espaciado interno
  },
  
  // itemCarrito: Estilo de cada tarjeta de producto
  itemCarrito: { 
    flexDirection: 'row',       // Elementos en fila (horizontal)
    backgroundColor: '#fff',    // Fondo blanco
    borderRadius: 12,           // Bordes redondeados
    padding: 12,                // Espaciado interno
    marginBottom: 12,           // Margen inferior
    elevation: 2                // Sombra en Android
  },
  
  // imagenItem: Estilo de la imagen del producto
  imagenItem: { 
    width: 80,                  // Ancho fijo
    height: 80,                 // Alto fijo
    borderRadius: 8,            // Bordes redondeados
    backgroundColor: '#f0f0f0'  // Fondo gris claro (mientras carga)
  },
  
  // infoItem: Estilo del contenedor de información del producto
  infoItem: { 
    flex: 1,                    // Ocupa el espacio disponible
    marginLeft: 12,             // Margen izquierdo
    justifyContent: 'space-between'  // Distribuye el espacio verticalmente
  },
  
  // nombreItem: Estilo del nombre del producto
  nombreItem: { 
    fontSize: 16,               // Tamaño mediano
    fontWeight: '600',          // Semi-negrita
    color: '#333'               // Gris oscuro
  },
  
  // precioItem: Estilo del precio unitario
  precioItem: { 
    fontSize: 14,               // Tamaño pequeño
    color: '#6366f1',           // Color morado/azul
    fontWeight: '600'           // Semi-negrita
  },
  
  // controlesCantidad: Estilo del contenedor de controles (-, cantidad, +)
  controlesCantidad: { 
    flexDirection: 'row',       // Elementos en fila
    alignItems: 'center'        // Centra verticalmente
  },
  
  // botonCantidad: Estilo de los botones + y -
  botonCantidad: { 
    width: 30,                  // Ancho fijo
    height: 30,                 // Alto fijo
    borderRadius: 15,           // Circular (radio = mitad del ancho)
    backgroundColor: '#f0f0f0', // Fondo gris claro
    justifyContent: 'center',   // Centra verticalmente
    alignItems: 'center'        // Centra horizontalmente
  },
  
  // textoCantidad: Estilo del número de cantidad
  textoCantidad: { 
    marginHorizontal: 12,       // Margen horizontal (izq y der)
    fontSize: 16,               // Tamaño mediano
    fontWeight: '600'           // Semi-negrita
  },
  
  // contenedorDerecha: Estilo del contenedor derecho (eliminar y subtotal)
  contenedorDerecha: { 
    alignItems: 'flex-end',     // Alinea a la derecha
    justifyContent: 'space-between'  // Distribuye el espacio verticalmente
  },
  
  // subtotal: Estilo del subtotal del producto
  subtotal: { 
    fontSize: 16,               // Tamaño mediano
    fontWeight: 'bold',         // Negrita
    color: '#333'               // Gris oscuro
  },
  
  // seccionCheckout: Estilo de la sección de checkout (parte inferior)
  seccionCheckout: { 
    backgroundColor: '#fff',    // Fondo blanco
    padding: 16,                // Espaciado interno
    borderTopLeftRadius: 20,    // Borde superior izquierdo redondeado
    borderTopRightRadius: 20,   // Borde superior derecho redondeado
    elevation: 5                // Sombra en Android
  },
  
  // subtituloCheckout: Estilo del subtítulo "Información de envío"
  subtituloCheckout: { 
    fontSize: 18,               // Tamaño mediano-grande
    fontWeight: '600',          // Semi-negrita
    marginBottom: 12            // Margen inferior
  },
  
  // input: Estilo de los inputs de texto
  input: { 
    backgroundColor: '#f5f5f5', // Fondo gris claro
    borderRadius: 8,            // Bordes redondeados
    padding: 12,                // Espaciado interno
    marginBottom: 12,           // Margen inferior
    fontSize: 16                // Tamaño de fuente
  },
  
  // resumen: Estilo del contenedor del resumen (Total: $XX.XX)
  resumen: { 
    flexDirection: 'row',       // Elementos en fila
    justifyContent: 'space-between',  // Distribuye el espacio horizontalmente
    alignItems: 'center',       // Centra verticalmente
    marginVertical: 16          // Margen vertical (arriba y abajo)
  },
  
  // textoTotal: Estilo del texto "Total:"
  textoTotal: { 
    fontSize: 20,               // Tamaño grande
    fontWeight: '600',          // Semi-negrita
    color: '#333'               // Gris oscuro
  },
  
  // montoTotal: Estilo del monto total
  montoTotal: { 
    fontSize: 28,               // Tamaño muy grande
    fontWeight: 'bold',         // Negrita
    color: '#6366f1'            // Color morado/azul
  },
  
  // botonFinalizar: Estilo del botón "Finalizar Compra"
  botonFinalizar: { 
    backgroundColor: '#6366f1', // Fondo morado/azul
    padding: 16,                // Espaciado interno
    borderRadius: 12,           // Bordes redondeados
    alignItems: 'center'        // Centra el texto
  },
  
  // botonDeshabilitado: Estilo del botón cuando está deshabilitado
  botonDeshabilitado: { 
    backgroundColor: '#ccc'     // Fondo gris (indica deshabilitado)
  },
  
  // textoBotonFinalizar: Estilo del texto del botón
  textoBotonFinalizar: { 
    color: '#fff',              // Texto blanco
    fontSize: 18,               // Tamaño grande
    fontWeight: 'bold'          // Negrita
  },
  
  // carritoVacio: Estilo del contenedor cuando el carrito está vacío
  carritoVacio: { 
    flex: 1,                    // Ocupa todo el espacio
    justifyContent: 'center',   // Centra verticalmente
    alignItems: 'center',       // Centra horizontalmente
    backgroundColor: '#f5f5f5'  // Fondo gris claro
  },
  
  // textoVacio: Estilo del texto principal cuando está vacío
  textoVacio: { 
    fontSize: 24,               // Tamaño grande
    fontWeight: 'bold',         // Negrita
    color: '#666',              // Gris medio
    marginTop: 16               // Margen superior
  },
  
  // subtextoVacio: Estilo del texto secundario cuando está vacío
  subtextoVacio: { 
    fontSize: 16,               // Tamaño mediano
    color: '#999',              // Gris claro
    marginTop: 8                // Margen superior
  },
});
