import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TarjetaProducto({ producto, onPress, onAgregarCarrito }) {
  const sinStock = producto.stock === 0;

  return (
    <TouchableOpacity style={estilos.tarjetaProducto} onPress={onPress}>
      <Image
        source={{ uri: producto.imagen || 'https://via.placeholder.com/150' }}
        style={estilos.imagenProducto}
      />
      {sinStock && (
        <View style={estilos.etiquetaSinStock}>
          <Text style={estilos.textoSinStock}>SIN STOCK</Text>
        </View>
      )}
      {!sinStock && producto.precio_anterior && (
        <View style={estilos.etiquetaDescuento}>
          <Text style={estilos.textoDescuento}>OFERTA</Text>
        </View>
      )}
      <View style={estilos.infoProducto}>
        <Text style={estilos.nombreProducto} numberOfLines={2}>
          {producto.nombre}
        </Text>
        <Text style={estilos.categoriaProducto}>{producto.categoria_nombre}</Text>
        <View style={estilos.contenedorPrecio}>
          {producto.precio_anterior && (
            <Text style={estilos.precioAnterior}>S/{producto.precio_anterior}</Text>
          )}
          <Text style={estilos.precio}>S/{producto.precio}</Text>
        </View>
        <TouchableOpacity 
          style={[estilos.botonAgregar, sinStock && estilos.botonDeshabilitado]} 
          onPress={onAgregarCarrito}
          disabled={sinStock}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={estilos.textoBotonAgregar}>
            {sinStock ? 'Sin stock' : 'Agregar'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  tarjetaProducto: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    overflow: 'hidden',
    elevation: 2,
  },
  imagenProducto: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  etiquetaDescuento: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  textoDescuento: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  etiquetaSinStock: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#64748b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  textoSinStock: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoProducto: {
    padding: 12,
  },
  nombreProducto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoriaProducto: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  contenedorPrecio: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  precioAnterior: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  botonAgregar: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#cbd5e1',
  },
  textoBotonAgregar: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
});
