import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import PantallaInicio from './pantallas/PantallaInicio';
import PantallaCarrito from './pantallas/PantallaCarrito';
import PantallaPerfil from './pantallas/PantallaPerfil';
import PantallaLogin from './pantallas/PantallaLogin';
import PantallaDetalleProducto from './pantallas/PantallaDetalleProducto';
import PantallaAdminProductos from './pantallas/admin/PantallaAdminProductos';
import PantallaAdminFormularioProducto from './pantallas/admin/PantallaAdminFormularioProducto';
import PantallaAdminPedidos from './pantallas/admin/PantallaAdminPedidos';
import PantallaAdminCategorias from './pantallas/admin/PantallaAdminCategorias';
import PantallaAdminFormularioCategoria from './pantallas/admin/PantallaAdminFormularioCategoria';
import PantallaImportarProductos from './pantallas/admin/PantallaImportarProductos';

import { CarritoProvider } from './contexto/CarritoContexto';
import { AuthProvider, useAuth } from './contexto/AuthContexto';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabsInicio() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Carrito') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } 
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio" component={PantallaInicio} />
      <Tab.Screen name="Carrito" component={PantallaCarrito} />
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

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <NavigationContainer>
          <NavegacionPrincipal />
        </NavigationContainer>
      </CarritoProvider>
    </AuthProvider>
  );
}
