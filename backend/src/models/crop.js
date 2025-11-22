import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";

const Crop = sequelize.define("Crop", {
  id_cultivo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_cultivo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  humedad_min: { type: DataTypes.FLOAT, allowNull: false },
  humedad_max: { type: DataTypes.FLOAT, allowNull: false },
  temp_min: { type: DataTypes.FLOAT, allowNull: false },
  temp_max: { type: DataTypes.FLOAT, allowNull: false }
}, {
  tableName: "cultivos",
  timestamps: false
});

export default Crop;