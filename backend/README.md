# Aqua Back-end (MariaDB + Firebase + MQTT)

## Requisitos
- Node 18+
- MariaDB corriendo (o MySQL compatible)
- Opcional: cuenta de Firebase (service account json)

## Instalación
1. Copia `.env.example` -> `.env` y rellena valores.
2. Coloca `config/serviceAccountKey.json` si usas Firebase (no subir a git).
3. Instala dependencias:
   npm install
4. Arranca en desarrollo:
   npm run dev

## Endpoints (ejemplos)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/fields
- POST /api/fields
- GET /api/sensors
- POST /api/sensors
- GET /api/irrigation
- POST /api/irrigation

## MQTT
Activa `MQTT_ENABLED=true` y configura broker en `.env`. Mensajes MQTT se guardan en Firestore (colección `mqtt_messages`) y si payload tiene `{ fieldId, type, value }` también se guarda en `sensors`.

