import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../configuracion/api';
import { useCarrito } from '../contexto/CarritoContexto';
import BarraBusqueda from '../componentes/BarraBusqueda';
import ListaCategorias from '../componentes/ListaCategorias';
import TarjetaProducto from '../componentes/TarjetaProducto';

export default function PantallaInicio({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarCategorias();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    cargarProductos();
  }, [categoriaSeleccionada, busqueda]);

  const cargarDatos = async () => {
    try {
      const [respProductos, respCategorias] = await Promise.all([
        api.get('/productos'),
        api.get('/categorias')
      ]);
      setProductos(respProductos.data);
      setCategorias(respCategorias.data);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const respuesta = await api.get('/categorias');
      setCategorias(respuesta.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const cargarProductos = async () => {
    try {
      const params = {};
      if (categoriaSeleccionada) params.categoria = categoriaSeleccionada;
      if (busqueda) params.busqueda = busqueda;
      
      const respuesta = await api.get('/productos', { params });
      setProductos(respuesta.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const manejarAgregarCarrito = (producto) => {
    agregarAlCarrito(producto);
    alert('Producto agregado al carrito');
  };

  const renderProducto = ({ item }) => (
    <TarjetaProducto
      producto={item}
      onPress={() => navigation.navigate('DetalleProducto', { producto: item })}
      onAgregarCarrito={() => manejarAgregarCarrito(item)}
    />
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
      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Tienda Virtual</Text>
        <BarraBusqueda busqueda={busqueda} onBusquedaChange={setBusqueda} />
      </View>

      <ListaCategorias
        categorias={categorias}
        categoriaSeleccionada={categoriaSeleccionada}
        onCategoriaSelect={setCategoriaSeleccionada}
      />

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProducto}
        numColumns={2}
        contentContainerStyle={estilos.listaProductos}
        columnWrapperStyle={estilos.fila}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  encabezado: { backgroundColor: '#fff', padding: 16, paddingTop: 50, elevation: 2 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  listaProductos: { padding: 8 },
  fila: { justifyContent: 'space-between' },
});
