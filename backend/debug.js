import { initDB, sequelize } from "./src/config/mariadb.js";
import Sector from "./src/models/sector.js";
import Field from "./src/models/field.js";
import setupAssociations from "./src/models/associations.js";

(async () => {
  console.log("\n🔍 INICIANDO DIAGNÓSTICO DE BASE DE DATOS...");
  try {
    await initDB();
    setupAssociations();

    // 1. Comprobar Fincas
    console.log("\n--- 1. FINCAS ---");
    const fields = await Field.findAll();
    if (fields.length === 0) {
        console.log("❌ NO HAY FINCAS. La tabla 'campos' está vacía.");
    } else {
        console.log(`✅ Se encontraron ${fields.length} fincas:`);
        fields.forEach(f => console.log(`   👉 [ID: ${f.id_campo}] Nombre: "${f.nombre_campo}"`));
    }

    // 2. Comprobar Sectores
    console.log("\n--- 2. SECTORES ---");
    const sectors = await Sector.findAll();
    if (sectors.length === 0) {
        console.log("❌ NO HAY SECTORES. La tabla 'sectores' está vacía.");
        console.log("💡 SOLUCIÓN: Ejecuta el seed.sql en phpMyAdmin o inserta datos manuales.");
    } else {
        console.log(`✅ Se encontraron ${sectors.length} sectores:`);
        sectors.forEach(s => {
            console.log(`   👉 [ID: ${s.id_sector}] "${s.nombre_sector}" pertenece a Finca ID: ${s.id_campo}`);
        });
    }

    // 3. Prueba de la consulta exacta que hace tu página
    console.log("\n--- 3. SIMULACIÓN DE TU PÁGINA ---");
    // Asumimos que buscas la finca 1 (que es la del seed)
    const testId = 1; 
    const pageSectors = await Sector.findAll({ where: { id_campo: testId } });
    
    if (pageSectors.length > 0) {
        console.log(`✅ La consulta para la Finca ${testId} FUNCIONA y devuelve ${pageSectors.length} sectores.`);
        console.log("🎉 CONCLUSIÓN: El Backend está perfecto. El problema está en el Frontend (localStorage o Token).");
    } else {
        console.log(`⚠️ La consulta para Finca ${testId} devuelve 0 resultados.`);
        console.log("💡 CONCLUSIÓN: Los sectores existen pero tienen mal el 'id_campo'. Revisa los IDs en el paso 2.");
    }

  } catch (error) {
    console.error("❌ ERROR CRÍTICO DEL BACKEND:", error.message);
    console.log("💡 Si dice 'Unknown column', es que el modelo Sector.js no coincide con la tabla SQL.");
  } finally {
    await sequelize.close();
  }
})();