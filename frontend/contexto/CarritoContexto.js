import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CarritoContexto = createContext();

export const useCarrito = () => {
  const contexto = useContext(CarritoContexto);
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  }
  return contexto;
};

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    cargarCarrito();
  }, []);

  useEffect(() => {
    guardarCarrito();
  }, [items]);

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

  const guardarCarrito = async () => {
    try {
      await AsyncStorage.setItem('carrito', JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

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

  const eliminarDelCarrito = (productoId) => {
    setItems(itemsActuales => itemsActuales.filter(item => item.id !== productoId));
  };

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

  const vaciarCarrito = () => {
    setItems([]);
  };

  const obtenerTotal = () => {
    return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const obtenerCantidadTotal = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  const valor = {
    items,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    obtenerTotal,
    obtenerCantidadTotal,
  };

  return <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>;
};
