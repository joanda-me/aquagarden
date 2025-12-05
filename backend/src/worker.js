import dotenv from "dotenv";
dotenv.config();

import { initFirebase } from "./config/firebaseAdmin.js";
import { initDB } from "./config/mariadb.js"; // Necesario para leer sectores
import { startMqtt } from "./services/mqtt.service.js";
// IMPORTAMOS EL CRON
import { initCronJobs, generateDailySummaries } from "./services/summary.service.js";

(async () => {
  console.log("🚜 Iniciando Nodo de Finca (Worker)...");

  try {
    // 1. Conectar Bases de Datos
    await initFirebase(); 
    await initDB(); 

    // 2. Arrancar MQTT
    console.log("👂 Escuchando sensores locales...");
    startMqtt(); 

    // 3. Arrancar Reloj de Resúmenes
    initCronJobs();

    // --- PRUEBA RÁPIDA ---
    // Descomenta esto para generar el resumen de AYER ahora mismo y comprobar la ruta
    await generateDailySummaries(); 

  } catch (err) {
    console.error("❌ Error en el Nodo de Finca:", err);
    process.exit(1);
  }
})();