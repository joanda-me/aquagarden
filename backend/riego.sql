-- Crear la base de datos principal
CREATE DATABASE riego CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE riego;

-- Crear tabla de usuarios
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'farmer') DEFAULT 'farmer'
);

-- Crear tabla de horarios de riego
CREATE TABLE irrigation_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sector VARCHAR(100) NOT NULL,
  cultivo VARCHAR(100),
  inicio TIME NOT NULL,
  fin TIME NOT NULL,
  frecuencia VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE
);

-- Crear tabla de logs de riego
CREATE TABLE logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  accion VARCHAR(255),
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
