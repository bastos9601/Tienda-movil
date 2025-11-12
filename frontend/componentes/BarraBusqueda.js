import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BarraBusqueda({ busqueda, onBusquedaChange }) {
  return (
    <View style={estilos.barraBusqueda}>
      <Ionicons name="search" size={20} color="#666" />
      <TextInput
        style={estilos.inputBusqueda}
        placeholder="Buscar productos..."
        value={busqueda}
        onChangeText={onBusquedaChange}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  inputBusqueda: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
});
