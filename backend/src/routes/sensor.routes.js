import express from "express";
import { getAllSensors, addSensorData } from "../controllers/sensor.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllSensors);
router.post("/", verifyToken, addSensorData);

export default router;
