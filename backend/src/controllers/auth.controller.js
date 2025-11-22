import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "8h";

export const register = async (req, res) => {
  try {
    // CAMBIO: Recibimos nombre y correo (según tu nuevo SQL)
    const { nombre, correo, password } = req.body;
    
    // Crear usuario
    const user = await User.create({ nombre, correo, password });
    
    res.json({ 
      id: user.id_usuario, 
      nombre: user.nombre, 
      correo: user.correo 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // CAMBIO: Buscar por correo (que es único en tu SQL)
    const user = await User.findOne({ where: { correo } });
    
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    // CAMBIO: El token ahora lleva 'id_usuario'
    const token = jwt.sign(
      { id_usuario: user.id_usuario, nombre: user.nombre }, 
      JWT_SECRET, 
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ 
      token, 
      user: { id: user.id_usuario, nombre: user.nombre, correo: user.correo } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};