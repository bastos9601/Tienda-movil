import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import api from '../../configuracion/api';

export default function PantallaAdminFormularioCategoria({ route, navigation }) {
  const { categoria } = route.params || {};
  const esEdicion = !!categoria;

  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || '');
  const [activo, setActivo] = useState(categoria?.activo !== undefined ? categoria.activo : true);
  const [guardando, setGuardando] = useState(false);

  const guardarCategoria = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo
      };

      if (esEdicion) {
        await api.put(`/categorias/${categoria.id}`, datos);
        Alert.alert('Éxito', 'Categoría actualizada correctamente');
      } else {
        await api.post('/categorias', datos);
        Alert.alert('Éxito', 'Categoría creada correctamente');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo guardar la categoría');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.formulario}>
        <Text style={estilos.titulo}>
          {esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
        </Text>

        <Text style={estilos.etiqueta}>Nombre *</Text>
        <TextInput
          style={estilos.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre de la categoría"
        />

        <Text style={estilos.etiqueta}>Descripción</Text>
        <TextInput
          style={[estilos.input, estilos.inputMultilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción de la categoría"
          multiline
          numberOfLines={4}
        />

        <View style={estilos.switchContenedor}>
          <Text style={estilos.etiqueta}>Categoría activa</Text>
          <Switch
            value={activo}
            onValueChange={setActivo}
            trackColor={{ false: '#ccc', true: '#6366f1' }}
          />
        </View>

        <TouchableOpacity 
          style={[estilos.botonGuardar, guardando && estilos.botonDeshabilitado]}
          onPress={guardarCategoria}
          disabled={guardando}
        >
          <Text style={estilos.textoBoton}>
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar Categoría' : 'Crear Categoría'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f5f5f5' },
  formulario: { padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  etiqueta: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  inputMultilinea: { height: 100, textAlignVertical: 'top' },
  switchContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
  botonGuardar: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  botonDeshabilitado: { backgroundColor: '#ccc' },
  textoBoton: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
