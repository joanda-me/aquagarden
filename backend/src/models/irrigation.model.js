import { mariadbPool } from "../config/mariadb.js";

export async function getAllIrrigationSchedules() {
  const conn = await mariadbPool.getConnection();
  const rows = await conn.query("SELECT * FROM irrigation_schedule");
  conn.release();
  return rows;
}
