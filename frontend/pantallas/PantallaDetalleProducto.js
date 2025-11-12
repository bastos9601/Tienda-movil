import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarrito } from '../contexto/CarritoContexto';

export default function PantallaDetalleProducto({ route, navigation }) {
  const { producto } = route.params;
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCarrito();

  const manejarAgregarCarrito = () => {
    agregarAlCarrito(producto, cantidad);
    Alert.alert(
      'Producto agregado',
      `${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre} agregadas al carrito`,
      [
        { text: 'Seguir comprando', style: 'cancel' },
        { text: 'Ir al carrito', onPress: () => navigation.navigate('TabsInicio', { screen: 'Carrito' }) }
      ]
    );
  };

  return (
    <ScrollView style={estilos.contenedor}>
      <Image 
        source={{ uri: producto.imagen || 'https://via.placeholder.com/400' }} 
        style={estilos.imagen}
      />

      {producto.precio_anterior && (
        <View style={estilos.etiquetaDescuento}>
          <Text style={estilos.textoDescuento}>
            {Math.round((1 - producto.precio / producto.precio_anterior) * 100)}% OFF
          </Text>
        </View>
      )}

      <View style={estilos.contenido}>
        <View style={estilos.encabezado}>
          <View style={estilos.etiquetaCategoria}>
            <Text style={estilos.textoCategoria}>{producto.categoria_nombre}</Text>
          </View>
          {producto.stock < 10 && producto.stock > 0 && (
            <Text style={estilos.textoStockBajo}>¡Solo quedan {producto.stock}!</Text>
          )}
        </View>

        <Text style={estilos.nombre}>{producto.nombre}</Text>

        <View style={estilos.contenedorPrecio}>
          {producto.precio_anterior && (
            <Text style={estilos.precioAnterior}>S/{producto.precio_anterior}</Text>
          )}
          <Text style={estilos.precio}>S/{producto.precio}</Text>
        </View>

        <View style={estilos.separador} />

        <Text style={estilos.tituloSeccion}>Descripción</Text>
        <Text style={estilos.descripcion}>
          {producto.descripcion || 'Sin descripción disponible'}
        </Text>

        <View style={estilos.separador} />

        <Text style={estilos.tituloSeccion}>Cantidad</Text>
        <View style={estilos.controlesCantidad}>
          <TouchableOpacity 
            style={estilos.botonCantidad}
            onPress={() => cantidad > 1 && setCantidad(cantidad - 1)}
          >
            <Ionicons name="remove" size={24} color="#6366f1" />
          </TouchableOpacity>
          <Text style={estilos.textoCantidad}>{cantidad}</Text>
          <TouchableOpacity 
            style={estilos.botonCantidad}
            onPress={() => cantidad < producto.stock && setCantidad(cantidad + 1)}
          >
            <Ionicons name="add" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <View style={estilos.infoStock}>
          <Ionicons 
            name={producto.stock > 0 ? "checkmark-circle" : "close-circle"} 
            size={20} 
            color={producto.stock > 0 ? "#10b981" : "#ef4444"} 
          />
          <Text style={[estilos.textoStock, { color: producto.stock > 0 ? "#10b981" : "#ef4444" }]}>
            {producto.stock > 0 ? `${producto.stock} disponibles` : 'Sin stock'}
          </Text>
        </View>
      </View>

      <View style={estilos.footer}>
        <TouchableOpacity 
          style={[estilos.botonAgregar, producto.stock === 0 && estilos.botonDeshabilitado]}
          onPress={manejarAgregarCarrito}
          disabled={producto.stock === 0}
        >
          <Ionicons name="cart" size={24} color="#fff" />
          <Text style={estilos.textoBotonAgregar}>
            {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#fff' },
  imagen: { width: '100%', height: 400, backgroundColor: '#f0f0f0' },
  etiquetaDescuento: { position: 'absolute', top: 16, right: 16, backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  textoDescuento: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  contenido: { padding: 20 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  etiquetaCategoria: { backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  textoCategoria: { color: '#6366f1', fontWeight: '600' },
  textoStockBajo: { color: '#f59e0b', fontWeight: '600' },
  nombre: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  contenedorPrecio: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  precioAnterior: { fontSize: 20, color: '#999', textDecorationLine: 'line-through', marginRight: 12 },
  precio: { fontSize: 36, fontWeight: 'bold', color: '#6366f1' },
  separador: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 20 },
  tituloSeccion: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  descripcion: { fontSize: 16, color: '#666', lineHeight: 24 },
  controlesCantidad: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  botonCantidad: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  textoCantidad: { marginHorizontal: 24, fontSize: 24, fontWeight: 'bold' },
  infoStock: { flexDirection: 'row', alignItems: 'center', marginBottom: 80 },
  textoStock: { marginLeft: 8, fontSize: 16, fontWeight: '600' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  botonAgregar: { flexDirection: 'row', backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  botonDeshabilitado: { backgroundColor: '#ccc' },
  textoBotonAgregar: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
});
