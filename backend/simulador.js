import mqtt from "mqtt";

// Conexión al broker local (tu PC)
const client = mqtt.connect("mqtt://localhost:1883");

// CONFIGURACIÓN
const FIELD_ID = 1;      // ID de la finca en SQL
const INTERVALO_MS = 5000; // Enviar datos cada 5 segundos

// Variables para el ciclo simulado
let timeStep = 0; // Contador para simular el paso del tiempo

client.on("connect", () => {
  console.log("✅ Simulador Climático Conectado");
  console.log("📡 Enviando datos de Temperatura y Humedad...");

  setInterval(() => {
    // 1. Avanzamos el tiempo ficticio (Ciclo de 0 a 100 pasos)
    timeStep = (timeStep + 1) % 100;

    // 2. CÁLCULO DE TEMPERATURA (Curva Sinusoidal)
    // Simula un ciclo entre 15°C (noche) y 30°C (día)
    // Math.sin genera una onda suave (-1 a 1)
    const baseTemp = 22.5 + 7.5 * Math.sin((2 * Math.PI * timeStep) / 100);
    // Añadimos un poco de "ruido" aleatorio para que no sea perfecto (+/- 0.5 grados)
    const noiseTemp = (Math.random() - 0.5); 
    const currentTemp = Number((baseTemp + noiseTemp).toFixed(1));

    // 3. CÁLCULO DE HUMEDAD (Inversa a la temperatura)
    // Cuando hace calor, baja la humedad. Entre 40% y 80%.
    const baseHum = 60 - 20 * Math.sin((2 * Math.PI * timeStep) / 100);
    const noiseHum = (Math.random() - 0.5) * 3; 
    const currentHum = Number((baseHum + noiseHum).toFixed(1));

    // 4. PUBLICAR TEMPERATURA
    const dataTemp = {
      fieldId: FIELD_ID,
      type: "temperatura",
      value: currentTemp
    };
    client.publish("sensors/clima", JSON.stringify(dataTemp));

    // 5. PUBLICAR HUMEDAD (Un instante después para no saturar el log visual)
    const dataHum = {
      fieldId: FIELD_ID,
      type: "humedad",
      value: currentHum
    };
    client.publish("sensors/clima", JSON.stringify(dataHum));

    // Log bonito en consola
    console.log(`[Sim] 🌡️ ${currentTemp}°C  | 💧 ${currentHum}%  (Paso ${timeStep}/100)`);

  }, INTERVALO_MS);
});

client.on("error", (err) => console.error("❌ Error MQTT:", err));