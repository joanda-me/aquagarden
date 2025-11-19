// models/field.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";
import User from "./user.model.js";

const Field = sequelize.define("Field", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING },
  meta: { type: DataTypes.JSON }
}, {
  tableName: "fields",
  timestamps: true
});

User.hasMany(Field, { foreignKey: "ownerId", as: "fields" });
Field.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

export default Field;
