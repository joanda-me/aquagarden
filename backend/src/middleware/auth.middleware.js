// backend/middleware/verifyToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { authAdmin } from "../firebaseAdmin.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "Token requerido" });

  // Primero intenta JWT local
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (e) {
    // si falla jwt, prueba con Firebase token
  }

  // Intenta verificar como token de Firebase
  try {
    const decodedFirebase = await authAdmin.verifyIdToken(token);
    req.user = decodedFirebase;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
