// routes/irrigation.routes.js
import express from "express";
import { getSchedules, addSchedule } from "../controllers/irrigation.controller.js";
import { verifyToken } from "../middleware/verifytoken.middleware.js";
const router = express.Router();
router.get("/", verifyToken, getSchedules);
router.post("/", verifyToken, addSchedule);
export default router;
