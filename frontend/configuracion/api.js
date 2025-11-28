// Importa axios para hacer solicitudes HTTP al backend
import axios from 'axios';
// Importa AsyncStorage para persistir y leer el token JWT en dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL de la API backend.
// Cambia esta URL por la IP de tu computadora cuando pruebes en dispositivo físico
// Ejemplo: 'http://192.168.1.100:3000/api' 'http://10.179.73.82:3000/api'si el backend corre en tu PC
const URL_BASE = 'http://10.149.142.82:3000/api';

// Crea una instancia de axios preconfigurada
const api = axios.create({
  // Todas las peticiones usarán esta baseURL para conectarse al backend
  baseURL: URL_BASE,
  // Tiempo máximo de espera de la solicitud (en ms)
  timeout: 10000,
  // Encabezados por defecto de las peticiones
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor que se ejecuta ANTES de cada petición: añade el token JWT si existe
api.interceptors.request.use(
  async (config) => {
    try {
      // Lee el token guardado localmente (persistido tras login)
      const token = await AsyncStorage.getItem('token');
      // Si hay token, agrega encabezado Authorization para autenticación en backend
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Si hay error al leer el token, continúa sin él (permite compras sin autenticación)
      console.log('No se pudo leer el token, continuando sin autenticación');
    }
    // Retorna la configuración modificada para continuar con la petición
    return config;
  },
  (error) => {
    // Si ocurrió un error preparando la petición, lo propagamos
    return Promise.reject(error);
  }
);

// Exporta la instancia para usarla en todo el frontend
export default api;
