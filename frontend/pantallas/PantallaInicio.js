// ============================================================================
// PANTALLA: PantallaInicio
// ============================================================================
// Esta es la pantalla principal de la aplicación donde se muestran todos los
// productos disponibles. Permite filtrar por categoría y buscar por texto.
// ============================================================================

// ============================================================================
// IMPORTACIONES DE REACT Y REACT NATIVE
// ============================================================================
// React: Librería principal para crear componentes
import React, { useState, useEffect } from 'react';
// useState: Hook para manejar estado local (productos, categorías, filtros)
// useEffect: Hook para efectos secundarios (cargar datos al montar el componente)

// View: Contenedor básico (equivalente a <div> en web)
// Text: Componente para mostrar texto
// FlatList: Lista optimizada para renderizar grandes cantidades de items
// StyleSheet: API para crear estilos de forma optimizada
// ActivityIndicator: Spinner de carga (círculo girando)
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

// ============================================================================
// IMPORTACIONES DE CONFIGURACIÓN Y CONTEXTOS
// ============================================================================
// api: Instancia de axios configurada para hacer peticiones al backend
import api from '../configuracion/api';

// useCarrito: Hook personalizado para acceder al contexto del carrito
// Permite agregar productos al carrito desde cualquier componente
import { useCarrito } from '../contexto/CarritoContexto';

// ============================================================================
// IMPORTACIONES DE COMPONENTES PERSONALIZADOS
// ============================================================================
// BarraBusqueda: Input de búsqueda con icono de lupa
import BarraBusqueda from '../componentes/BarraBusqueda';

// ListaCategorias: Lista horizontal de categorías con scroll
import ListaCategorias from '../componentes/ListaCategorias';

// TarjetaProducto: Tarjeta individual de producto con imagen, precio y botón
import TarjetaProducto from '../componentes/TarjetaProducto';

// ============================================================================
// COMPONENTE PRINCIPAL: PantallaInicio
// ============================================================================
// Props:
// - navigation: Objeto de React Navigation para navegar entre pantallas
export default function PantallaInicio({ navigation }) {
  
  // ==========================================================================
  // ESTADO LOCAL DEL COMPONENTE
  // ==========================================================================
  
  // productos: Array de productos obtenidos del backend
  // Cada producto tiene: { id, nombre, descripcion, precio, imagen, stock, categoria_id, categoria_nombre }
  const [productos, setProductos] = useState([]);
  
  // categorias: Array de categorías obtenidas del backend
  // Cada categoría tiene: { id, nombre, descripcion, activo }
  const [categorias, setCategorias] = useState([]);
  
  // categoriaSeleccionada: ID de la categoría seleccionada para filtrar
  // null = mostrar todos los productos (sin filtro)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  
  // busqueda: Texto ingresado en la barra de búsqueda
  // Se usa para filtrar productos por nombre o descripción
  const [busqueda, setBusqueda] = useState('');
  
  // cargando: Indica si se están cargando los datos iniciales
  // true = mostrar spinner, false = mostrar contenido
  const [cargando, setCargando] = useState(true);
  
  // ==========================================================================
  // CONTEXTO DEL CARRITO
  // ==========================================================================
  
  // agregarAlCarrito: Función del contexto para agregar productos al carrito
  // Uso: agregarAlCarrito(producto, cantidad)
  const { agregarAlCarrito } = useCarrito();

  // ==========================================================================
  // EFECTO: CARGA INICIAL DE DATOS
  // ==========================================================================
  // Este efecto se ejecuta UNA SOLA VEZ cuando el componente se monta
  // Carga productos y categorías en paralelo desde el backend
  useEffect(() => {
    cargarDatos(); // Llama a la función que carga productos y categorías
  }, []); // Array vacío [] = solo se ejecuta al montar el componente

  // ==========================================================================
  // EFECTO: RECARGAR CATEGORÍAS AL ENFOCAR LA PANTALLA
  // ==========================================================================
  // Este efecto se ejecuta cada vez que la pantalla recibe el foco
  // Útil cuando vuelves de otra pantalla (ej: después de crear una categoría)
  useEffect(() => {
    // addListener: Escucha el evento 'focus' (cuando la pantalla se enfoca)
    const unsubscribe = navigation.addListener('focus', () => {
      cargarCategorias(); // Recarga las categorías
    });
    
    // Cleanup: Remueve el listener cuando el componente se desmonta
    return unsubscribe;
  }, [navigation]); // Se re-ejecuta si navigation cambia (raro, pero necesario)

  // ==========================================================================
  // EFECTO: RECARGAR PRODUCTOS CUANDO CAMBIAN LOS FILTROS
  // ==========================================================================
  // Este efecto se ejecuta cada vez que cambia la categoría seleccionada o la búsqueda
  // Hace una nueva petición al backend con los filtros actualizados
  useEffect(() => {
    cargarProductos(); // Recarga productos con los filtros actuales
  }, [categoriaSeleccionada, busqueda]); // Se ejecuta cuando cambian estos valores

  // ==========================================================================
  // FUNCIÓN: cargarDatos
  // ==========================================================================
  // Carga productos y categorías en paralelo desde el backend
  // Se ejecuta solo una vez al montar el componente
  const cargarDatos = async () => {
     try {
      // Promise.all: Ejecuta ambas peticiones en paralelo (más rápido)
      // Espera a que ambas terminen antes de continuar
      const [respProductos, respCategorias] = await Promise.all([
        api.get('/productos'),      // GET http://localhost:3000/api/productos
        api.get('/categorias')       // GET http://localhost:3000/api/categorias
      ]);
      
      // Actualiza el estado con los datos recibidos
      setProductos(respProductos.data);   // Array de productos
      setCategorias(respCategorias.data); // Array de categorías
      
    } catch (error) {
      // Si hay error (sin internet, backend caído, etc.), lo muestra en consola
      console.error('Error al cargar datos:', error);
    } finally {
      // finally: Se ejecuta siempre, haya error o no
      // Oculta el spinner de carga
      setCargando(false);
    }
  };

  // ==========================================================================
  // FUNCIÓN: cargarCategorias
  // ==========================================================================
  // Obtiene solo las categorías activas del backend
  // Se ejecuta cuando la pantalla recibe el foco
  const cargarCategorias = async () => {
    try {
      // GET http://localhost:3000/api/categorias
      // El backend solo devuelve categorías con activo = TRUE
      const respuesta = await api.get('/categorias');
      
      // Actualiza el estado con las categorías
      setCategorias(respuesta.data);
      
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // ==========================================================================
  // FUNCIÓN: cargarProductos
  // ==========================================================================
  // Consulta productos del backend aplicando filtros de categoría y búsqueda
  // Se ejecuta cada vez que cambian los filtros
  const cargarProductos = async () => {
    try {
      // Construye el objeto de parámetros de consulta (query params)
      const params = {};
      
      // Si hay categoría seleccionada, agrega el filtro
      // Ejemplo: ?categoria=2
      if (categoriaSeleccionada) {
        params.categoria = categoriaSeleccionada;
      }
      
      // Si hay texto de búsqueda, agrega el filtro
      // Ejemplo: ?busqueda=laptop
      if (busqueda) {
        params.busqueda = busqueda;
      }
      
      // GET http://localhost:3000/api/productos?categoria=2&busqueda=laptop
      const respuesta = await api.get('/productos', { params });
      
      // Actualiza el estado con los productos filtrados
      setProductos(respuesta.data);
      
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  // ==========================================================================
  // FUNCIÓN: manejarAgregarCarrito
  // ==========================================================================
  // Agrega un producto al carrito y muestra una alerta de confirmación
  // Parámetros:
  // - producto: Objeto del producto a agregar
  const manejarAgregarCarrito = (producto) => {
    // Llama a la función del contexto para agregar el producto
    // Por defecto agrega 1 unidad
    agregarAlCarrito(producto);
    
    // Muestra una alerta nativa del sistema operativo
    alert('Producto agregado al carrito');
  };

  // ==========================================================================
  // FUNCIÓN: renderProducto
  // ==========================================================================
  // Función que renderiza cada item de la FlatList
  // Parámetros:
  // - item: El producto actual a renderizar
  const renderProducto = ({ item }) => (
    // TarjetaProducto: Componente que muestra la tarjeta del producto
    <TarjetaProducto
      // Pasa el producto completo como prop
      producto={item}
      
      // onPress: Función que se ejecuta al tocar la tarjeta
      // Navega a la pantalla de detalle pasando el producto como parámetro
      onPress={() => navigation.navigate('DetalleProducto', { producto: item })}
      
      // onAgregarCarrito: Función que se ejecuta al tocar el botón "Agregar"
      // Agrega el producto al carrito
      onAgregarCarrito={() => manejarAgregarCarrito(item)}
    />
  );

  // ==========================================================================
  // RENDERIZADO CONDICIONAL: ESTADO DE CARGA
  // ==========================================================================
  // Si cargando = true, muestra un spinner en el centro de la pantalla
  if (cargando) {
    return (
      // View: Contenedor que ocupa toda la pantalla
      <View style={estilos.centrado}>
        {/* ActivityIndicator: Spinner de carga animado */}
        <ActivityIndicator 
          size="large"        // Tamaño grande
          color="#6366f1"     // Color morado/azul
        />
      </View>
    );
  }

  // ==========================================================================
  // RENDERIZADO PRINCIPAL
  // ==========================================================================
  return (
    // Contenedor principal que ocupa toda la pantalla
    <View style={estilos.contenedor}>
      
      {/* ====================================================================
          SECCIÓN: ENCABEZADO
          ==================================================================== */}
      {/* Contiene el título y la barra de búsqueda */}
      <View style={estilos.encabezado}>
        {/* Título de la aplicación */}
        <Text style={estilos.titulo}>Tienda Virtual</Text>
        
        {/* Barra de búsqueda controlada */}
        <BarraBusqueda 
          // busqueda: Valor actual del input (estado)
          busqueda={busqueda} 
          
          // onBusquedaChange: Función que se ejecuta al escribir
          // Actualiza el estado 'busqueda' con el nuevo texto
          onBusquedaChange={setBusqueda} 
        />
      </View>

      {/* ====================================================================
          SECCIÓN: LISTA DE CATEGORÍAS
          ==================================================================== */}
      {/* Lista horizontal de categorías con scroll */}
      <ListaCategorias
        // categorias: Array de categorías a mostrar
        categorias={categorias}
        
        // categoriaSeleccionada: ID de la categoría actualmente seleccionada
        categoriaSeleccionada={categoriaSeleccionada}
        
        // onCategoriaSelect: Función que se ejecuta al tocar una categoría
        // Actualiza el estado 'categoriaSeleccionada'
        onCategoriaSelect={setCategoriaSeleccionada}
      />

      {/* ====================================================================
          SECCIÓN: GRILLA DE PRODUCTOS
          ==================================================================== */}
      {/* FlatList: Lista optimizada para renderizar muchos items */}
      <FlatList
        // data: Array de productos a renderizar
        data={productos}
        
        // keyExtractor: Función que devuelve una key única para cada item
        // React usa esto para optimizar el renderizado
        keyExtractor={(item) => String(item.id)}
        
        // renderItem: Función que renderiza cada item
        renderItem={renderProducto}
        
        // numColumns: Número de columnas (2 = grilla de 2 columnas)
        numColumns={2}
        
        // contentContainerStyle: Estilos del contenedor interno de la lista
        contentContainerStyle={estilos.listaProductos}
        
        // columnWrapperStyle: Estilos de cada fila (cuando numColumns > 1)
        columnWrapperStyle={estilos.fila}
      />
    </View>
  );
}

// ============================================================================
// ESTILOS DEL COMPONENTE
// ============================================================================
// StyleSheet.create: Crea un objeto de estilos optimizado
const estilos = StyleSheet.create({
  // contenedor: Estilo del contenedor principal
  contenedor: { 
    flex: 1,                    // Ocupa todo el espacio disponible
    backgroundColor: '#f5f5f5'  // Fondo gris claro
  },
  
  // centrado: Estilo para centrar contenido (usado en el spinner)
  centrado: { 
    flex: 1,                    // Ocupa todo el espacio
    justifyContent: 'center',   // Centra verticalmente
    alignItems: 'center'        // Centra horizontalmente
  },
  
  // encabezado: Estilo del header con título y búsqueda
  encabezado: { 
    backgroundColor: '#fff',    // Fondo blanco
    padding: 16,                // Espaciado interno
    paddingTop: 50,             // Espaciado superior extra (para notch/status bar)
    elevation: 2                // Sombra en Android
  },
  
  // titulo: Estilo del texto "Tienda Virtual"
  titulo: { 
    fontSize: 28,               // Tamaño de fuente grande
    fontWeight: 'bold',         // Texto en negrita
    color: '#333',              // Color gris oscuro
    marginBottom: 12            // Margen inferior
  },
  
  // listaProductos: Estilo del contenedor de la FlatList
  listaProductos: { 
    padding: 8                  // Espaciado interno
  },
  
  // fila: Estilo de cada fila de la grilla (2 columnas)
  fila: { 
    justifyContent: 'space-between'  // Distribuye el espacio entre las columnas
  },
});
