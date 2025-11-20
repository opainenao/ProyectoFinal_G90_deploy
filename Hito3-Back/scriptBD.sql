-- Database: desafiofinal

-- DROP DATABASE IF EXISTS desafiofinal;

CREATE DATABASE desafiofinal
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;


CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  fono VARCHAR(20),
  direccion VARCHAR(255),
  contrasena TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_modifica TIMESTAMP DEFAULT NOW(),
  rol VARCHAR(20)
);

CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio INT NOT NULL,
  imagen_kit TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);


CREATE TABLE carrito_item (
  id SERIAL PRIMARY KEY,
  id_user INT REFERENCES usuarios(id),
  id_producto INT REFERENCES productos(id),
  cantidad INT NOT NULL DEFAULT 1
);

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES usuarios(id),
  estado VARCHAR(20) DEFAULT 'pagado',
  monto_total INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_modificacion TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pedidos_items (
  id SERIAL PRIMARY KEY,
  id_pedido INT REFERENCES pedidos(id),
  id_producto INT,
  cantidad INT NOT NULL,
  precio INT NOT NULL
);
	
