import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";

const Field = sequelize.define("Field", {
  id_campo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_campo: { type: DataTypes.STRING(50), allowNull: false },
  ubicacion: { type: DataTypes.STRING(100) },
  // id_dispositivo es FK, se define en las asociaciones
}, {
  tableName: "campos",
  timestamps: false
});

export default Field;