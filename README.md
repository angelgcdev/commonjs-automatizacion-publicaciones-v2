# Automatizacion_posts_facebook_V2

Esta aplicacion web automatiza la publicaciones de facebook es la misma que la otra version pero con login y base de datos

- Crear el archivo .env en el root del proyecto con el siguiente contenido:

DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=facebook_db
JWT_SECRET=tu_clave_secreta

PORT=4000

modificar la tabla en la base de datos de la siguiente forma:

ALTER TABLE posts ADD COLUMN activo BOOLEAN DEFAULT false;
# commonjs-automatizacion-publicaciones-v2
Este es el mismo proyecto de automatizaciones de facebook pero con CommonJS
