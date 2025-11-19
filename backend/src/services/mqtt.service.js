// services/mqtt.service.js
import mqtt from "mqtt";
import dotenv from "dotenv";
dotenv.config();

import { firestore } from "../config/firebaseAdmin.js";
import { sequelize } from "../config/mariadb.js";

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com";
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
        console.log("📥 MQTT message", topic, message);

        // Try parse JSON
        let data;
        try { data = JSON.parse(message); } catch (e) { data = { raw: message }; }

        // Build doc for Firestore
        const doc = {
          topic,
          payload: data,
          receivedAt: new Date()
        };

        if (firestore) {
          await firestore.collection("mqtt_messages").add(doc);
          // If payload follows sensor format, write to sensors
          if (data.fieldId && data.type && typeof data.value !== "undefined") {
            await firestore.collection("sensors").add({
              fieldId: data.fieldId,
              type: data.type,
              value: data.value,
              timestamp: new Date()
            });
          }
        } else {
          console.warn("⚠️ Firestore not initialized - MQTT message not saved to Firestore");
        }

        // Optional: also write a lightweight log in SQL (if you have a table)
        // Example: await sequelize.query("INSERT INTO mqtt_logs(topic, payload) VALUES (?, ?)", { replacements: [topic, JSON.stringify(data)] });

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
