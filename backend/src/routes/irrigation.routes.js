import express from "express";
import { getSchedules } from "../controllers/irrigation.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getSchedules);

export default router;
