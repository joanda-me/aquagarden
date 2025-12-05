import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Riegos() {
  const [sectores, setSectores] = useState([]);
  const [valveStates, setValveStates] = useState({}); // Guardamos el estado (abierto/cerrado) de cada válvula
  const currentField = localStorage.getItem("currentField");

  // 1. Cargar Sectores de la Finca
  useEffect(() => {
    if (!currentField) return;

    const fetchSectors = async () => {
      try {
        const token = localStorage.getItem("token");
        // Pedimos los sectores al backend
        const { data } = await api.get(`/fields/${currentField}/sectors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSectores(data);
        
        // Inicializamos el estado de las válvulas (por defecto cerradas visualmente)
        // Nota: En un futuro ideal, el backend debería decirnos si ya están abiertas.
        const initialStates = {};
        data.forEach(s => initialStates[s.id_sector] = false);
        setValveStates(initialStates);

      } catch (err) {
        console.error("Error cargando sectores:", err);
      }
    };
    fetchSectors();
  }, [currentField]);

  // 2. Función para Abrir/Cerrar Válvula (Llamada al Backend MQTT)
  const toggleValve = async (sectorId) => {
    const isCurrentlyOpen = valveStates[sectorId];
    const action = isCurrentlyOpen ? "CLOSE" : "OPEN";
    
    // Actualización "Optimista": Cambiamos el color antes de que responda el servidor para que se sienta rápido
    setValveStates(prev => ({ ...prev, [sectorId]: !isCurrentlyOpen }));

    try {
        const token = localStorage.getItem("token");
        
        // Enviamos la orden al endpoint que acabamos de crear
        await api.post("/irrigation/valve", {
            fieldId: currentField,
            sectorId: sectorId,
            action: action
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Orden ${action} enviada al sector ${sectorId}`);

    } catch (err) {
        console.error("Error enviando comando:", err);
        alert("Error de comunicación con la válvula. Inténtalo de nuevo.");
        // Si falla, revertimos el cambio visual
        setValveStates(prev => ({ ...prev, [sectorId]: isCurrentlyOpen }));
    }
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
        {sectores.map((sector) => {
          const isOpen = valveStates[sector.id_sector]; // ¿Está abierta?

          return (
            <div 
              key={sector.id_sector} 
              className={`bg-white/5 border transition-all duration-300 rounded-2xl p-6 group
                ${isOpen ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/10 hover:border-white/30'}
              `}
            >
              
              {/* Cabecera Sector */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-blue-400' : 'text-white'}`}>
                    {sector.nombre_sector}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                    <span>🌱</span> {sector.Crop?.nombre_cultivo || "Sin cultivo"}
                  </p>
                </div>
                <div className="bg-black/20 p-2 rounded-lg text-gray-500 font-mono text-xs">
                  PIN {sector.pin_valvula}
                </div>
              </div>

              {/* Estado y Control */}
              <div className="flex items-center justify-between mt-6 bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  {/* Led indicador */}
                  <div className={`w-3 h-3 rounded-full shadow-lg ${isOpen ? 'bg-green-500 animate-pulse shadow-green-500/50' : 'bg-red-900'}`}></div>
                  <span className={`text-sm font-medium ${isOpen ? 'text-green-400' : 'text-gray-500'}`}>
                    {isOpen ? "Riego Activo" : "Válvula Cerrada"}
                  </span>
                </div>
                
                {/* Botón Interruptor */}
                <button 
                  onClick={() => toggleValve(sector.id_sector)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all active:scale-95
                    ${isOpen 
                        ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/20" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20"}
                  `}
                >
                  {isOpen ? "Cerrar" : "Abrir"}
                </button>
              </div>

              {/* Footer (Programación - Futuro) */}
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-xs text-gray-500">Manual</span>
                  <button className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                      Configurar Horario <span>→</span>
                  </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {sectores.length === 0 && (
        <div className="flex flex-col items-center justify-center text-gray-500 py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <p className="text-lg">Esta finca no tiene sectores configurados.</p>
          <p className="text-sm mt-2 opacity-60">Añade sectores en la base de datos para controlarlos.</p>
        </div>
      )}
    </div>
  );
}