// routes/fields.routes.js
import express from "express";
import { getFields, addField, updateField, deleteField } from "../controllers/field.controller.js";
import { verifyToken } from "../middleware/verifytoken.middleware.js";
const router = express.Router();
router.get("/", verifyToken, getFields);
router.post("/", verifyToken, addField);
router.put("/:id", verifyToken, updateField);
router.delete("/:id", verifyToken, deleteField);
export default router;
