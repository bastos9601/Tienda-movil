-- Crear base de datos con codificación UTF-8 ampliada para soportar emojis y caracteres especiales
CREATE DATABASE IF NOT EXISTS tienda_virtual CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Seleccionar la base de datos para las operaciones siguientes
USE tienda_virtual;

-- Tabla de categorías: agrupa productos por tipo
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,               -- Identificador único de la categoría
  nombre VARCHAR(100) NOT NULL,                    -- Nombre corto de la categoría
  descripcion TEXT,                                 -- Descripción opcional de la categoría
  imagen VARCHAR(255),                              -- URL de imagen representativa
  activo BOOLEAN DEFAULT TRUE,                      -- Indicador para activar/desactivar la categoría
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Fecha de creación automática
);

-- Tabla de productos: catálogo de artículos disponibles para la venta
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,                                -- Identificador único del producto
  nombre VARCHAR(200) NOT NULL,                                     -- Nombre del producto
  descripcion TEXT,                                                  -- Descripción detallada opcional
  precio DECIMAL(10, 2) NOT NULL,                                   -- Precio actual de venta
  precio_anterior DECIMAL(10, 2),                                   -- Precio anterior para mostrar descuentos
  stock INT DEFAULT 0,                                               -- Cantidad disponible en inventario
  imagen VARCHAR(255),                                               -- URL de imagen principal del producto
  categoria_id INT,                                                  -- Referencia a la categoría del producto
  activo BOOLEAN DEFAULT TRUE,                                       -- Indicador de disponibilidad
  destacado BOOLEAN DEFAULT FALSE,                                   -- Marcador para destacar productos
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,               -- Fecha de creación automática
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha de última actualización automática
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL -- Si se borra la categoría, deja nulo
);

-- Tabla de usuarios: almacena cuentas de clientes y administradores
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,                      -- Identificador único del usuario
  nombre VARCHAR(100) NOT NULL,                           -- Nombre del usuario
  email VARCHAR(150) UNIQUE NOT NULL,                     -- Correo electrónico (único)
  contrasena VARCHAR(255) NOT NULL,                       -- Hash de la contraseña (no texto plano)
  telefono VARCHAR(20),                                   -- Teléfono de contacto
  direccion TEXT,                                         -- Dirección de envío/facturación
  rol ENUM('cliente', 'admin') DEFAULT 'cliente',         -- Rol del usuario en el sistema
  activo BOOLEAN DEFAULT TRUE,                            -- Indicador de cuenta activa/inactiva
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- Fecha de creación automática
);

-- Tabla de pedidos: órdenes de compra realizadas por usuarios
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,                                        -- Identificador único del pedido
  usuario_id INT NOT NULL,                                                  -- Referencia al usuario que realiza el pedido
  total DECIMAL(10, 2) NOT NULL,                                           -- Importe total del pedido
  estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente', -- Estado del pedido
  nombre_cliente VARCHAR(100),                                             -- Nombre del cliente que recibe el pedido
  apellido_cliente VARCHAR(100),                                           -- Apellido del cliente que recibe el pedido
  direccion_envio TEXT NOT NULL,                                           -- Dirección de envío para el pedido
  telefono_contacto VARCHAR(20),                                           -- Teléfono de contacto del comprador
  notas TEXT,                                                              -- Notas adicionales (opcional)
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                      -- Fecha de creación automática
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha de actualización automática
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE       -- Si se elimina el usuario, elimina sus pedidos
);

-- Tabla de detalles de pedidos: líneas de producto dentro de un pedido
CREATE TABLE IF NOT EXISTS detalles_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,                         -- Identificador único del detalle
  pedido_id INT NOT NULL,                                    -- Referencia al pedido padre
  producto_id INT NOT NULL,                                  -- Referencia al producto
  cantidad INT NOT NULL,                                     -- Unidades del producto en el pedido
  precio_unitario DECIMAL(10, 2) NOT NULL,                   -- Precio unitario al momento del pedido
  subtotal DECIMAL(10, 2) NOT NULL,                          -- cantidad * precio_unitario
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,   -- Si se elimina el pedido, elimina sus detalles
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE -- Si se elimina el producto, elimina sus detalles
);

-- Insertar categorías de ejemplo para poblar la base de datos inicial
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos y accesorios electrónicos'),
('Ropa', 'Prendas de vestir para toda la familia'),
('Hogar', 'Artículos para el hogar y decoración'),
('Deportes', 'Equipamiento deportivo y fitness'),
('Libros', 'Libros físicos y digitales');

-- Insertar usuario administrador de ejemplo (contraseña: admin123 ya hasheada)
INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES
('Administrador', 'admin@tienda.com', '$2a$10$D8jzkGPhpRmjujbvvcjipe62R1B1wmNl1cSY6IdvuJB.YzydeXuBq', 'admin');

-- Insertar productos de ejemplo para pruebas del catálogo
INSERT INTO productos (nombre, descripcion, precio, precio_anterior, stock, categoria_id, destacado) VALUES
('Smartphone Galaxy X', 'Teléfono inteligente de última generación con cámara de 108MP', 599.99, 699.99, 25, 1, TRUE),
('Laptop Pro 15', 'Laptop profesional con procesador i7 y 16GB RAM', 1299.99, NULL, 15, 1, TRUE),
('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 89.99, 119.99, 50, 1, FALSE),
('Camiseta Deportiva', 'Camiseta transpirable para actividades deportivas', 24.99, NULL, 100, 2, FALSE),
('Zapatillas Running', 'Zapatillas profesionales para correr', 79.99, 99.99, 40, 4, TRUE),
('Lámpara LED', 'Lámpara de escritorio con luz ajustable', 34.99, NULL, 60, 3, FALSE),
('Libro: Programación Web', 'Guía completa de desarrollo web moderno', 29.99, NULL, 30, 5, FALSE),
('Smartwatch Fit', 'Reloj inteligente con monitor de salud', 199.99, 249.99, 35, 1, TRUE);
