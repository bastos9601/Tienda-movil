// Contexto de Carrito: gestiona items, persistencia y utilidades (total/cantidades)
import React, { createContext, useState, useContext, useEffect } from 'react';
// Almacenamiento local para guardar el carrito entre sesiones
import AsyncStorage from '@react-native-async-storage/async-storage';

// Crea el contexto para compartir estado del carrito en la app
const CarritoContexto = createContext();

// Hook personalizado para consumir el contexto del carrito
export const useCarrito = () => {
  const contexto = useContext(CarritoContexto);
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return contexto;
};

// Proveedor del contexto del carrito
export const CarritoProvider = ({ children }) => {
  // Array de items en el carrito: { id, nombre, precio, cantidad, ... }
  const [items, setItems] = useState([]);

  // Carga el carrito persistido al montar el componente
  useEffect(() => {
    cargarCarrito();
  }, []);

  // Guarda el carrito cada vez que cambia la lista de items
  useEffect(() => {
    guardarCarrito();
  }, [items]);

  // Lee el carrito desde AsyncStorage
  const cargarCarrito = async () => {
    try {
      const carritoGuardado = await AsyncStorage.getItem('carrito');
      if (carritoGuardado) {
        setItems(JSON.parse(carritoGuardado));
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  };

  // Persistir el carrito actual en AsyncStorage
  const guardarCarrito = async () => {
    try {
      await AsyncStorage.setItem('carrito', JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  // Agrega un producto al carrito o incrementa su cantidad si ya existe
  const agregarAlCarrito = (producto, cantidad = 1) => {
    setItems(itemsActuales => {
      const itemExistente = itemsActuales.find(item => item.id === producto.id);
      
      if (itemExistente) {
        return itemsActuales.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      
      return [...itemsActuales, { ...producto, cantidad }];
    });
  };

  // Elimina un producto del carrito por su id
  const eliminarDelCarrito = (productoId) => {
    setItems(itemsActuales => itemsActuales.filter(item => item.id !== productoId));
  };

  // Actualiza la cantidad de un producto; si es <= 0, lo elimina
  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }
    
    setItems(itemsActuales =>
      itemsActuales.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  // Vacía completamente el carrito
  const vaciarCarrito = () => {
    setItems([]);
  };

  // Calcula el total del carrito (suma de subtotal por item)
  const obtenerTotal = () => {
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  // Calcula la cantidad total de unidades en el carrito
  const obtenerCantidadTotal = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  // Objeto de valor del contexto con estado y acciones
  const valor = {
    items,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    obtenerTotal,
    obtenerCantidadTotal,
  };

  // Provee el contexto a toda la aplicación
  return <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>;
};
