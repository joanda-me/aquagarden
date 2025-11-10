import mariadb from 'mariadb';
import dotenv from 'dotenv';
dotenv.config();

export const mariadbPool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

(async () => {
  try {
    const conn = await mariadbPool.getConnection();
    console.log("✅ Conectado a MariaDB");
    conn.release();
  } catch (err) {
    console.error("❌ Error de conexión a MariaDB:", err);
  }
})();
