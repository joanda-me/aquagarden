import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Riegos() {
  const [sectores, setSectores] = useState([]);
  const currentField = localStorage.getItem("currentField");

  // 1. Cargar Sectores de la Finca
  useEffect(() => {
    if (!currentField) return;

    const fetchSectors = async () => {
      try {
        const token = localStorage.getItem("token");
        // Llamamos al endpoint nuevo que acabamos de crear
        const { data } = await api.get(`/fields/${currentField}/sectors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSectores(data);
      } catch (err) {
        console.error("Error cargando sectores:", err);
      }
    };
    fetchSectors();
  }, [currentField]);

  // Función simulada para activar riego (la conectaremos a MQTT luego)
  const toggleValve = (sectorId, currentState) => {
    alert(`📡 Enviando señal a válvula del Sector ${sectorId}: ${!currentState ? 'ABRIR' : 'CERRAR'}`);
    // Aquí haremos la llamada real a la API más tarde
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Control de Riego</h2>
        <span className="bg-blue-900/50 text-blue-200 border border-blue-700/50 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Finca #{currentField}
        </span>
      </div>

      {/* GRID DE SECTORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sectores.map((sector) => (
          <div key={sector.id_sector} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-green-500/30 transition-colors group">
            
            {/* Cabecera Sector */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                  {sector.nombre_sector}
                </h3>
                <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                  <span>🌱</span> {sector.Crop?.nombre_cultivo || "Sin cultivo"}
                </p>
              </div>
              <div className="bg-black/20 p-2 rounded-lg text-gray-400 font-mono text-xs">
                PIN {sector.pin_valvula}
              </div>
            </div>

            {/* Estado y Control */}
            <div className="flex items-center justify-between mt-6 bg-black/20 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full animate-pulse bg-gray-500`}></div>
                <span className="text-sm font-medium text-gray-300">Válvula Cerrada</span>
              </div>
              
              {/* Botón Interruptor */}
              <button 
                onClick={() => toggleValve(sector.id_sector, false)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95"
              >
                Activar
              </button>
            </div>

            {/* Footer (Programación) */}
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-gray-500">Sin programación activa</span>
                <button className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                    Configurar Horario →
                </button>
            </div>

          </div>
        ))}
      </div>

      {sectores.length === 0 && (
        <div className="text-center text-gray-500 py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p>Esta finca no tiene sectores configurados.</p>
          <p className="text-sm mt-2">Añade sectores en la base de datos para verlos aquí.</p>
        </div>
      )}
    </div>
  );
}