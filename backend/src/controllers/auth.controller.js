import { mariadbPool } from "../config/mariadb.js";
import { User } from "../models/user.model.js";

export async function register(req, res) {
  const { username, password, role } = req.body;

  try {
    const conn = await mariadbPool.getConnection();
    const hashed = await User.hashPassword(password);
    await conn.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashed, role || "farmer"]);
    conn.release();
    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;

  try {
    const conn = await mariadbPool.getConnection();
    const rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    conn.release();

    if (rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });
    const user = rows[0];

    const valid = await User.comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = User.generateToken(user);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
