import { mariadbPool } from "../config/mariadb.js";

export async function getSchedules(req, res) {
  const conn = await mariadbPool.getConnection();
  const rows = await conn.query("SELECT * FROM irrigation_schedule");
  conn.release();
  res.json(rows);
}
