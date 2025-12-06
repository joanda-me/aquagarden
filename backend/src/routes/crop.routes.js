import express from "express";
import { getCrops, addCrop } from "../controllers/crop.controller.js";
import { verifyToken } from "../middleware/verifytoken.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getCrops);
router.post("/", verifyToken, addCrop);

export default router;