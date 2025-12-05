import IrrigationSchedule from "../models/irrigationProgram.js";
import mqtt from "mqtt";

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://mosquitto:1883";

// --- FUNCIONES SQL (Base de Datos) ---

// 1. Obtener todos los horarios
export const getSchedules = async (req, res) => {
  try {
    const schedules = await IrrigationSchedule.findAll();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Crear un nuevo horario
export const addSchedule = async (req, res) => {
  try {
    const data = req.body;
    const s = await IrrigationSchedule.create(data);
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- FUNCIONES MQTT (Control en Tiempo Real) ---

// 3. Abrir/Cerrar Válvula
export const toggleValve = async (req, res) => {
  try {
    const { fieldId, sectorId, action } = req.body; // action: "OPEN" o "CLOSE"
    
    if (!fieldId || !sectorId || !action) {
        return res.status(400).json({ error: "Faltan datos (fieldId, sectorId, action)" });
    }

    const client = mqtt.connect(brokerUrl);

    client.on("connect", () => {
        const topic = `fincas/${fieldId}/sectores/${sectorId}/valvula/set`;
        const payload = JSON.stringify({ action }); 

        client.publish(topic, payload, { qos: 1 }, (err) => {
            client.end(); 
            if (err) {
                console.error("Error publicando MQTT:", err);
                return res.status(500).json({ error: "Fallo al enviar comando" });
            }
            console.log(`📡 Comando enviado: ${topic} -> ${payload}`);
            res.json({ success: true, message: `Válvula ${action} enviada` });
        });
    });

    client.on("error", (err) => {
        client.end();
        console.error("Error conexión MQTT en controlador:", err);
        res.status(500).json({ error: "Error conexión MQTT" });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};