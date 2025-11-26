-- backend/seed.sql

USE riego;

-- 1. Crear Usuario (Password: '123456' encriptada)
INSERT INTO usuarios (id_usuario, nombre, correo, password) 
VALUES (1, 'Admin', 'admin@aqua.com', '$2a$10$Xk.w/s.u/../hash_generado_por_bcrypt');

-- 2. Crear Dispositivo (El cerebro de la finca)
INSERT INTO dispositivos (id_dispositivo, nombre_dispositivo, token, modelo)
VALUES (1, 'Arduino Master', 'TOKEN_SECURE_123', 'ESP32-WROOM');

-- 3. Crear Finca (Vinculada al dispositivo)
INSERT INTO campos (id_campo, nombre_campo, ubicacion, id_dispositivo)
VALUES (1, 'Finca Experimental', 'Valencia, ES', 1);

-- 4. Asignar Finca al Usuario (Eres el dueño)
INSERT INTO usuario_campo (id_usuario, id_campo, rol_en_campo)
VALUES (1, 1, 'principal');

-- 5. Crear un Cultivo (Perfil de riego)
INSERT INTO cultivos (id_cultivo, nombre_cultivo, humedad_min, humedad_max, temp_min, temp_max)
VALUES (1, 'Tomate Cherry', 40.0, 70.0, 15.0, 30.0);

-- 6. Crear un Sector (Una zona específica de la finca)
INSERT INTO sectores (id_sector, nombre_sector, id_campo, id_cultivo, pin_valvula)
VALUES (1, 'Zona Norte - Goteo', 1, 1, 4); -- Pin 4 del Arduino activa esta válvula