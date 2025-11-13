// Lista horizontal de categorías con selección tipo "chip"
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function ListaCategorias({ categorias, categoriaSeleccionada, onCategoriaSelect }) {
  return (
    // Contenedor principal con fondo y separador inferior
    <View style={estilos.contenedorCategorias}>
      {/* Lista horizontal de chips */}
      <FlatList
        horizontal
        // Agrega un chip "Todos" al inicio para limpiar el filtro
        data={[{ id: null, nombre: 'Todos' }, ...categorias]}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          // Chip presionable; aplica estilo activo si corresponde
          <TouchableOpacity
            style={[
              estilos.chipCategoria,
              categoriaSeleccionada === item.id && estilos.chipCategoriaActiva,
            ]}
            onPress={() => onCategoriaSelect(item.id)}
          >
            <Text
              style={[
                estilos.textoChip,
                categoriaSeleccionada === item.id && estilos.textoChipActivo,
              ]}
            >
              {item.nombre}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={estilos.listaCategorias}
      />
    </View>
  );
}

// Estilos del listado y chips de categorías
const estilos = StyleSheet.create({
  contenedorCategorias: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listaCategorias: {
    paddingHorizontal: 10,
  },
  chipCategoria: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  chipCategoriaActiva: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
    elevation: 3,
  },
  textoChip: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  textoChipActivo: {
    color: '#fff',
    fontWeight: '700',
  },
});
