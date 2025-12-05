import cron from "node-cron";
import { firestore } from "../config/firebaseAdmin.js";
// Usamos el Modelo Sector para evitar errores con el driver
import Sector from "../models/sector.js"; 

export function initCronJobs() {
  console.log("⏰ Cron Jobs activados: Resumen Jerárquico a las 00:05");
  cron.schedule("5 0 * * *", async () => {
    console.log("🌙 Ejecutando Resumen Diario...");
    await generateDailySummaries();
  });
}

export async function generateDailySummaries() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const dateId = yesterday.toISOString().split('T')[0]; // "2025-02-20"
    console.log(`📊 Generando resúmenes para: ${dateId}`);

    // 1. Obtener SECTORES desde MariaDB
    const sectors = await Sector.findAll({
      attributes: ['id_sector', 'id_campo', 'nombre_sector'] 
    });

    if (!sectors || sectors.length === 0) {
        console.log("⚠️ No hay sectores configurados en MariaDB.");
        return;
    }

    // 2. Iterar por cada SECTOR
    for (const sector of sectors) {
      const { id_sector, id_campo, nombre_sector } = sector;
      
      // Buscar datos históricos de este sector (usando collectionGroup)
      const snapshot = await firestore.collectionGroup("historial")
        .where("sectorId", "==", Number(id_sector))
        .where("timestamp", ">=", yesterday)
        .where("timestamp", "<=", endOfYesterday)
        .get();

      if (snapshot.empty) {
        continue; 
      }

      // 3. Calcular Estadísticas
      let tempSum = 0, tempCount = 0, tempMax = -Infinity, tempMin = Infinity;
      let humSum = 0, humCount = 0;

      snapshot.forEach(doc => {
        const d = doc.data();
        const val = Number(d.value);

        if (d.type === 'temperatura') {
          tempSum += val; tempCount++;
          if (val > tempMax) tempMax = val;
          if (val < tempMin) tempMin = val;
        } else if (d.type === 'humedad') {
          humSum += val; humCount++;
        }
      });

      // 4. GUARDADO JERÁRQUICO (El cambio que pediste)
      // Ruta: fincas/1/sectores/2/resumen/2025-02-20
      const summaryPath = `fincas/${id_campo}/sectores/${id_sector}/resumen`;
      
      await firestore.collection(summaryPath).doc(dateId).set({
        fieldId: id_campo,
        sectorId: id_sector,
        sectorName: nombre_sector,
        date: dateId,
        createdAt: new Date(),
        temperature: {
            avg: tempCount ? Number((tempSum / tempCount).toFixed(1)) : null,
            max: tempCount ? tempMax : null,
            min: tempCount ? tempMin : null
        },
        humidity: {
            avg: humCount ? Number((humSum / humCount).toFixed(1)) : null
        }
      });
      
      console.log(`   ✅ Resumen guardado en: ${summaryPath}/${dateId}`);
    }

  } catch (error) {
    console.error("❌ Error en resumen diario:", error);
  }
}