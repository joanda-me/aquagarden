// services/mqtt.service.js
import mqtt from "mqtt";
import dotenv from "dotenv";
dotenv.config();

import { firestore } from "../config/firebaseAdmin.js";
import { sequelize } from "../config/mariadb.js";

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost:1883";
const topics = (process.env.MQTT_TOPICS || "sensors/#").split(",");

export function startMqtt() {
  try {
    console.log("➡️ Starting MQTT client...", brokerUrl);
    const client = mqtt.connect(brokerUrl, {
      username: process.env.MQTT_USERNAME || undefined,
      password: process.env.MQTT_PASSWORD || undefined,
      reconnectPeriod: 5000
    });

    client.on("connect", () => {
      console.log("✅ MQTT connected");
      topics.forEach((t) => {
        client.subscribe(t.trim(), (err) => {
          if (err) console.error("MQTT subscribe error", err);
          else console.log(`🔔 Subscribed to ${t.trim()}`);
        });
      });
    });

   client.on("message", async (topic, payload) => {
      try {
        const message = payload.toString();
        // ... parsing JSON ...
        let data;
        try { data = JSON.parse(message); } catch (e) { data = { raw: message }; }

        if (firestore) {
          // 1. GUARDAR EN HISTORIAL (Para las Gráficas) - ESTO YA LO TENÍAS
          // Se crea un documento nuevo cada vez
          if (data.fieldId && data.type && typeof data.value !== "undefined") {
            await firestore.collection("sensors").add({
              fieldId: data.fieldId,
              type: data.type,
              value: data.value,
              timestamp: new Date()
            });

            // 2. SOBRESCRIBIR ESTADO ACTUAL (Para los KPIs) - ¡NUEVO Y ÓPTIMO!
            // Actualizamos siempre el MISMO documento (ID = fieldId)
            // Usamos { merge: true } para no borrar el otro dato (si llega temp, no borra humedad)
            
            const docId = String(data.fieldId); // Ej: "1"
            const updatePayload = {
                [`last_${data.type}`]: data.value,   // Ej: last_temperatura: 24.5
                [`time_${data.type}`]: new Date(),   // Hora de este dato
                lastUpdate: new Date()               // Hora general
            };

            await firestore.collection("field_status").doc(docId).set(updatePayload, { merge: true });
          }
          
          // Guardar log raw (opcional, lo tenías antes)
          await firestore.collection("mqtt_messages").add({ topic, payload: data, receivedAt: new Date() });

        } else {
           console.warn("⚠️ Firestore not initialized");
        }
      } catch (err) {
        console.error("❌ Error handling MQTT message:", err);
      }
    });

    client.on("error", (err) => console.error("MQTT error:", err));
    client.on("reconnect", () => console.log("MQTT reconnecting..."));
  } catch (err) {
    console.error("❌ startMqtt error:", err);
  }
}
