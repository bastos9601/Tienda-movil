import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../configuracion/api';

const AuthContexto = createContext();

export const useAuth = () => {
  const contexto = useContext(AuthContexto);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      
      if (token && usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const login = async (email, contrasena) => {
    try {
      const respuesta = await api.post('/auth/login', { email, contrasena });
      const { token, usuario: usuarioData } = respuesta.data;
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
      
      setUsuario(usuarioData);
      return { exito: true };
    } catch (error) {
      return { 
        exito: false, 
        mensaje: error.response?.data?.mensaje || 'Error al iniciar sesión' 
      };
    }
  };

  const registro = async (datos) => {
    try {
      await api.post('/auth/registro', datos);
      return { exito: true };
    } catch (error) {
      return { 
        exito: false, 
        mensaje: error.response?.data?.mensaje || 'Error al registrar usuario' 
      };
    }
  };

  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const valor = {
    usuario,
    cargando,
    login,
    registro,
    cerrarSesion,
  };

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
};
