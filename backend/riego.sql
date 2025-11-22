-- 1. Crear la base de datos
DROP DATABASE IF EXISTS riego; -- Opcional: Para empezar limpio
CREATE DATABASE riego CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE riego;

-- 2. Tablas independientes (sin dependencias)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE cultivos (
    id_cultivo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cultivo VARCHAR(50) NOT NULL UNIQUE,
    humedad_min FLOAT NOT NULL,
    humedad_max FLOAT NOT NULL,
    temp_min FLOAT NOT NULL,
    temp_max FLOAT NOT NULL
) ENGINE=InnoDB; -- Coma corregida

CREATE TABLE dispositivos (
    id_dispositivo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_dispositivo VARCHAR(50) NOT NULL,
    token VARCHAR(100) NOT NULL UNIQUE,
    modelo VARCHAR(50) NOT NULL
) ENGINE=InnoDB; -- Movido antes de campos

CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accion VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tablas con dependencias de nivel 1
CREATE TABLE campos (
    id_campo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_campo VARCHAR(50) NOT NULL,
    ubicacion VARCHAR(100),
    id_dispositivo INT UNIQUE, -- Puede ser NULL si creas el campo antes de comprar el sensor
    FOREIGN KEY (id_dispositivo) REFERENCES dispositivos(id_dispositivo)
        ON DELETE SET NULL -- Si borras dispositivo, el campo se queda sin hardware, pero no se borra
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Tablas con dependencias de nivel 2 (Intermedias y Detalle)
CREATE TABLE usuario_campo (
    id_usuario INT NOT NULL,
    id_campo INT NOT NULL,
    rol_en_campo ENUM('principal', 'subordinado') NOT NULL,

    PRIMARY KEY (id_usuario, id_campo),

    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE,
        
    FOREIGN KEY (id_campo) REFERENCES campos(id_campo)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sectores (
    id_sector INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sector VARCHAR(50) NOT NULL,
    id_campo INT NOT NULL,
    id_cultivo INT, -- Puede ser NULL si está en barbecho (sin cultivo)
    pin_valvula INT NOT NULL, -- Importante para saber qué relé activar

    FOREIGN KEY (id_campo) REFERENCES campos(id_campo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (id_cultivo) REFERENCES cultivos(id_cultivo)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 5. Tablas con dependencias de nivel 3
CREATE TABLE programa_riego (
    id_programa INT AUTO_INCREMENT PRIMARY KEY,
    nombre_programa VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    duracion_min INT NOT NULL,
    frecuencia_dias INT NOT NULL,
    condicion_auto VARCHAR(100),
    id_sector INT NOT NULL,

    FOREIGN KEY (id_sector) REFERENCES sectores(id_sector)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- INSERT DE PRUEBA (Para que no empieces vacío)
INSERT INTO usuarios (nombre, correo, password) VALUES ('Admin', 'admin@aqua.com', '$2a$10$Xk.w/s.u/../hash_generado_por_bcrypt');