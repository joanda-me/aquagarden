// models/irrigation.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";
import Field from "./field.model.js";

const IrrigationSchedule = sequelize.define("IrrigationSchedule", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sector: { type: DataTypes.STRING },
  cultivo: { type: DataTypes.STRING },
  inicio: { type: DataTypes.TIME },
  fin: { type: DataTypes.TIME },
  frecuencia: { type: DataTypes.STRING },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: "irrigation_schedule",
  timestamps: true
});

Field.hasMany(IrrigationSchedule, { foreignKey: "fieldId" });
IrrigationSchedule.belongsTo(Field, { foreignKey: "fieldId" });

export default IrrigationSchedule;
