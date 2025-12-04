import dotenv from "dotenv";
dotenv.config();

import { initFirebase } from "./config/firebaseAdmin.js";
import { startMqtt } from "./services/mqtt.service.js";

(async () => {
  console.log("🚜 Iniciando Nodo de Finca (Worker)...");

  try {
    // 1. Conectar a la Nube (Firebase)
    // Esto es vital: sin esto, el dato se queda en la finca y nadie lo ve.
    await initFirebase(); 

    // 2. Conectar al "Aire" local (MQTT)
    // Escucha a los sensores que gritan por el aire (o por cable)
    console.log("👂 Escuchando sensores locales...");
    startMqtt(); 

    // ¡Y ya está! No hay servidor web, no hay base de datos SQL local.
    // Este proceso se queda vivo eternamente procesando mensajes.
    
  } catch (err) {
    console.error("❌ Error en el Nodo de Finca:", err);
    process.exit(1);
  }
})();