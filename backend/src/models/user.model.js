// models/user.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/mariadb.js";
import bcrypt from "bcryptjs";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin","farmer"), defaultValue: "farmer" }
}, {
  tableName: "users",
  timestamps: true
});

User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default User;
