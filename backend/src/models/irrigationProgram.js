import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";

const IrrigationProgram = sequelize.define("IrrigationProgram", {
  id_programa: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_programa: { type: DataTypes.STRING(50), allowNull: false },
  hora_inicio: { type: DataTypes.TIME, allowNull: false },
  duracion_min: { type: DataTypes.INTEGER, allowNull: false },
  frecuencia_dias: { type: DataTypes.INTEGER, allowNull: false },
  condicion_auto: { type: DataTypes.STRING(100) },
  // id_sector es FK
}, {
  tableName: "programa_riego",
  timestamps: false
});

export default IrrigationProgram;