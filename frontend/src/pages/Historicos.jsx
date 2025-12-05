import { useEffect, useState } from "react";
import { db } from "../firebase/client";
import { collectionGroup, query, where, getDocs } from "firebase/firestore";

export default function Historicos() {
  const currentField = localStorage.getItem("currentField");
  
  // Estados del Calendario
  const [currentDate, setCurrentDate] = useState(new Date()); // Fecha del navegador (para saber qué mes pintar)
  const [selectedDate, setSelectedDate] = useState(null);     // Día que has clicado
  const [monthData, setMonthData] = useState([]);             // Todos los datos del mes actual
  const [loading, setLoading] = useState(false);

  // Estados de Visualización
  const [sectorsOnSelectedDate, setSectorsOnSelectedDate] = useState([]);
  const [selectedSectorData, setSelectedSectorData] = useState(null);

  // --- 1. CARGAR DATOS DEL MES ---
  useEffect(() => {
    if (!currentField) return;

    const fetchMonthData = async () => {
      setLoading(true);
      // Calcular primer y último día del mes visible en formato YYYY-MM-DD
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      
      const startStr = `${year}-${month}-01`;
      const endStr = `${year}-${month}-31`; // Firestore maneja bien esto aunque el mes tenga 30 días

      try {
        // Buscamos en TODOS los resúmenes de esta finca para este mes
        // Usamos la ruta jerárquica (collectionGroup 'resumen')
        const q = query(
          collectionGroup(db, "resumen"),
          where("fieldId", "==", Number(currentField)),
          where("date", ">=", startStr),
          where("date", "<=", endStr)
        );

        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => doc.data());
        setMonthData(docs);
        
        // Limpiamos selección al cambiar de mes
        setSelectedDate(null);
        setSectorsOnSelectedDate([]);
        setSelectedSectorData(null);

      } catch (err) {
        console.error("Error cargando histórico:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthData();
  }, [currentField, currentDate]); // Recargar si cambiamos de mes o de finca


  // --- 2. LÓGICA DEL CALENDARIO ---
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Domingo
    // Ajustar para que lunes sea el primero (opcional, aquí usamos Domingo como 0)
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const daysArray = [...Array(days).keys()].map(i => i + 1);
  const emptyStart = Array(firstDay).fill(null);

  // Helper para ver si un día tiene datos
  const hasData = (day) => {
    const checkDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthData.some(d => d.date === checkDate);
  };

  // --- 3. MANEJADORES ---
  const handleDayClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setSelectedSectorData(null); // Reseteamos detalle

    // Filtramos los sectores que tienen datos en ese día
    const sectors = monthData.filter(d => d.date === dateStr);
    setSectorsOnSelectedDate(sectors);
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  return (
    <div className="p-6 space-y-8 min-h-screen">
      
      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Histórico Climático</h2>
        <span className="bg-stone-800 text-gray-300 border border-gray-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Finca #{currentField}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* === COLUMNA IZQUIERDA: CALENDARIO === */}
        <div className="lg:col-span-1 bg-white/5 border border-white/10 p-6 rounded-2xl h-fit">
            {/* Controles Mes */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full text-white">←</button>
                <h3 className="text-xl font-bold text-white capitalize">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full text-white">→</button>
            </div>

            {/* Grid Días */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2 text-gray-400 font-medium">
                <div>D</div><div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {emptyStart.map((_, i) => <div key={`empty-${i}`} />)}
                
                {daysArray.map(day => {
                    const dataExists = hasData(day);
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;

                    return (
                        <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            disabled={!dataExists}
                            className={`
                                h-10 w-10 rounded-full flex items-center justify-center transition-all relative
                                ${isSelected 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50 scale-110' 
                                    : dataExists 
                                        ? 'bg-white/10 text-white hover:bg-white/20 cursor-pointer' 
                                        : 'text-gray-600 cursor-default'}
                            `}
                        >
                            {day}
                            {/* Punto indicador de datos */}
                            {dataExists && !isSelected && (
                                <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>
            
            {loading && <p className="text-center text-xs text-gray-500 mt-4 animate-pulse">Cargando datos...</p>}
        </div>

        {/* === COLUMNA DERECHA: RESULTADOS === */}
        <div className="lg:col-span-2 space-y-6">
            
            {!selectedDate ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/10 rounded-2xl p-10">
                    <span className="text-4xl mb-2">📅</span>
                    <p>Selecciona un día con punto verde para ver los datos.</p>
                </div>
            ) : (
                <>
                    <h3 className="text-xl font-bold text-gray-300 border-b border-white/10 pb-2">
                        Resumen del día: <span className="text-white">{selectedDate}</span>
                    </h3>

                    {/* LISTA DE SECTORES (Si hay datos) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sectorsOnSelectedDate.map((resumen) => (
                            <div 
                                key={resumen.sectorId}
                                onClick={() => setSelectedSectorData(resumen)}
                                className={`
                                    p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]
                                    ${selectedSectorData === resumen 
                                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500' 
                                        : 'bg-white/5 border-white/10 hover:border-white/30'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{resumen.sectorName || `Sector ${resumen.sectorId}`}</h4>
                                        <p className="text-xs text-gray-400">ID: {resumen.sectorId}</p>
                                    </div>
                                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">Ver Detalles →</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DETALLE DEL SECTOR SELECCIONADO */}
                    {selectedSectorData && (
                        <div className="bg-stone-800 rounded-2xl p-6 border border-white/10 shadow-2xl animate-fadeIn mt-6">
                            <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                📊 Datos: <span className="text-blue-400">{selectedSectorData.sectorName}</span>
                            </h4>

                            <div className="space-y-6">
                                {/* SECCIÓN TEMPERATURA */}
                                <div>
                                    <h5 className="text-sm text-gray-500 font-bold uppercase mb-3 border-b border-gray-700 pb-1">Temperatura</h5>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400">Media</p>
                                            <p className="text-2xl font-black text-white">{selectedSectorData.temperature?.avg}°</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400">Máxima</p>
                                            <p className="text-2xl font-black text-red-400">{selectedSectorData.temperature?.max}°</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400">Mínima</p>
                                            <p className="text-2xl font-black text-blue-400">{selectedSectorData.temperature?.min}°</p>
                                        </div>
                                    </div>
                                </div>

                                {/* SECCIÓN HUMEDAD (¡NUEVO!) */}
                                <div>
                                    <h5 className="text-sm text-gray-500 font-bold uppercase mb-3 border-b border-gray-700 pb-1">Humedad</h5>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400">Media</p>
                                            <p className="text-2xl font-black text-blue-100">{selectedSectorData.humidity?.avg}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400">Máxima</p>
                                            <p className="text-2xl font-black text-blue-300">{selectedSectorData.humidity?.max}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-gray-400">Mínima</p>
                                            <p className="text-2xl font-black text-blue-600">{selectedSectorData.humidity?.min}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}