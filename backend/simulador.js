import mqtt from "mqtt";

// Conexión al broker local (tu PC)
const client = mqtt.connect("mqtt://localhost:1883");

// CONFIGURACIÓN DE LA FINCA
const FIELD_ID = 1;      
const SECTOR_ID = 1;     
const INTERVALO_MS = 5000; // Cada 5 segundos

// Variable para simular el paso del tiempo (ciclo día/noche)
let timeStep = 0; 

client.on("connect", () => {
  console.log("✅ Simulador Conectado: Modo Full Duplex (Hablar y Escuchar)");

  // --- 1. PARTE "OÍDOS" (Escuchar órdenes de la web) ---
  // Nos suscribimos para saber si alguien toca el botón de riego
  const topicOrdenes = `fincas/${FIELD_ID}/sectores/+/valvula/set`;
  
  client.subscribe(topicOrdenes, (err) => {
    if (!err) {
        console.log(`👂 Escuchando órdenes en: ${topicOrdenes}`);
        console.log("------------------------------------------------");
    } else {
        console.error("❌ Error al suscribirse:", err);
    }
  });

  // --- 2. PARTE "BOCA" (Enviar datos climáticos) ---
  setInterval(() => {
    // Avanzamos el reloj ficticio
    timeStep = (timeStep + 1) % 100;

    // A) Calcular Temperatura (Curva suave 15ºC - 30ºC)
    const baseTemp = 22.5 + 7.5 * Math.sin((2 * Math.PI * timeStep) / 100);
    const currentTemp = Number((baseTemp + (Math.random() - 0.5)).toFixed(1));

    // B) Calcular Humedad (Inversa a la temperatura, 40% - 80%)
    const baseHum = 60 - 20 * Math.sin((2 * Math.PI * timeStep) / 100);
    const currentHum = Number((baseHum + (Math.random() - 0.5) * 3).toFixed(1));

    // C) Definir rutas (Topics)
    const topicTemp = `fincas/${FIELD_ID}/sectores/${SECTOR_ID}/temperatura`;
    const topicHum = `fincas/${FIELD_ID}/sectores/${SECTOR_ID}/humedad`;

    // D) Enviar datos (Publicar)
    client.publish(topicTemp, JSON.stringify({ value: currentTemp }));
    client.publish(topicHum, JSON.stringify({ value: currentHum }));

    // E) LOG VISUAL (Lo que te gustaba ver)
    console.log(`📤 Enviando Clima:  🌡️ ${currentTemp}°C  |  💧 ${currentHum}%`);

  }, INTERVALO_MS);
});

// --- GESTIÓN DE MENSAJES RECIBIDOS ---
client.on("message", (topic, message) => {
  // Filtramos para que solo reaccione a órdenes de válvulas
  if (topic.includes("valvula/set")) {
      try {
          const payload = JSON.parse(message.toString());
          // Sacamos el ID del sector de la ruta del topic
          const parts = topic.split("/");
          const sectorAfectado = parts[3]; 

          console.log("\n🔔 ¡DING DONG! ORDEN RECIBIDA DESDE LA WEB");
          console.log(`   📍 Objetivo: Sector ${sectorAfectado}`);
          console.log(`   ⚙️ Acción:   ${payload.action === 'OPEN' ? 'ABRIR 🌊' : 'CERRAR 🛑'} VÁLVULA`);
          console.log("------------------------------------------------\n");
          
      } catch (e) {
          console.error("Error leyendo orden:", e);
      }
  }
});

client.on("error", (err) => console.error("❌ Error MQTT:", err));