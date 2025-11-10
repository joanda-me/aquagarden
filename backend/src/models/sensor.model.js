import mongoose from "mongoose";

const sensorSchema = new mongoose.Schema({
  sector: { type: String, required: true },
  tipo: { type: String, required: true }, // temperatura, humedad, viento
  valor: { type: Number, required: true },
  fecha: { type: Date, default: Date.now }
});

export const Sensor = mongoose.model("Sensor", sensorSchema);
