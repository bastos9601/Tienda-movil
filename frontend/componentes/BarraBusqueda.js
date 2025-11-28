// Barra de búsqueda: input con icono para filtrar productos
import React, { useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../configuracion/api';

// Componente controlado: recibe el valor y callback para cambios
export default function BarraBusqueda({ busqueda, onBusquedaChange, onResultados }) {

  // useEffect: se ejecuta cada vez que cambie "busqueda" o "onResultados"
  useEffect(() => {

    // Si no existe el callback "onResultados", no hace nada
    if (!onResultados) return;

    // Crea un temporizador para aplicar un "debounce" de 300ms
    // Evita hacer llamadas a la API por cada tecla presionada
    const delay = setTimeout(async () => {

      try {
        // Si hay texto en la búsqueda y no está vacío
        if (busqueda && busqueda.trim() !== '') {

          // Llamada GET a la API, enviando "busqueda" como parámetro
          const respuesta = await api.get('/productos', { params: { busqueda } });

          // Envía los resultados obtenidos al componente padre
          onResultados(respuesta.data);
        }

      } catch (error) {
        // Si ocurre un error, simplemente se ignora (se podría manejar)
      }

    }, 300); // Espera 300ms antes de ejecutar la búsqueda

    // Limpieza del efecto: si el usuario escribe de nuevo antes de 300ms,
    // cancela el timeout previo para evitar llamadas innecesarias
    return () => clearTimeout(delay);

  // Dependencias: si cambia "busqueda" o "onResultados", se ejecuta el efecto
  }, [busqueda, onResultados]);
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
