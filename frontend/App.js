// ============================================
// IMPORTACIONES DE REACT Y REACT NATIVE
// ============================================
// React: Librería principal para crear componentes
// useState: Hook para manejar estado local en componentes
// useEffect: Hook para efectos secundarios (llamadas API, suscripciones, etc.)
import React, { useState, useEffect } from 'react';

// ============================================
// IMPORTACIONES DE NAVEGACIÓN
// ============================================
// NavigationContainer: Contenedor principal que envuelve toda la navegación de la app
import { NavigationContainer } from '@react-navigation/native';

// createBottomTabNavigator: Crea la barra de navegación inferior con pestañas (Inicio, Carrito, Perfil)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// createStackNavigator: Crea navegación tipo pila (permite ir hacia atrás entre pantallas)
import { createStackNavigator } from '@react-navigation/stack';

// ============================================
// IMPORTACIONES DE ALMACENAMIENTO Y UI
// ============================================
// AsyncStorage: Almacenamiento persistente local (guarda datos aunque cierres la app)
// Se usa para guardar el token de autenticación
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ionicons: Librería de iconos de Ionic (home, cart, person, etc.)
import { Ionicons } from '@expo/vector-icons';

// ============================================
// IMPORTACIONES DE PANTALLAS PÚBLICAS
// ============================================
// Pantallas que cualquier usuario puede ver
import PantallaInicio from './pantallas/PantallaInicio'; // Pantalla principal con productos
import PantallaCarrito from './pantallas/PantallaCarrito'; // Carrito de compras
import PantallaPerfil from './pantallas/PantallaPerfil'; // Perfil del usuario
import PantallaLogin from './pantallas/PantallaLogin'; // Login para administradores
import PantallaDetalleProducto from './pantallas/PantallaDetalleProducto'; // Detalle de un producto

// ============================================
// IMPORTACIONES DE PANTALLAS DE ADMINISTRADOR
// ============================================
// Pantallas solo accesibles para usuarios con rol 'admin'
import PantallaAdminProductos from './pantallas/admin/PantallaAdminProductos'; // Lista de productos (admin)
import PantallaAdminFormularioProducto from './pantallas/admin/PantallaAdminFormularioProducto'; // Crear/editar producto
import PantallaAdminPedidos from './pantallas/admin/PantallaAdminPedidos'; // Gestión de pedidos
import PantallaAdminCategorias from './pantallas/admin/PantallaAdminCategorias'; // Lista de categorías
import PantallaAdminFormularioCategoria from './pantallas/admin/PantallaAdminFormularioCategoria'; // Crear/editar categoría
import PantallaImportarProductos from './pantallas/admin/PantallaImportarProductos'; // Importar productos de prueba

// ============================================
// IMPORTACIONES DE CONTEXTOS (ESTADO GLOBAL)
// ============================================
// CarritoProvider: Proveedor del contexto del carrito (productos agregados)
import { CarritoProvider } from './contexto/CarritoContexto';

// AuthProvider: Proveedor del contexto de autenticación (usuario logueado)
// useAuth: Hook para acceder al contexto de autenticación desde cualquier componente
import { AuthProvider, useAuth } from './contexto/AuthContexto';

// ============================================
// CREACIÓN DE NAVEGADORES
// ============================================
// Tab: Navegador de pestañas inferiores (Bottom Tabs)
const Tab = createBottomTabNavigator();

// Stack: Navegador de pila (permite apilar pantallas y volver atrás)
const Stack = createStackNavigator();

// ============================================
// COMPONENTE: TabsInicio
// ============================================
// Este componente define la barra de navegación inferior con 3 pestañas:
// - Inicio: Muestra los productos disponibles
// - Carrito: Muestra los productos agregados al carrito
// - Perfil: Muestra información del usuario y opciones de admin
function TabsInicio() {
  return (
    // Tab.Navigator: Contenedor de las pestañas inferiores
    <Tab.Navigator
      // screenOptions: Configuración que se aplica a todas las pestañas
      screenOptions={({ route }) => ({
        // tabBarIcon: Función que define qué icono mostrar en cada pestaña
        tabBarIcon: ({ focused, color, size }) => {
          // Variable para almacenar el nombre del icono
          let iconName;
          
          // Determinar qué icono mostrar según la pestaña actual
          if (route.name === 'Inicio') {
            // Si está enfocada (activa), muestra icono sólido, si no, muestra outline
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Carrito') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          // Retornar el componente de icono con el nombre, tamaño y color
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Color del icono y texto cuando la pestaña está activa
        tabBarActiveTintColor: '#6366f1', // Morado/azul
        // Color del icono y texto cuando la pestaña está inactiva
        tabBarInactiveTintColor: 'gray', // Gris
        // Ocultar el header superior (ya que cada pantalla tiene su propio header)
        headerShown: false,
      })}
    >
      {/* Pestaña de Inicio - Muestra la lista de productos */}
      <Tab.Screen name="Inicio" component={PantallaInicio} />
      
      {/* Pestaña de Carrito - Muestra los productos en el carrito */}
      <Tab.Screen name="Carrito" component={PantallaCarrito} />
      
      {/* Pestaña de Perfil - Muestra el perfil del usuario y opciones de admin */}
      <Tab.Screen name="Perfil" component={PantallaPerfil} />
    </Tab.Navigator>
  );
}

function NavegacionPrincipal() {
  const { usuario } = useAuth();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TabsInicio" 
        component={TabsInicio} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DetalleProducto" 
        component={PantallaDetalleProducto}
        options={{ title: 'Detalle del Producto' }}
      />
      <Stack.Screen 
        name="Login" 
        component={PantallaLogin} 
        options={{ title: 'Acceso Administrador' }}
      />
      {usuario?.rol === 'admin' && (
        <>
          <Stack.Screen 
            name="AdminProductos" 
            component={PantallaAdminProductos}
            options={{ title: 'Gestión de Productos' }}
          />
          <Stack.Screen 
            name="AdminFormularioProducto" 
            component={PantallaAdminFormularioProducto}
            options={{ title: 'Producto' }}
          />
          <Stack.Screen 
            name="AdminCategorias" 
            component={PantallaAdminCategorias}
            options={{ title: 'Gestión de Categorías' }}
          />
          <Stack.Screen 
            name="AdminFormularioCategoria" 
            component={PantallaAdminFormularioCategoria}
            options={{ title: 'Categoría' }}
          />
          <Stack.Screen 
            name="AdminPedidos" 
            component={PantallaAdminPedidos}
            options={{ title: 'Gestión de Pedidos' }}
          />
          <Stack.Screen 
            name="ImportarProductos" 
            component={PantallaImportarProductos}
            options={{ title: 'Importar Productos' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: App
// ============================================
// Este es el componente raíz de toda la aplicación
// Envuelve la app con los proveedores de contexto y el contenedor de navegación
export default function App() {
  return (
    // ========================================
    // PROVEEDOR DE AUTENTICACIÓN (AuthProvider)
    // ========================================
    // Envuelve toda la app para que cualquier componente pueda acceder a:
    // - usuario: Datos del usuario logueado (id, nombre, email, rol, token)
    // - iniciarSesion(): Función para hacer login
    // - cerrarSesion(): Función para hacer logout
    // - cargando: Estado de carga durante la verificación del token
    <AuthProvider>
      {/* ========================================
          PROVEEDOR DEL CARRITO (CarritoProvider)
          ======================================== */}
      {/* Envuelve la app para que cualquier componente pueda acceder a:
          - carrito: Array de productos en el carrito
          - agregarAlCarrito(): Función para agregar productos
          - eliminarDelCarrito(): Función para quitar productos
          - actualizarCantidad(): Función para cambiar cantidad
          - vaciarCarrito(): Función para limpiar el carrito
          - total: Precio total del carrito */}
      <CarritoProvider>
        {/* ========================================
            CONTENEDOR DE NAVEGACIÓN
            ======================================== */}
        {/* NavigationContainer: Componente requerido que envuelve toda la navegación
            Maneja el estado de navegación y permite usar navigation.navigate() */}
        <NavigationContainer>
          {/* Componente que contiene toda la estructura de navegación de la app */}
          <NavegacionPrincipal />
        </NavigationContainer>
      </CarritoProvider>
    </AuthProvider>
  );
}

// ============================================
// RESUMEN DE LA ESTRUCTURA DE LA APP
// ============================================
// 
// App (Componente raíz)
//   └── AuthProvider (Contexto de autenticación)
//       └── CarritoProvider (Contexto del carrito)
//           └── NavigationContainer (Contenedor de navegación)
//               └── NavegacionPrincipal (Stack Navigator)
//                   ├── TabsInicio (Bottom Tab Navigator)
//                   │   ├── Inicio (Pantalla de productos)
//                   │   ├── Carrito (Pantalla del carrito)
//                   │   └── Perfil (Pantalla de perfil)
//                   ├── DetalleProducto (Pantalla de detalle)
//                   ├── Login (Pantalla de login)
//                   └── Pantallas de Admin (solo si usuario.rol === 'admin')
//                       ├── AdminProductos
//                       ├── AdminFormularioProducto
//                       ├── AdminCategorias
//                       ├── AdminFormularioCategoria
//                       ├── AdminPedidos
//                       └── ImportarProductos
//
// ============================================
// FLUJO DE DATOS
// ============================================
// 
// 1. AuthProvider guarda el usuario en estado global
// 2. Cualquier componente puede usar useAuth() para acceder al usuario
// 3. CarritoProvider guarda los productos del carrito en estado global
// 4. Cualquier componente puede usar useCarrito() para agregar/quitar productos
// 5. NavigationContainer permite navegar entre pantallas con navigation.navigate()
//
