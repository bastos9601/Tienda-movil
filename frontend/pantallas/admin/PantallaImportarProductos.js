import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../configuracion/api';

export default function PantallaImportarProductos({ navigation }) {
  const [importando, setImportando] = useState(false);

  const importarProductos = async () => {
    Alert.alert(
      'Confirmar importación',
      '¿Deseas importar productos de prueba desde Fake Store API? Esto no eliminará tus productos existentes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: async () => {
            try {
              setImportando(true);
              const respuesta = await api.post('/importar/productos-prueba');
              
              Alert.alert(
                'Importación exitosa',
                `✅ ${respuesta.data.productosImportados} productos importados\n` +
                `⏭️ ${respuesta.data.productosOmitidos} productos ya existían\n` +
                `📁 ${respuesta.data.categoriasCreadas} categorías procesadas`,
                [
                  { text: 'Ver productos', onPress: () => navigation.navigate('AdminProductos') }
                ]
              );
            } catch (error) {
              Alert.alert('Error', error.response?.data?.mensaje || 'No se pudieron importar los productos');
            } finally {
              setImportando(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.tarjeta}>
        <Ionicons name="cloud-download-outline" size={80} color="#6366f1" />
        <Text style={estilos.titulo}>Importar Productos de Prueba</Text>
        <Text style={estilos.descripcion}>
          Importa productos de ejemplo desde Fake Store API para probar tu aplicación.
        </Text>
        
        <View style={estilos.caracteristicas}>
          <View style={estilos.caracteristica}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={estilos.textoCaracteristica}>20 productos variados</Text>
          </View>
          <View style={estilos.caracteristica}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={estilos.textoCaracteristica}>4 categorías diferentes</Text>
          </View>
          <View style={estilos.caracteristica}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={estilos.textoCaracteristica}>Imágenes reales</Text>
          </View>
          <View style={estilos.caracteristica}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={estilos.textoCaracteristica}>No elimina productos existentes</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[estilos.botonImportar, importando && estilos.botonDeshabilitado]}
          onPress={importarProductos}
          disabled={importando}
        >
          {importando ? (
            <>
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
              <Text style={estilos.textoBoton}>Importando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="download" size={24} color="#fff" />
              <Text style={estilos.textoBoton}>Importar Productos</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={estilos.nota}>
          💡 Los productos duplicados serán omitidos automáticamente
        </Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  caracteristicas: {
    width: '100%',
    marginBottom: 24,
  },
  caracteristica: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textoCaracteristica: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  botonImportar: {
    flexDirection: 'row',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: '#cbd5e1',
  },
  textoBoton: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  nota: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
