// middleware/verifytoken.middleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { authAdmin } from "../config/firebaseAdmin.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_me";

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) return res.status(401).json({ error: "Token required" });

  // 1) Try local JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { ...decoded, authType: "jwt" };
    return next();
  } catch (e) {
    // fallthrough -> try firebase
  }

  // 2) Try Firebase ID token
  try {
    if (!authAdmin) throw new Error("Firebase Admin not initialized");
    const decodedFb = await authAdmin.verifyIdToken(token);
    req.user = { ...decodedFb, authType: "firebase" };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
