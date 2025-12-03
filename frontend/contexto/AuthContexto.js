// Contexto de Autenticación: maneja login, registro y sesión persistente
import React, { createContext, useState, useContext, useEffect } from 'react';
// Almacenamiento local para guardar token y datos del usuario
import AsyncStorage from '@react-native-async-storage/async-storage';
// Cliente HTTP configurado para conectarse al backend
import api from '../configuracion/api';

// Crea el contexto para compartir estado de auth en la app
const AuthContexto = createContext();

// Hook personalizado para consumir el contexto de Auth
export const useAuth = () => {
  const contexto = useContext(AuthContexto);
  // Asegura que el hook se use dentro del proveedor
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return contexto;
};

// Proveedor del contexto: expone estado y funciones de autenticación
export const AuthProvider = ({ children }) => {
  // Estado del usuario autenticado (objeto con id, email, rol, etc.)
  const [usuario, setUsuario] = useState(null);
  // Bandera para saber si estamos cargando info inicial (rehidratación)
  const [cargando, setCargando] = useState(true);

  // Al montar el proveedor, intenta cargar usuario/token persistidos
  useEffect(() => {
    cargarUsuario();
  }, []);

  // Rehidrata el estado de auth desde AsyncStorage
  const cargarUsuario = async () => {
    try {
      // Lee token JWT y datos del usuario guardados tras un login previo
      const token = await AsyncStorage.getItem('token');
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      
      // Si existen, coloca el usuario en estado para sesión automática
      if (token && usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      // Marca que terminó la carga inicial
      setCargando(false);
    }
  };

  // Inicia sesión contra el backend y guarda token/usuario
const login = async (email, contrasena) => {
  try {
    // POST al backend: /api/auth/login
    // Envía email y contraseña al servidor para autenticar al usuario
    const respuesta = await api.post('/auth/login', { email, contrasena });

    // Extrae token JWT y datos del usuario del backend
    // respuesta.data contiene lo que devuelve tu backend
    // usuario: usuarioData renombra la variable "usuario" a "usuarioData"
    const { token, usuario: usuarioData } = respuesta.data;
    
    // Persiste token y usuario para futuras sesiones
    // Guarda el token en almacenamiento local del dispositivo
    await AsyncStorage.setItem('token', token);
    // Guarda los datos del usuario en formato string (JSON.stringify)
    await AsyncStorage.setItem('usuario', JSON.stringify(usuarioData));
    
    // Actualiza el estado local con el usuario autenticado
    // Esto hace que la app sepa que el usuario ya está logueado
    setUsuario(usuarioData);

    // Retorna objeto indicando que la operación fue exitosa
    return { exito: true };

  } catch (error) {
    // Si algo falla en el login (credenciales incorrectas, servidor caído, etc)
    // Devuelve un mensaje más amigable
    return { 
      exito: false, 
      mensaje: error.response?.data?.mensaje || 'Error al iniciar sesión' 
    };
  }
};


  // Registra un nuevo usuario en el backend
  const registro = async (datos) => {
    try {
      // POST al backend: /api/auth/registro con los datos del formulario
      await api.post('/auth/registro', datos);
      return { exito: true };
    } catch (error) {
      return { 
        exito: false, 
        mensaje: error.response?.data?.mensaje || 'Error al registrar usuario' 
      };
    }
  }

  // Cierra la sesión: borra token y datos persistidos
  const cerrarSesion = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('usuario');
      setUsuario(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Objeto de valor del contexto con estado y acciones disponibles
  const valor = {
    usuario,
    cargando,
    login,
    registro,
    cerrarSesion,
  };

  // Provee el contexto a toda la app
  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
};
