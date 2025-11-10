import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { mariadbPool } from "./config/mariadb.js";
import "./config/mongodb.js"; // solo importa para conectar
import authRoutes from "./routes/auth.routes.js";
import sensorRoutes from "./routes/sensor.routes.js";
import irrigationRoutes from "./routes/irrigation.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("🌾 API Telegestión de Riego funcionando"));
app.use("/api/auth", authRoutes);
app.use("/api/sensors", sensorRoutes);
app.use("/api/irrigation", irrigationRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
