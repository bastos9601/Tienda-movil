import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexto/AuthContexto';
import api from '../configuracion/api';

export default function PantallaPerfil({ navigation }) {
  const { usuario, cerrarSesion } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (usuario) {
      cargarPedidos();
    } else {
      setCargando(false);
    }
  }, [usuario]);

  const cargarPedidos = async () => {
    try {
      const respuesta = await api.get('/pedidos/mis-pedidos');
      setPedidos(respuesta.data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setCargando(false);
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

  // Si no hay usuario logueado, mostrar vista de invitado
  if (!usuario) {
    return (
      <ScrollView style={estilos.contenedor}>
        <View style={estilos.encabezado}>
          <View style={estilos.avatarContenedor}>
            <Ionicons name="storefront" size={50} color="#fff" />
          </View>
          <Text style={estilos.nombre}>Tienda Mobil</Text>
          <Text style={estilos.email}>Modo Cliente</Text>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Información</Text>
          <View style={estilos.tarjeta}>
            <Text style={estilos.textoInfoInvitado}>
              Estás navegando como cliente. Puedes ver productos y hacer pedidos sin necesidad de registrarte.
            </Text>
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Administración</Text>
          <TouchableOpacity 
            style={estilos.botonAdmin}
            onPress={() => navigation.navigate('Login')}
          >
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
            <Text style={estilos.textoBotonAdmin}>Acceso Administrador</Text>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <View style={estilos.avatarContenedor}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={estilos.nombre}>{usuario?.nombre}</Text>
        <Text style={estilos.email}>{usuario?.email}</Text>
        {usuario?.rol === 'admin' && (
          <View style={estilos.etiquetaAdmin}>
            <Text style={estilos.textoAdmin}>Administrador</Text>
          </View>
        )}
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Información</Text>
        <View style={estilos.tarjeta}>
          <View style={estilos.itemInfo}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={estilos.textoInfo}>{usuario?.telefono || '936185088'}</Text>
          </View>
          <View style={estilos.itemInfo}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={estilos.textoInfo}>{usuario?.direccion || 'AV .UNION 258'}</Text>
          </View>
        </View>
      </View>

      {usuario?.rol === 'admin' && (
        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Panel de Administración</Text>
          <TouchableOpacity 
            style={estilos.botonOpcion}
            onPress={() => navigation.navigate('AdminProductos')}
          >
            <Ionicons name="cube-outline" size={24} color="#6366f1" />
            <Text style={estilos.textoOpcion}>Gestionar Productos</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={estilos.botonOpcion}
            onPress={() => navigation.navigate('AdminCategorias')}
          >
            <Ionicons name="folder-outline" size={24} color="#6366f1" />
            <Text style={estilos.textoOpcion}>Gestionar Categorías</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={estilos.botonOpcion}
            onPress={() => navigation.navigate('AdminPedidos')}
          >
            <Ionicons name="receipt-outline" size={24} color="#6366f1" />
            <Text style={estilos.textoOpcion}>Gestionar Pedidos</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
          {/* <TouchableOpacity 
            style={estilos.botonOpcion}
            onPress={() => navigation.navigate('ImportarProductos')}
          >
            <Ionicons name="cloud-download-outline" size={24} color="#10b981" />
            <Text style={[estilos.textoOpcion, { color: '#10b981' }]}>Importar Productos de Prueba</Text>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity> */}
        </View>
      )}

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Mis Pedidos</Text>
        {cargando ? (
          <ActivityIndicator size="large" color="#6366f1" />
        ) : pedidos.length === 0 ? (
          <Text style={estilos.textoPedidosVacio}>No tienes pedidos aún</Text>
        ) : (
          pedidos.slice(0, 5).map((pedido) => (
            <View key={pedido.id} style={estilos.tarjetaPedido}>
              <View style={estilos.encabezadoPedido}>
                <Text style={estilos.idPedido}>Pedido #{pedido.id}</Text>
                <View style={[estilos.etiquetaEstado, { backgroundColor: obtenerColorEstado(pedido.estado) }]}>
                  <Text style={estilos.textoEstado}>{pedido.estado}</Text>
                </View>
              </View>
              <Text style={estilos.fechaPedido}>
                {new Date(pedido.fecha_creacion).toLocaleDateString()}
              </Text>
              <Text style={estilos.totalPedido}>Total: ${pedido.total}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={estilos.botonCerrarSesion} onPress={cerrarSesion}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={estilos.textoBotonCerrar}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  encabezado: { backgroundColor: '#6366f1', padding: 30, paddingTop: 60, alignItems: 'center' },
  avatarContenedor: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  nombre: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 16, color: '#e0e7ff' },
  etiquetaAdmin: { backgroundColor: '#fbbf24', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  textoAdmin: { color: '#fff', fontWeight: '600', fontSize: 12 },
  seccion: { padding: 16 },
  tituloSeccion: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  tarjeta: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  itemInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  textoInfo: { marginLeft: 12, fontSize: 16, color: '#666', flex: 1 },
  botonOpcion: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  textoOpcion: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#333' },
  tarjetaPedido: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  encabezadoPedido: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  idPedido: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  etiquetaEstado: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  textoEstado: { color: '#fff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  fechaPedido: { fontSize: 14, color: '#666', marginBottom: 4 },
  totalPedido: { fontSize: 16, fontWeight: 'bold', color: '#6366f1' },
  textoPedidosVacio: { textAlign: 'center', color: '#999', fontSize: 16, padding: 20 },
  botonCerrarSesion: { flexDirection: 'row', backgroundColor: '#ef4444', margin: 16, padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textoBotonCerrar: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  textoInfoInvitado: { fontSize: 15, color: '#666', lineHeight: 22 },
  botonAdmin: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366f1', padding: 16, borderRadius: 12, elevation: 2 },
  textoBotonAdmin: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '600', color: '#fff' },
});
