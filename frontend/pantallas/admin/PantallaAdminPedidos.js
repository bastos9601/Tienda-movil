import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../../configuracion/api';

export default function PantallaAdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const respuesta = await api.get('/pedidos');
      setPedidos(respuesta.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    } finally {
      setCargando(false);
    }
  };

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado });
      Alert.alert('Éxito', 'Estado actualizado correctamente');
      cargarPedidos();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const confirmarEliminar = (pedido) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar el Pedido #${pedido.id}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarPedido(pedido.id) }
      ]
    );
  };

  const eliminarPedido = async (pedidoId) => {
    try {
      await api.delete(`/pedidos/${pedidoId}`);
      Alert.alert('Éxito', 'Pedido eliminado correctamente');
      cargarPedidos();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo eliminar el pedido');
    }
  };

  const obtenerColorEstado = (estado) => {
    const colores = {
      pendiente: '#f59e0b',
      procesando: '#3b82f6',
      enviado: '#8b5cf6',
      entregado: '#10b981',
      cancelado: '#ef4444'
    };
    return colores[estado] || '#666';
  };

  const renderPedido = ({ item }) => (
    <View style={estilos.tarjetaPedido}>
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.idPedido}>Pedido #{item.id}</Text>
          {item.nombre_cliente && item.apellido_cliente && (
            <Text style={estilos.cliente}>{item.nombre_cliente} {item.apellido_cliente}</Text>
          )}
          <Text style={estilos.email}>{item.usuario_email}</Text>
        </View>
        <View style={[estilos.etiquetaEstado, { backgroundColor: obtenerColorEstado(item.estado) }]}>
          <Text style={estilos.textoEstado}>{item.estado}</Text>
        </View>
      </View>

      <View style={estilos.separador} />

      <View style={estilos.infoItem}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={estilos.textoInfo}>
          {new Date(item.fecha_creacion).toLocaleString()}
        </Text>
      </View>

      <View style={estilos.infoItem}>
        <Ionicons name="location-outline" size={16} color="#666" />
        <Text style={estilos.textoInfo}>{item.direccion_envio}</Text>
      </View>

      {item.telefono_contacto && (
        <View style={estilos.infoItem}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <Text style={estilos.textoInfo}>{item.telefono_contacto}</Text>
        </View>
      )}

      <View style={estilos.totalContenedor}>
        <Text style={estilos.textoTotal}>Total:</Text>
        <Text style={estilos.montoTotal}>${item.total}</Text>
      </View>

      <Text style={estilos.etiquetaCambiarEstado}>Cambiar estado:</Text>
      <View style={estilos.pickerContenedor}>
        <Picker
          selectedValue={item.estado}
          onValueChange={(valor) => cambiarEstado(item.id, valor)}
          style={estilos.picker}
        >
          <Picker.Item label="Pendiente" value="pendiente" />
          <Picker.Item label="Procesando" value="procesando" />
          <Picker.Item label="Enviado" value="enviado" />
          <Picker.Item label="Entregado" value="entregado" />
          <Picker.Item label="Cancelado" value="cancelado" />
        </Picker>
      </View>

      <TouchableOpacity 
        style={estilos.botonEliminar}
        onPress={() => confirmarEliminar(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
        <Text style={estilos.textoBotonEliminar}>Eliminar pedido</Text>
      </TouchableOpacity>
    </View>
  );

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (pedidos.length === 0) {
    return (
      <View style={estilos.centrado}>
        <Ionicons name="receipt-outline" size={80} color="#ccc" />
        <Text style={estilos.textoVacio}>No hay pedidos aún</Text>
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPedido}
        contentContainerStyle={estilos.lista}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { padding: 16 },
  tarjetaPedido: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  idPedido: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  cliente: { fontSize: 16, color: '#666', marginBottom: 2 },
  email: { fontSize: 14, color: '#999' },
  etiquetaEstado: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  textoEstado: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  separador: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  textoInfo: { marginLeft: 8, fontSize: 14, color: '#666', flex: 1 },
  totalContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  textoTotal: { fontSize: 16, fontWeight: '600', color: '#333' },
  montoTotal: { fontSize: 24, fontWeight: 'bold', color: '#6366f1' },
  etiquetaCambiarEstado: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 8 },
  pickerContenedor: { backgroundColor: '#f5f5f5', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { height: 50 },
  botonEliminar: { flexDirection: 'row', backgroundColor: '#ef4444', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  textoBotonEliminar: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  textoVacio: { fontSize: 18, color: '#999', marginTop: 16 },
});
