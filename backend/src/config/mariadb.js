// config/mariadb.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "riego",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "admin",
  {
    host: process.env.DB_HOST || "mariadb",
    port: process.env.DB_PORT || 3306,
    dialect: "mariadb",
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

// NOTA: Hemos eliminado los imports de modelos aquí para evitar el error circular.
// Los modelos se cargarán automáticamente cuando index.js cargue las rutas.

export async function initDB() {
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Connected to MariaDB");
      await sequelize.sync({ alter: true });
      console.log("✅ Sequelize models synced");
      return; // Éxito, salimos de la función
    } catch (err) {
      console.error(`⚠️ MariaDB connection failed. Retries left: ${retries}`, err.message);
      retries -= 1;
      console.log("⏳ Waiting 5 seconds...");
      // Esperar 5 segundos antes de reintentar (evita que falle al instante)
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  console.error("❌ Could not connect to MariaDB after multiple attempts.");
  process.exit(1); // Forzamos el reinicio del contenedor si falla todo
}