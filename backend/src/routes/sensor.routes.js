// routes/sensor.routes.js
import express from "express";
import { getSensors, addSensor } from "../controllers/sensor.controller.js";
import { verifyToken } from "../middleware/verifytoken.middleware.js";
const router = express.Router();
router.get("/", verifyToken, getSensors);
router.post("/", verifyToken, addSensor);
export default router;
