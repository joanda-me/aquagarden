import cron from "node-cron";
import { firestore } from "../config/firebaseAdmin.js";
import Sector from "../models/sector.js"; 

export function initCronJobs() {
  console.log("⏰ Cron Jobs activados: Resumen Completo (Humedad Max/Min)");
  cron.schedule("5 0 * * *", async () => {
    console.log("🌙 Ejecutando Resumen Diario...");
    await generateDailySummaries();
  });
}

export async function generateDailySummaries(targetDate = null) {
  try {
    let dateObj;
    if (targetDate) {
        dateObj = new Date(targetDate);
    } else {
        dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - 1); // Ayer
    }
    dateObj.setHours(0, 0, 0, 0);
    
    const startOfDay = new Date(dateObj);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const dateId = dateObj.toISOString().split('T')[0];
    console.log(`📊 Generando resumen completo para: ${dateId}`);

    const sectors = await Sector.findAll({
      attributes: ['id_sector', 'id_campo', 'nombre_sector'] 
    });

    if (!sectors.length) {
        console.log("⚠️ No hay sectores en la base de datos SQL.");
        return;
    }

    for (const sector of sectors) {
      const { id_sector, id_campo, nombre_sector } = sector;
      
      const pathTemp = `fincas/${id_campo}/sectores/${id_sector}/sensores/temperatura/historial`;
      const pathHum = `fincas/${id_campo}/sectores/${id_sector}/sensores/humedad/historial`;

      // Consultas paralelas para ir más rápido
      const [snapTemp, snapHum] = await Promise.all([
        firestore.collection(pathTemp)
          .where("timestamp", ">=", startOfDay)
          .where("timestamp", "<=", endOfDay)
          .get(),
        firestore.collection(pathHum)
          .where("timestamp", ">=", startOfDay)
          .where("timestamp", "<=", endOfDay)
          .get()
      ]);

      if (snapTemp.empty && snapHum.empty) {
        continue;
      }

      // Función helper que ya calcula Max/Min/Avg
      const calculateStats = (snapshot) => {
        if (snapshot.empty) return { avg: null, max: null, min: null };
        let sum = 0, max = -Infinity, min = Infinity;
        
        snapshot.forEach(doc => {
            const val = Number(doc.data().value);
            if (!isNaN(val)) {
                sum += val;
                if(val > max) max = val;
                if(val < min) min = val;
            }
        });
        
        return {
            avg: Number((sum / snapshot.size).toFixed(1)),
            max: max === -Infinity ? null : max,
            min: min === Infinity ? null : min
        };
      };

      const statsTemp = calculateStats(snapTemp);
      const statsHum = calculateStats(snapHum);

      // GUARDAR RESUMEN (Ahora incluimos todo el objeto statsHum)
      const summaryPath = `fincas/${id_campo}/sectores/${id_sector}/resumen`;
      
      await firestore.collection(summaryPath).doc(dateId).set({
        fieldId: id_campo,
        sectorId: id_sector,
        sectorName: nombre_sector,
        date: dateId,
        createdAt: new Date(),
        temperature: statsTemp,
        humidity: statsHum // <--- CAMBIO: Ahora guarda { avg, max, min }
      });
      
      console.log(`   ✅ Resumen guardado en: ${summaryPath}/${dateId}`);
      
      // Limpieza (Opcional, descomentar si quieres borrar los datos crudos)
       await deleteInBatches(snapTemp);
       await deleteInBatches(snapHum);
    }

  } catch (error) {
    console.error("❌ Error en resumen diario:", error);
  }
}

async function deleteInBatches(snapshot) {
  if (snapshot.empty) return;
  const MAX_BATCH_SIZE = 500;
  const docs = snapshot.docs;
  const total = docs.length;
  for (let i = 0; i < total; i += MAX_BATCH_SIZE) {
    const batch = firestore.batch();
    const chunk = docs.slice(i, i + MAX_BATCH_SIZE);
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}