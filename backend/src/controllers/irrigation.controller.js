// controllers/irrigation.controller.js
import IrrigationSchedule from "../models/irrigationProgram.js";

export const getSchedules = async (req, res) => {
  try {
    const schedules = await IrrigationSchedule.findAll();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addSchedule = async (req, res) => {
  try {
    const data = req.body;
    const s = await IrrigationSchedule.create(data);
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
