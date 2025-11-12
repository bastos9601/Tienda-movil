import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta URL por la IP de tu computadora cuando pruebes en dispositivo físico
// Ejemplo: http://192.168.1.100:3000/api
const URL_BASE = 'http://10.179.73.82:3000/api';

const api = axios.create({
  baseURL: URL_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
