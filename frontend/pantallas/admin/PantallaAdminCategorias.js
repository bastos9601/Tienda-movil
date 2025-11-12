import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../configuracion/api';

export default function PantallaAdminCategorias({ navigation }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarCategorias();
    });
    return unsubscribe;
  }, [navigation]);

  const cargarCategorias = async () => {
    try {
      const respuesta = await api.get('/categorias/admin/todas');
      setCategorias(respuesta.data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = (categoria) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar "${categoria.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarCategoria(categoria.id) }
      ]
    );
  };

  const eliminarCategoria = async (id) => {
    try {
      await api.delete(`/categorias/${id}`);
      Alert.alert('Éxito', 'Categoría eliminada correctamente');
      cargarCategorias();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo eliminar la categoría');
    }
  };

  const cambiarEstadoCategoria = async (id, estadoActual) => {
    try {
      await api.patch(`/categorias/${id}/estado`, { activo: !estadoActual });
      cargarCategorias();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo cambiar el estado de la categoría');
    }
  };

  const renderCategoria = ({ item }) => (
    <View style={estilos.tarjetaCategoria}>
      <View style={estilos.infoCategoria}>
        <Text style={estilos.nombreCategoria}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={estilos.descripcionCategoria} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        <TouchableOpacity 
          style={estilos.estadoContenedor}
          onPress={() => cambiarEstadoCategoria(item.id, item.activo)}
        >
          <View style={[estilos.estadoBadge, { backgroundColor: item.activo ? '#10b981' : '#ef4444' }]}>
            <Text style={estilos.estadoTexto}>{item.activo ? 'Activa' : 'Inactiva'}</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={estilos.acciones}>
        <TouchableOpacity
          style={estilos.botonAccion}
          onPress={() => navigation.navigate('AdminFormularioCategoria', { categoria: item })}
        >
          <Ionicons name="pencil" size={20} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity
          style={estilos.botonAccion}
          onPress={() => confirmarEliminar(item)}
        >
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        data={categorias}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCategoria}
        contentContainerStyle={estilos.lista}
        ListEmptyComponent={
          <View style={estilos.vacio}>
            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
            <Text style={estilos.textoVacio}>No hay categorías</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={estilos.botonFlotante}
        onPress={() => navigation.navigate('AdminFormularioCategoria')}
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
  tarjetaCategoria: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  infoCategoria: { flex: 1 },
  nombreCategoria: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  descripcionCategoria: { fontSize: 14, color: '#666', marginBottom: 8 },
  estadoContenedor: { flexDirection: 'row', marginTop: 4 },
  estadoBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  estadoTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
  acciones: { flexDirection: 'row', alignItems: 'center' },
  botonAccion: { padding: 8, marginLeft: 8 },
  vacio: { alignItems: 'center', marginTop: 60 },
  textoVacio: { fontSize: 16, color: '#999', marginTop: 16 },
  botonFlotante: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center', elevation: 5 },
});
