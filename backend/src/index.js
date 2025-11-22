// index.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import { initDB } from "./config/mariadb.js";
import { initFirebase } from "./config/firebaseAdmin.js";
import { startMqtt } from "./services/mqtt.service.js";

import authRoutes from "./routes/auth.routes.js";
import fieldsRoutes from "./routes/field.routes.js";
import sensorRoutes from "./routes/sensor.routes.js";
import irrigationRoutes from "./routes/irrigation.routes.js";

import setupAssociations from "./models/associations.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldsRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/irrigation", irrigationRoutes);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    // 1) DB (MariaDB)
    await initDB();
    // 2) Definir relaciones
    setupAssociations();

    // 3) Firebase Admin (provisional: solo si serviceAccount exists)
    await initFirebase();

    // 4) Start MQTT client if enabled
    if (process.env.MQTT_ENABLED === "true" || process.env.MQTT_ENABLED === "1") {
      startMqtt();
    }

    // 5) Start server
    app.listen(PORT, () => console.log(`✅ Backend listening on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
