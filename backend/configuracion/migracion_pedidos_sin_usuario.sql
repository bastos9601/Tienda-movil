-- Migración: Permitir pedidos sin usuario registrado
-- Ejecuta este script en tu base de datos para permitir compras sin autenticación

-- 1. Eliminar la restricción de clave foránea existente
ALTER TABLE pedidos DROP FOREIGN KEY pedidos_ibfk_1;

-- 2. Modificar la columna usuario_id para permitir NULL
ALTER TABLE pedidos MODIFY COLUMN usuario_id INT NULL;

-- 3. Hacer que nombre_cliente, apellido_cliente y telefono_contacto sean obligatorios
ALTER TABLE pedidos MODIFY COLUMN nombre_cliente VARCHAR(100) NOT NULL;
ALTER TABLE pedidos MODIFY COLUMN apellido_cliente VARCHAR(100) NOT NULL;
ALTER TABLE pedidos MODIFY COLUMN telefono_contacto VARCHAR(20) NOT NULL;

-- 4. Recrear la clave foránea con ON DELETE SET NULL
ALTER TABLE pedidos 
ADD CONSTRAINT pedidos_ibfk_1 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Verificar los cambios
DESCRIBE pedidos;
