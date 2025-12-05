import dotenv from "dotenv";
dotenv.config();
import { initFirebase, firestore } from "./src/config/firebaseAdmin.js";

(async () => {
  await initFirebase();

  // CONFIGURACIÓN MANUAL PARA PROBAR
  const FIELD_ID = 1;
  const SECTOR_ID = 1;
  
  // FECHA: AYER (4/12/2025 según tu contexto)
  const yesterday = new Date(); // Asume que hoy es 5
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);

  console.log(`🔍 BUSCANDO DATOS:`);
  console.log(`   📅 Desde: ${yesterday.toLocaleString()}`);
  console.log(`   📅 Hasta: ${endOfYesterday.toLocaleString()}`);
  console.log(`   📍 Sector ID: ${SECTOR_ID}`);

  try {
    // 1. PRUEBA DE CONSULTA
    const snapshot = await firestore.collectionGroup("historial")
      .where("sectorId", "==", SECTOR_ID)
      .where("timestamp", ">=", yesterday)
      .where("timestamp", "<=", endOfYesterday)
      .get();

    console.log(`\n📊 RESULTADO:`);
    console.log(`   👉 Se encontraron ${snapshot.size} documentos.`);

    if (snapshot.empty) {
      console.log("   ❌ PROBLEMA: La consulta no devuelve nada. Revisa:");
      console.log("      1. ¿Los documentos en 'historial' tienen el campo 'sectorId': 1?");
      console.log("      2. ¿La fecha del campo 'timestamp' es realmente del día 4?");
    } else {
      console.log("   ✅ ÉXITO: Los datos existen y son accesibles.");
      const sample = snapshot.docs[0].data();
      console.log("   📄 Ejemplo de dato:", JSON.stringify(sample));
      
      // Si existen, intentamos crear la ruta visible
      console.log("\n🛠️ REPARANDO RUTA VISUAL EN FIREBASE...");
      const resumenPath = `fincas/${FIELD_ID}/sectores/${SECTOR_ID}/resumen`;
      
      // Creamos los padres para que no sean fantasmas
      await firestore.doc(`fincas/${FIELD_ID}`).set({ _fixed: true }, { merge: true });
      await firestore.doc(`fincas/${FIELD_ID}/sectores/${SECTOR_ID}`).set({ _fixed: true }, { merge: true });
      
      console.log(`   ✅ Rutas padres creadas. Revisa ahora: ${resumenPath}`);
    }

  } catch (error) {
    console.error("❌ ERROR EN LA CONSULTA:", error.message);
    if (error.message.includes("requires an index")) {
      console.log("   🔗 FALTA EL ÍNDICE. Haz clic en el enlace del error para crearlo.");
    }
  }
})();