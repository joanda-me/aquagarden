import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";
import bcrypt from "bcryptjs";

const User = sequelize.define("User", {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(50), allowNull: false },
  correo: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "usuarios",
  timestamps: false // Ya tienes fecha_registro
});

// Método para comparar contraseñas (Login)
User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Hook para encriptar antes de guardar
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

export default User;