import Crop from "../models/crop.js";

// Obtener lista
export const getCrops = async (req, res) => {
  try {
    const crops = await Crop.findAll();
    res.json(crops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear nuevo cultivo
export const addCrop = async (req, res) => {
  try {
    const { nombre_cultivo, humedad_min, humedad_max, temp_min, temp_max } = req.body;
    
    if (!nombre_cultivo) return res.status(400).json({ error: "Nombre requerido" });

    const newCrop = await Crop.create({
        nombre_cultivo,
        humedad_min: humedad_min || 40,
        humedad_max: humedad_max || 80,
        temp_min: temp_min || 10,
        temp_max: temp_max || 35
    });
    
    res.json(newCrop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};