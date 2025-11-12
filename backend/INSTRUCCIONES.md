# Instrucciones de Instalación - Backend

## Paso 1: Instalar XAMPP

1. Descarga XAMPP desde https://www.apachefriends.org/
2. Instala XAMPP en tu computadora
3. Abre el Panel de Control de XAMPP
4. Inicia los servicios de **Apache** y **MySQL**

## Paso 2: Crear la Base de Datos

1. Abre tu navegador y ve a http://localhost/phpmyadmin
2. Haz clic en "Nueva" en el panel izquierdo
3. Nombre de la base de datos: `tienda_virtual`
4. Cotejamiento: `utf8mb4_unicode_ci`
5. Haz clic en "Crear"

## Paso 3: Importar las Tablas

1. Selecciona la base de datos `tienda_virtual` que acabas de crear
2. Haz clic en la pestaña "Importar"
3. Haz clic en "Seleccionar archivo"
4. Navega a `backend/configuracion/basedatos.sql`
5. Haz clic en "Continuar" al final de la página
6. Espera a que se complete la importación

## Paso 4: Configurar el Backend

1. Abre una terminal en la carpeta `backend`
2. Ejecuta: `npm install`
3. Copia el archivo `.env.ejemplo` y renómbralo a `.env`
4. Abre el archivo `.env` y verifica que las credenciales sean correctas:

```
PUERTO=3000
DB_HOST=localhost
DB_USUARIO=root
DB_CONTRASENA=
DB_NOMBRE=tienda_virtual
JWT_SECRETO=mi_clave_secreta_super_segura_2024
```

**Nota**: Si configuraste una contraseña para MySQL en XAMPP, agrégala en `DB_CONTRASENA`

## Paso 5: Iniciar el Servidor

En la terminal, dentro de la carpeta `backend`, ejecuta:

```bash
npm start
```

Deberías ver el mensaje:
```
Servidor corriendo en http://localhost:3000
```

## Verificar que Funciona

Abre tu navegador y ve a http://localhost:3000

Deberías ver:
```json
{"mensaje":"API Tienda Virtual funcionando correctamente"}
```

## Solución de Problemas

### Error: "Cannot connect to database"
- Verifica que MySQL esté corriendo en XAMPP
- Verifica las credenciales en el archivo `.env`
- Asegúrate de que la base de datos `tienda_virtual` exista

### Error: "Port 3000 already in use"
- Cambia el puerto en `.env` a otro número (ej: 3001)
- O cierra la aplicación que está usando el puerto 3000

### Error: "Module not found"
- Ejecuta `npm install` nuevamente
- Elimina la carpeta `node_modules` y ejecuta `npm install` de nuevo

## Datos de Prueba

La base de datos incluye:
- 5 categorías de ejemplo
- 8 productos de ejemplo
- 1 usuario administrador:
  - Email: admin@tienda.com
  - Contraseña: admin123

## Siguiente Paso

Una vez que el backend esté funcionando, continúa con la configuración del frontend.
