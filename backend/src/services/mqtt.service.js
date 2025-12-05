import mqtt from "mqtt";
import dotenv from "dotenv";
dotenv.config();

import { firestore } from "../config/firebaseAdmin.js";

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://mosquitto:1883";
const topics = ["fincas/#"]; 

export function startMqtt() {
  try {
    console.log("➡️ Starting MQTT client...", brokerUrl);
    const client = mqtt.connect(brokerUrl, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 5000
    });

    client.on("connect", () => {
      console.log("✅ MQTT connected");
      client.subscribe(topics);
    });

    client.on("message", async (topic, payload) => {
      try {
        // Topic: "fincas/{fieldId}/sectores/{sectorId}/..."
        const parts = topic.split("/");
        
        if (parts[0] === "fincas" && parts[2] === "sectores" && parts.length === 5) {
            const fieldId = parts[1];
            const sectorId = parts[3];
            const sensorType = parts[4]; 
            
            let data;
            try { data = JSON.parse(payload.toString()); } catch { data = { value: payload.toString() }; }
            
            const val = Number(data.value);
            const now = new Date();

            if (firestore) {
                // 1. HISTORIAL (Guardamos sectorId también)
                const historyPath = `fincas/${fieldId}/sectores/${sectorId}/sensores/${sensorType}/historial`;
                
                await firestore.collection(historyPath).add({
                    value: val,
                    timestamp: now,
                    fieldId: Number(fieldId),
                    sectorId: Number(sectorId), // <--- ¡NUEVO E IMPORTANTE!
                    type: sensorType        
                });

                // 2. ESTADO ACTUAL (Actualizamos status general de la finca)
                // (Opcional: Podrías crear un 'sector_status' si quisieras KPIs por sector en el futuro)
                await firestore.collection("field_status").doc(fieldId).set({
                    [`last_${sensorType}`]: val,
                    [`time_${sensorType}`]: now,
                    lastUpdate: now
                }, { merge: true });
            }
        }
      } catch (err) {
        console.error("❌ Error processing message:", err);
      }
    });

    client.on("error", (err) => console.error("MQTT error:", err));
  } catch (err) {
    console.error("❌ startMqtt error:", err);
  }
}