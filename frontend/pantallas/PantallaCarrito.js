import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCarrito } from '../contexto/CarritoContexto';
import { useAuth } from '../contexto/AuthContexto';
import api from '../configuracion/api';

export default function PantallaCarrito() {
  const { items, eliminarDelCarrito, actualizarCantidad, obtenerTotal, vaciarCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [direccion, setDireccion] = useState(usuario?.direccion || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [procesando, setProcesando] = useState(false);

  const finalizarCompra = async () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de finalizar la compra');
      return;
    }

    if (!direccion.trim()) {
      Alert.alert('Dirección requerida', 'Por favor ingresa tu dirección de envío');
      return;
    }

    Alert.alert(
      'Confirmar compra',
      `Total: $${obtenerTotal().toFixed(2)}\n¿Deseas confirmar tu pedido?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setProcesando(true);
            try {
              const productos = items.map(item => ({
                producto_id: item.id,
                cantidad: item.cantidad
              }));

              await api.post('/pedidos', {
                productos,
                direccion_envio: direccion,
                telefono_contacto: telefono
              });

              Alert.alert('¡Éxito!', 'Tu pedido ha sido creado exitosamente');
              vaciarCarrito();
              setDireccion('');
              setTelefono('');
            } catch (error) {
              Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo procesar el pedido');
            } finally {
              setProcesando(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={estilos.itemCarrito}>
      <Image 
        source={{ uri: item.imagen || 'https://via.placeholder.com/80' }} 
        style={estilos.imagenItem}
      />
      <View style={estilos.infoItem}>
        <Text style={estilos.nombreItem}>{item.nombre}</Text>
        <Text style={estilos.precioItem}>S/{item.precio}</Text>
        <View style={estilos.controlesCantidad}>
          <TouchableOpacity 
            style={estilos.botonCantidad}
            onPress={() => actualizarCantidad(item.id, item.cantidad - 1)}
          >
            <Ionicons name="remove" size={20} color="#6366f1" />
          </TouchableOpacity>
          <Text style={estilos.textoCantidad}>{item.cantidad}</Text>
          <TouchableOpacity 
            style={estilos.botonCantidad}
            onPress={() => actualizarCantidad(item.id, item.cantidad + 1)}
          >
            <Ionicons name="add" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={estilos.contenedorDerecha}>
        <TouchableOpacity onPress={() => eliminarDelCarrito(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
        <Text style={estilos.subtotal}>S/{(item.precio * item.cantidad).toFixed(2)}</Text>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={estilos.carritoVacio}>
        <Ionicons name="cart-outline" size={100} color="#ccc" />
        <Text style={estilos.textoVacio}>Tu carrito está vacío</Text>
        <Text style={estilos.subtextoVacio}>Agrega productos para comenzar</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Mi Carrito</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={estilos.lista}
      />

      <View style={estilos.seccionCheckout}>
        <Text style={estilos.subtituloCheckout}>Información de envío</Text>
        <TextInput
          style={estilos.input}
          placeholder="Dirección de envío"
          value={direccion}
          onChangeText={setDireccion}
          multiline
        />
        <TextInput
          style={estilos.input}
          placeholder="Teléfono de contacto"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        <View style={estilos.resumen}>
          <Text style={estilos.textoTotal}>Total:</Text>
          <Text style={estilos.montoTotal}>S/{obtenerTotal().toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={[estilos.botonFinalizar, procesando && estilos.botonDeshabilitado]}
          onPress={finalizarCompra}
          disabled={procesando}
        >
          <Text style={estilos.textoBotonFinalizar}>
            {procesando ? 'Procesando...' : 'Finalizar Compra'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  encabezado: { backgroundColor: '#fff', padding: 16, paddingTop: 50 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  lista: { padding: 16 },
  itemCarrito: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  imagenItem: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  infoItem: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  nombreItem: { fontSize: 16, fontWeight: '600', color: '#333' },
  precioItem: { fontSize: 14, color: '#6366f1', fontWeight: '600' },
  controlesCantidad: { flexDirection: 'row', alignItems: 'center' },
  botonCantidad: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  textoCantidad: { marginHorizontal: 12, fontSize: 16, fontWeight: '600' },
  contenedorDerecha: { alignItems: 'flex-end', justifyContent: 'space-between' },
  subtotal: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  seccionCheckout: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5 },
  subtituloCheckout: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  resumen: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  textoTotal: { fontSize: 20, fontWeight: '600', color: '#333' },
  montoTotal: { fontSize: 28, fontWeight: 'bold', color: '#6366f1' },
  botonFinalizar: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center' },
  botonDeshabilitado: { backgroundColor: '#ccc' },
  textoBotonFinalizar: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  carritoVacio: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  textoVacio: { fontSize: 24, fontWeight: 'bold', color: '#666', marginTop: 16 },
  subtextoVacio: { fontSize: 16, color: '#999', marginTop: 8 },
});
