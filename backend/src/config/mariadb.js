// config/mariadb.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "aquagarden",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mariadb",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

// import models (they register relations)
import User from "../models/user.model.js";
import Field from "../models/field.model.js";
import IrrigationSchedule from "../models/irrigation.model.js";

export async function initDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MariaDB");
    await sequelize.sync({ alter: true }); // provisional: creates/updates tables
    console.log("✅ Sequelize models synced");
  } catch (err) {
    console.error("❌ MariaDB connection error:", err);
    throw err;
  }
}
