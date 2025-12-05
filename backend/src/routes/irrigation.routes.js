import express from "express";
// Importamos la nueva función
import { getSchedules, addSchedule, toggleValve } from "../controllers/irrigation.controller.js"; 
import { verifyToken } from "../middleware/verifytoken.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getSchedules);
router.post("/", verifyToken, addSchedule);

// 👇 NUEVA RUTA DE CONTROL 👇
router.post("/valve", verifyToken, toggleValve);

export default router;