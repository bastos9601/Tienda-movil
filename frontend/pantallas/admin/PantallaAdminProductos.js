import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../configuracion/api';

export default function PantallaAdminProductos({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarProductos();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarProductos = async () => {
    try {
      const respuesta = await api.get('/productos');
      setProductos(respuesta.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  const eliminarProducto = (id, nombre) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/productos/${id}`);
              Alert.alert('Éxito', 'Producto eliminado');
              cargarProductos();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  const renderProducto = ({ item }) => {
    const sinStock = item.stock === 0;

    return (
      <View style={estilos.tarjetaProducto}>
        <Image 
          source={{ uri: item.imagen || 'https://via.placeholder.com/80' }} 
          style={estilos.imagen}
        />
        <View style={estilos.info}>
          <Text style={estilos.nombre} numberOfLines={1}>{item.nombre}</Text>
          <Text style={estilos.categoria}>{item.categoria_nombre}</Text>
          <Text style={estilos.precio}>S/{item.precio}</Text>
          <View style={estilos.etiquetas}>
            <View style={[estilos.etiqueta, { backgroundColor: item.activo ? '#10b981' : '#ef4444' }]}>
              <Text style={estilos.textoEtiqueta}>{item.activo ? 'Activo' : 'Inactivo'}</Text>
            </View>
            <View style={[estilos.etiqueta, { backgroundColor: sinStock ? '#ef4444' : '#64748b' }]}>
              <Text style={estilos.textoEtiqueta}>Stock: {item.stock}</Text>
            </View>
          </View>
        </View>
        <View style={estilos.acciones}>
          <TouchableOpacity 
            style={estilos.botonAccion}
            onPress={() => navigation.navigate('AdminFormularioProducto', { producto: item })}
          >
            <Ionicons name="create-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
          {sinStock ? (
            <TouchableOpacity 
              style={[estilos.botonAccion, estilos.botonAgregarStock]}
              onPress={() => navigation.navigate('AdminFormularioProducto', { producto: item })}
            >
              <Ionicons name="add-circle-outline" size={24} color="#f59e0b" />
              <Text style={estilos.textoAgregarStock}>Stock</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={estilos.botonAccion}
              onPress={() => eliminarProducto(item.id, item.nombre)}
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={estilos.centrado}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProducto}
        contentContainerStyle={estilos.lista}
      />
      <TouchableOpacity 
        style={estilos.botonAgregar}
        onPress={() => navigation.navigate('AdminFormularioProducto', {})}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista: { padding: 16 },
  tarjetaProducto: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  imagen: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  nombre: { fontSize: 16, fontWeight: '600', color: '#333' },
  categoria: { fontSize: 14, color: '#666' },
  precio: { fontSize: 18, fontWeight: 'bold', color: '#6366f1' },
  etiquetas: { flexDirection: 'row', alignItems: 'center' },
  etiqueta: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  textoEtiqueta: { color: '#fff', fontSize: 12, fontWeight: '600' },
  stock: { fontSize: 12, color: '#666' },
  acciones: { justifyContent: 'space-around', alignItems: 'center' },
  botonAccion: { padding: 8 },
  botonAgregarStock: { alignItems: 'center' },
  textoAgregarStock: { fontSize: 10, color: '#f59e0b', fontWeight: '600', marginTop: 2 },
  botonAgregar: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
