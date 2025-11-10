import { Sensor } from "../models/sensor.model.js";

export async function getAllSensors(req, res) {
  const data = await Sensor.find().sort({ fecha: -1 }).limit(50);
  res.json(data);
}

export async function addSensorData(req, res) {
  const { sector, tipo, valor } = req.body;
  const newSensor = new Sensor({ sector, tipo, valor });
  await newSensor.save();
  res.json({ message: "Dato de sensor guardado" });
}
