import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexto/AuthContexto';

export default function PantallaLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();

  const manejarLogin = async () => {
    if (!email || !contrasena) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setCargando(true);
    const resultado = await login(email, contrasena);
    setCargando(false);

    if (!resultado.exito) {
      Alert.alert('Error', resultado.mensaje);
    } else {
      // Regresar a la pantalla anterior después del login exitoso
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={estilos.contenedor} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={estilos.gradiente}
      >
        <View style={estilos.encabezado}>
          <Ionicons name="shield-checkmark" size={80} color="#fff" />
          <Text style={estilos.titulo}>Acceso Administrador</Text>
          <Text style={estilos.subtitulo}>Panel de gestión</Text>
        </View>

        <View style={estilos.formulario}>
          <View style={estilos.inputContenedor}>
            <Ionicons name="mail-outline" size={20} color="#666" style={estilos.icono} />
            <TextInput
              style={estilos.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={estilos.inputContenedor}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={estilos.icono} />
            <TextInput
              style={estilos.input}
              placeholder="Contraseña"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry={!mostrarContrasena}
            />
            <TouchableOpacity onPress={() => setMostrarContrasena(!mostrarContrasena)}>
              <Ionicons 
                name={mostrarContrasena ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[estilos.botonLogin, cargando && estilos.botonDeshabilitado]}
            onPress={manejarLogin}
            disabled={cargando}
          >
            <Text style={estilos.textoBotonLogin}>
              {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <Text style={estilos.textoAyuda}>
            Solo para administradores{'\n\n'}
            Usuario de prueba:{'\n'}
            Email: admin@tienda.com{'\n'}
            Contraseña: admin123
          </Text>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  gradiente: { flex: 1, justifyContent: 'center', padding: 20 },
  encabezado: { alignItems: 'center', marginBottom: 40 },
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  subtitulo: { fontSize: 18, color: '#e0e7ff', marginTop: 8 },
  formulario: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 5 },
  inputContenedor: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, padding: 12, marginBottom: 16 },
  icono: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  botonLogin: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  botonDeshabilitado: { backgroundColor: '#ccc' },
  textoBotonLogin: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  textoAyuda: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 24, lineHeight: 20 },
});
