import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import api from '../../configuracion/api';

export default function PantallaAdminFormularioProducto({ route, navigation }) {
  const { producto } = route.params || {};
  const esEdicion = !!producto;

  const [nombre, setNombre] = useState(producto?.nombre || '');
  const [descripcion, setDescripcion] = useState(producto?.descripcion || '');
  const [precio, setPrecio] = useState(producto?.precio?.toString() || '');
  const [precioAnterior, setPrecioAnterior] = useState(producto?.precio_anterior?.toString() || '');
  const [stock, setStock] = useState(producto?.stock?.toString() || '0');
  const [imagen, setImagen] = useState(producto?.imagen || '');
  const [categoriaId, setCategoriaId] = useState(producto?.categoria_id || null);
  const [destacado, setDestacado] = useState(producto?.destacado || false);
  const [activo, setActivo] = useState(producto?.activo !== undefined ? producto.activo : true);
  const [categorias, setCategorias] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const respuesta = await api.get('/categorias');
      setCategorias(respuesta.data);
      if (!categoriaId && respuesta.data.length > 0) {
        setCategoriaId(respuesta.data[0].id);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    }
  };

  const seleccionarImagen = async () => {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para subir imágenes');
        return;
      }

      // Abrir selector de imágenes
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!resultado.canceled) {
        subirImagen(resultado.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const tomarFoto = async () => {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar fotos');
        return;
      }

      // Abrir cámara
      const resultado = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!resultado.canceled) {
        subirImagen(resultado.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const subirImagen = async (imagenData) => {
    setSubiendoImagen(true);
    try {
      // Comprimir y redimensionar la imagen
      const imagenComprimida = await manipulateAsync(
        imagenData.uri,
        [{ resize: { width: 800 } }], // Redimensiona a máximo 800px de ancho
        { compress: 0.6, format: SaveFormat.JPEG } // Comprime al 60%
      );

      // Leer la imagen comprimida como base64
      const response = await fetch(imagenComprimida.uri);
      const blob = await response.blob();
      
      // Convertir blob a base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result;
          
          const respuesta = await api.post('/productos/subir-imagen', {
            imagen: base64data
          });

          setImagen(respuesta.data.url);
          Alert.alert('Éxito', 'Imagen subida correctamente');
        } catch (error) {
          console.error('Error al subir imagen:', error);
          Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo subir la imagen');
        } finally {
          setSubiendoImagen(false);
        }
      };
      
      reader.onerror = () => {
        Alert.alert('Error', 'No se pudo leer la imagen');
        setSubiendoImagen(false);
      };
    } catch (error) {
      console.error('Error al procesar imagen:', error);
      Alert.alert('Error', 'No se pudo procesar la imagen');
      setSubiendoImagen(false);
    }
  };

  const mostrarOpcionesImagen = () => {
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        { text: 'Tomar foto', onPress: tomarFoto },
        { text: 'Elegir de galería', onPress: seleccionarImagen },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const guardarProducto = async () => {
    if (!nombre || !precio || !categoriaId) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    setGuardando(true);
    try {
      const datos = {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        precio_anterior: precioAnterior ? parseFloat(precioAnterior) : null,
        stock: parseInt(stock),
        imagen,
        categoria_id: categoriaId,
        destacado,
        activo
      };

      if (esEdicion) {
        await api.put(`/productos/${producto.id}`, datos);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        await api.post('/productos', datos);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.mensaje || 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.formulario}>
        <Text style={estilos.titulo}>{esEdicion ? 'Editar Producto' : 'Nuevo Producto'}</Text>

        <Text style={estilos.etiqueta}>Nombre *</Text>
        <TextInput
          style={estilos.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Nombre del producto"
        />

        <Text style={estilos.etiqueta}>Descripción</Text>
        <TextInput
          style={[estilos.input, estilos.inputMultilinea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción del producto"
          multiline
          numberOfLines={4}
        />

        <Text style={estilos.etiqueta}>Categoría *</Text>
        <View style={estilos.pickerContenedor}>
          <Picker
            selectedValue={categoriaId}
            onValueChange={setCategoriaId}
            style={estilos.picker}
          >
            {categorias.map(cat => (
              <Picker.Item key={cat.id} label={cat.nombre} value={cat.id} />
            ))}
          </Picker>
        </View>

        <View style={estilos.fila}>
          <View style={estilos.columna}>
            <Text style={estilos.etiqueta}>Precio *</Text>
            <TextInput
              style={estilos.input}
              value={precio}
              onChangeText={setPrecio}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={estilos.columna}>
            <Text style={estilos.etiqueta}>Precio anterior</Text>
            <TextInput
              style={estilos.input}
              value={precioAnterior}
              onChangeText={setPrecioAnterior}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={estilos.etiqueta}>Stock</Text>
        <TextInput
          style={estilos.input}
          value={stock}
          onChangeText={setStock}
          placeholder="0"
          keyboardType="number-pad"
        />

        <Text style={estilos.etiqueta}>Imagen del producto</Text>
        
        {imagen ? (
          <View style={estilos.imagenPreview}>
            <Image source={{ uri: imagen }} style={estilos.imagen} />
            <TouchableOpacity 
              style={estilos.botonCambiarImagen}
              onPress={mostrarOpcionesImagen}
              disabled={subiendoImagen}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={estilos.textoBotonImagen}>Cambiar imagen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={estilos.botonSubirImagen}
            onPress={mostrarOpcionesImagen}
            disabled={subiendoImagen}
          >
            {subiendoImagen ? (
              <ActivityIndicator color="#6366f1" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color="#6366f1" />
                <Text style={estilos.textoSubirImagen}>Subir imagen</Text>
                <Text style={estilos.textoSubirImagenSecundario}>Toca para seleccionar o tomar foto</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={estilos.switchContenedor}>
          <Text style={estilos.etiqueta}>Producto destacado</Text>
          <Switch
            value={destacado}
            onValueChange={setDestacado}
            trackColor={{ false: '#ccc', true: '#6366f1' }}
          />
        </View>

        <View style={estilos.switchContenedor}>
          <Text style={estilos.etiqueta}>Producto activo</Text>
          <Switch
            value={activo}
            onValueChange={setActivo}
            trackColor={{ false: '#ccc', true: '#6366f1' }}
          />
        </View>

        <TouchableOpacity 
          style={[estilos.botonGuardar, guardando && estilos.botonDeshabilitado]}
          onPress={guardarProducto}
          disabled={guardando}
        >
          <Text style={estilos.textoBoton}>
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar Producto' : 'Crear Producto'}
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
  pickerContenedor: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { height: 50 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  columna: { flex: 1, marginRight: 8 },
  switchContenedor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
  botonSubirImagen: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#6366f1', borderStyle: 'dashed', borderRadius: 12, padding: 40, alignItems: 'center', marginBottom: 16 },
  textoSubirImagen: { fontSize: 16, fontWeight: '600', color: '#6366f1', marginTop: 12 },
  textoSubirImagenSecundario: { fontSize: 12, color: '#999', marginTop: 4 },
  imagenPreview: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  imagen: { width: '100%', height: 200, resizeMode: 'cover' },
  botonCambiarImagen: { flexDirection: 'row', backgroundColor: '#6366f1', padding: 12, alignItems: 'center', justifyContent: 'center' },
  textoBotonImagen: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  botonGuardar: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  botonDeshabilitado: { backgroundColor: '#ccc' },
  textoBoton: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
