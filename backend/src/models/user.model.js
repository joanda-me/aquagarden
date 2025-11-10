import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export class User {
  constructor(id, username, password, role = "farmer") {
    this.id = id;
    this.username = username;
    this.password = password;
    this.role = role;
  }

  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async comparePassword(password, hashed) {
    return await bcrypt.compare(password, hashed);
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
  }
}
