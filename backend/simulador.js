import mqtt from "mqtt";

// Al estar en local, atacamos a localhost. 
// En producción, aquí pondrías la IP pública de tu servidor.
const client = mqtt.connect("mqtt://localhost:1883");

client.on("connect", () => {
  console.log("✅ Conectado al Mosquitto Local");
  
  setInterval(() => {
    const data = {
      fieldId: 1, // Asegúrate que esta finca exista en SQL (ID 1)
      type: "humedad",
      value: Math.floor(Math.random() * 100)
    };
    
    client.publish("sensors/riego", JSON.stringify(data));
    console.log("📤 Enviado:", data);
  }, 10000);
});