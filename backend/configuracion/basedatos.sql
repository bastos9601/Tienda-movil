-- Crear base de datos
CREATE DATABASE IF NOT EXISTS tienda_virtual CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tienda_virtual;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  precio_anterior DECIMAL(10, 2),
  stock INT DEFAULT 0,
  imagen VARCHAR(255),
  categoria_id INT,
  activo BOOLEAN DEFAULT TRUE,
  destacado BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  direccion TEXT,
  rol ENUM('cliente', 'admin') DEFAULT 'cliente',
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado') DEFAULT 'pendiente',
  direccion_envio TEXT NOT NULL,
  telefono_contacto VARCHAR(20),
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de detalles de pedidos
CREATE TABLE IF NOT EXISTS detalles_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- Insertar categorías de ejemplo
INSERT INTO categorias (nombre, descripcion) VALUES
('Electrónica', 'Dispositivos y accesorios electrónicos'),
('Ropa', 'Prendas de vestir para toda la familia'),
('Hogar', 'Artículos para el hogar y decoración'),
('Deportes', 'Equipamiento deportivo y fitness'),
('Libros', 'Libros físicos y digitales');

-- Insertar usuario admin de ejemplo (contraseña: admin123)
INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES
('Administrador', 'admin@tienda.com', '$2a$10$D8jzkGPhpRmjujbvvcjipe62R1B1wmNl1cSY6IdvuJB.YzydeXuBq', 'admin');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, precio_anterior, stock, categoria_id, destacado) VALUES
('Smartphone Galaxy X', 'Teléfono inteligente de última generación con cámara de 108MP', 599.99, 699.99, 25, 1, TRUE),
('Laptop Pro 15', 'Laptop profesional con procesador i7 y 16GB RAM', 1299.99, NULL, 15, 1, TRUE),
('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 89.99, 119.99, 50, 1, FALSE),
('Camiseta Deportiva', 'Camiseta transpirable para actividades deportivas', 24.99, NULL, 100, 2, FALSE),
('Zapatillas Running', 'Zapatillas profesionales para correr', 79.99, 99.99, 40, 4, TRUE),
('Lámpara LED', 'Lámpara de escritorio con luz ajustable', 34.99, NULL, 60, 3, FALSE),
('Libro: Programación Web', 'Guía completa de desarrollo web moderno', 29.99, NULL, 30, 5, FALSE),
('Smartwatch Fit', 'Reloj inteligente con monitor de salud', 199.99, 249.99, 35, 1, TRUE);
