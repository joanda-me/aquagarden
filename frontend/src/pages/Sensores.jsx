import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../firebase/client";
import { doc, onSnapshot } from "firebase/firestore"; 

// Importamos las gráficas
import TemperatureChart from "../components/TemperatureChart";
import HumidityChart from "../components/HumidityChart";

export default function Sensores() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [solarData, setSolarData] = useState({ current: "--", total: "--", percent: 0 });
  
  const currentField = localStorage.getItem("currentField");

  // 1. API SOLAR
  useEffect(() => {
    const fetchSolarData = async () => {
      try {
        const lat = 39.4699; 
        const lng = -0.3763;
        const response = await axios.get(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
        const { sunrise, sunset, day_length } = response.data.results;

        const now = new Date();
        const sunriseDate = new Date(sunrise);
        const sunsetDate = new Date(sunset);
        const dayLengthSeconds = response.data.results.day_length;

        let secondsPassed = 0;
        if (now < sunriseDate) secondsPassed = 0;
        else if (now > sunsetDate) secondsPassed = dayLengthSeconds;
        else secondsPassed = (now - sunriseDate) / 1000;

        const hCurr = Math.floor(secondsPassed / 3600);
        const mCurr = Math.floor((secondsPassed % 3600) / 60);
        const hTotal = Math.floor(dayLengthSeconds / 3600);
        const mTotal = Math.floor((dayLengthSeconds % 3600) / 60);
        const pct = Math.min(100, Math.max(0, (secondsPassed / dayLengthSeconds) * 100));

        setSolarData({
          current: `${hCurr}h ${mCurr}m`,
          total: `${hTotal}h ${mTotal}m`,
          percent: pct
        });
      } catch (err) { console.error("Error Solar API", err); }
    };
    fetchSolarData();
    const interval = setInterval(fetchSolarData, 60000); 
    return () => clearInterval(interval);
  }, []);

  // 2. SENSORES (Tiempo Real)
  useEffect(() => {
    if (!currentField) return;
    const docRef = doc(db, "field_status", String(currentField));
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentStatus({
            temp: data.last_temperatura,
            hum: data.last_humedad,
            timeTemp: data.time_temperatura?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            timeHum: data.time_humedad?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
      }
    });
    return () => unsubscribe();
  }, [currentField]);

  return (
    <div className="p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Monitor de Cultivo</h2>
        <span className="bg-stone-800 text-gray-300 border border-gray-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Finca #{currentField}
        </span>
      </div>
      
      {/* --- GRID DE TARJETAS (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. TEMPERATURA (Gris Plata) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 p-6 rounded-2xl text-white shadow-2xl group transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 opacity-20 text-white group-hover:opacity-30 transition-opacity">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>
            </div>
            <h3 className="font-bold uppercase tracking-wider text-gray-400 text-xs mb-3">Temperatura Aire</h3>
            <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black text-white">{currentStatus?.temp ?? "--"}</p>
                 <span className="text-lg font-medium text-gray-400">°C</span>
            </div>
            <div className="mt-3 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300" style={{ width: `${Math.min(100, (currentStatus?.temp || 0) * 2)}%` }}></div>
            </div>
             <p className="text-xs text-gray-500 mt-2 text-right font-mono">{currentStatus?.timeTemp || "--:--"}</p>
        </div>

        {/* 2. CICLO SOLAR (Naranja) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-900/80 to-amber-900/50 border border-orange-500/30 p-6 rounded-2xl text-white shadow-xl group transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 opacity-20 text-yellow-400 group-hover:opacity-30 transition-opacity">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>
            </div>
            <h3 className="font-bold uppercase tracking-wider text-orange-300 text-xs mb-3">Ciclo Solar</h3>
            <div className="flex justify-between items-end mb-1">
                 <p className="text-xs text-gray-400">Luz Actual</p>
                 <p className="text-2xl font-black">{solarData.current}</p>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full mb-3 overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${solarData.percent}%` }}></div>
            </div>
            <div className="flex justify-between text-xs">
                <span className="text-gray-500">Previsto:</span>
                <span className="font-bold text-yellow-100">{solarData.total}</span>
            </div>
        </div>

        {/* 3. HUMEDAD (Azul) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/80 to-cyan-900/50 border border-blue-500/30 p-6 rounded-2xl text-white shadow-xl group transition-all hover:scale-[1.02]">
            <div className="absolute -right-6 -top-6 opacity-20 text-blue-400 group-hover:opacity-30 transition-opacity">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </div>
            <h3 className="font-bold uppercase tracking-wider text-blue-300 text-xs mb-3">Humedad Relativa</h3>
            <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black text-white">{currentStatus?.hum ?? "--"}</p>
                 <span className="text-lg font-medium text-gray-400">%</span>
            </div>
            <div className="mt-3 w-full h-1 bg-blue-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: `${currentStatus?.hum || 0}%` }}></div>
            </div>
             <p className="text-xs text-gray-400 mt-2 text-right font-mono">{currentStatus?.timeHum || "--:--"}</p>
        </div>

        {/* 4. ESPACIO VACÍO */}
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 border-dashed p-6 rounded-2xl text-gray-500 min-h-[160px] hover:bg-white/10 transition-colors cursor-default">
             <span className="text-4xl mb-2 opacity-20">🌱</span>
            <p className="text-sm font-medium">Espacio Disponible</p>
        </div>

      </div>

      {/* --- GRÁFICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureChart fieldId={currentField} />
        <HumidityChart fieldId={currentField} />
      </div>
      
    </div>
  );
}