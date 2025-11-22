import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";

const Device = sequelize.define("Device", {
  id_dispositivo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_dispositivo: { type: DataTypes.STRING(50), allowNull: false },
  token: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  modelo: { type: DataTypes.STRING(50), allowNull: false }
}, {
  tableName: "dispositivos",
  timestamps: false
});

export default Device;