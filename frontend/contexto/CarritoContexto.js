// Contexto de Carrito: gestiona items, persistencia y utilidades (total/cantidades)
import React, { createContext, useState, useContext, useEffect } from 'react'; 
// Importa React y los hooks usados:
// - createContext: crea un contexto para compartir estado.
// - useState: mantiene estado local (items).
// - useContext: consume el contexto desde componentes hijos.
// - useEffect: efectos secundarios (cargar/guardar carrito).

// Almacenamiento local para guardar el carrito entre sesiones
import AsyncStorage from '@react-native-async-storage/async-storage';
// Importa AsyncStorage para persistir datos en el dispositivo (clave/valor).

// Crea el contexto para compartir estado del carrito en la app
const CarritoContexto = createContext();
// Crea un contexto vacío; será usado por el Provider para exponer estado/acciones.

// Hook personalizado para consumir el contexto del carrito
export const useCarrito = () => {
  const contexto = useContext(CarritoContexto);
  // useContext obtiene el valor actual del contexto (valor provisto por Provider).

  if (!contexto) {
    // Si no hay contexto (ej. hook usado fuera del Provider), lanzamos un error claro.
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return contexto; // Devuelve el objeto con items y funciones (ver abajo).
};

// Proveedor del contexto del carrito
export const CarritoProvider = ({ children }) => {
  // Component que envolverá la app o parte de ella y proveerá el carrito.
  // Recibe children (los componentes anidados que necesitarán acceder al carrito).

  // Array de items en el carrito: { id, nombre, precio, cantidad, ... }
  const [items, setItems] = useState([]); 
  // Estado inicial vacío: items es la lista actual del carrito; setItems la actualiza.

  // Carga el carrito persistido al montar el componente
  useEffect(() => {
    cargarCarrito();
  }, []); 
  // Efecto que se ejecuta una vez al montar (array de dependencias vacío).
  // Llama a cargarCarrito para restaurar el carrito guardado en AsyncStorage.

  // Guarda el carrito cada vez que cambia la lista de items
  useEffect(() => {
    guardarCarrito();
  }, [items]);
  // Efecto que se ejecuta cuando `items` cambia.
  // Llama a guardarCarrito para persistir la versión actual en AsyncStorage.

  // Lee el carrito desde AsyncStorage
  const cargarCarrito = async () => {
    try {
      const carritoGuardado = await AsyncStorage.getItem('carrito');
      // Lee la cadena JSON bajo la clave 'carrito' (puede ser null si no existe).

      if (carritoGuardado) {
        setItems(JSON.parse(carritoGuardado));
        // Si hay datos, parsea el JSON a array y actualiza el estado `items`.
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      // Atrapa errores de lectura/parsing y los registra (no se rompe la app).
    }
  };

  // Persistir el carrito actual en AsyncStorage
  const guardarCarrito = async () => {
    try {
      await AsyncStorage.setItem('carrito', JSON.stringify(items));
      // Convierte `items` a JSON y lo guarda bajo la clave 'carrito'.
    } catch (error) {
      console.error('Error al guardar carrito:', error);
      // Manejo de errores en escritura.
    }
  };

  // Agrega un producto al carrito o incrementa su cantidad si ya existe
  const agregarAlCarrito = (producto, cantidad = 1) => {
    // Recibe el objeto producto y una cantidad (por defecto 1).
    setItems(itemsActuales => {
      // Usamos la versión funcional de setItems para garantizar consistencia
      // cuando varias actualizaciones ocurren casi simultáneamente.
      const itemExistente = itemsActuales.find(item => item.id === producto.id);
      // Busca si ya existe un item con el mismo id.

      if (itemExistente) {
        // Si existe, devolvemos un nuevo array donde ese item tiene la cantidad aumentada.
        return itemsActuales.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad } // copia inmutable + nueva cantidad
            : item
        );
      }

      // Si no existía, añadimos el producto al final con la propiedad cantidad.
      return [...itemsActuales, { ...producto, cantidad }];
    });
  };

  // Elimina un producto del carrito por su id
  const eliminarDelCarrito = (productoId) => {
    // Filtra los items manteniendo solo los que no coinciden con productoId.
    setItems(itemsActuales => itemsActuales.filter(item => item.id !== productoId));
  };

  // Actualiza la cantidad de un producto; si es <= 0, lo elimina
  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      // Si la nueva cantidad es cero o negativa, simplificamos eliminando el item.
      eliminarDelCarrito(productoId);
      return; // Salimos después de eliminar.
    }

    // Si la cantidad es válida (>0), mapeamos y actualizamos la cantidad del item coincidente.
    setItems(itemsActuales =>
      itemsActuales.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  // Vacía completamente el carrito
  const vaciarCarrito = () => {
    setItems([]); // Resetea el estado a un array vacío.
  };

  // Calcula el total del carrito (suma de subtotal por item)
  const obtenerTotal = () => {
    // Reduce recorre items y acumula precio * cantidad.
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    // Valor inicial de total = 0.
  };

  // Calcula la cantidad total de unidades en el carrito
  const obtenerCantidadTotal = () => {
    // Reduce suma la propiedad cantidad de cada item.
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  // Objeto de valor del contexto con estado y acciones
  const valor = {
    items,                    // Lista actual de items
    agregarAlCarrito,         // Función para agregar/incrementar
    eliminarDelCarrito,       // Función para eliminar por id
    actualizarCantidad,       // Función para actualizar cantidad de un id
    vaciarCarrito,            // Función para vaciar todo el carrito
    obtenerTotal,             // Función que devuelve el total monetario
    obtenerCantidadTotal,     // Función que devuelve número total de unidades
  };

  // Provee el contexto a toda la aplicación
  return (
    <CarritoContexto.Provider value={valor}>
      {children}
    </CarritoContexto.Provider>
  );
  // Se retorna el Provider que envuelve a los children; cualquier componente
  // dentro podrá usar `useCarrito()` para acceder a `valor`.
};
