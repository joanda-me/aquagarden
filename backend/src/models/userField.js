import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";

const UserField = sequelize.define("UserField", {
  rol_en_campo: { 
    type: DataTypes.ENUM('principal', 'subordinado'), 
    allowNull: false 
  }
}, {
  tableName: "usuario_campo",
  timestamps: false
});

export default UserField;