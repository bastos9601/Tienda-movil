// Barra de búsqueda: input con icono para filtrar productos
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Componente controlado: recibe el valor y callback para cambios
export default function BarraBusqueda({ busqueda, onBusquedaChange }) {
  return (
    // Contenedor horizontal con icono e input
    <View style={estilos.barraBusqueda}>
      {/* Icono de búsqueda */}
      <Ionicons name="search" size={20} color="#666" />
      {/* Campo de texto para ingresar términos de búsqueda */}
      <TextInput
        style={estilos.inputBusqueda}
        placeholder="Buscar productos..."
        value={busqueda}
        onChangeText={onBusquedaChange}
      />
    </View>
  );
}

// Estilos del componente
const estilos = StyleSheet.create({
  // Contenedor de la barra con diseño horizontal
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  // Input ocupa el espacio restante y separa del icono
  inputBusqueda: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
});
