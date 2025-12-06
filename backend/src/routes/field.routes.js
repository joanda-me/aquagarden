import express from "express";
import { 
    getFields, addField, updateField, deleteField, 
    getFieldSectors, addSector, deleteSector, updateSector 
} from "../controllers/field.controller.js";
import { verifyToken } from "../middleware/verifytoken.middleware.js";

const router = express.Router();

router.get("/", verifyToken, getFields);
router.post("/", verifyToken, addField);
router.put("/:id", verifyToken, updateField);
router.delete("/:id", verifyToken, deleteField);

// Rutas de Sectores
router.get("/:id/sectors", verifyToken, getFieldSectors);
router.post("/:id/sectors", verifyToken, addSector);
router.put("/sectors/:sectorId", verifyToken, updateSector); 
router.delete("/sectors/:sectorId", verifyToken, deleteSector);

export default router;