import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";

const Sector = sequelize.define("Sector", {
  id_sector: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_sector: { type: DataTypes.STRING(50), allowNull: false },
  pin_valvula: { type: DataTypes.INTEGER, allowNull: false }
  // id_campo y id_cultivo son FKs
}, {
  tableName: "sectores",
  timestamps: false
});

export default Sector;