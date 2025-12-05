import { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../firebase/client";
import { doc, onSnapshot } from "firebase/firestore"; 

// Gráficas
import TemperatureChart from "../components/TemperatureChart";
import HumidityChart from "../components/HumidityChart";

// Helper para iconos de clima
const getWeatherInfo = (code) => {
    if (code === 0) return { label: "Despejado", icon: "☀️", color: "text-yellow-400", bg: "from-blue-400/20 to-yellow-400/10 border-yellow-400/30" };
    if (code >= 1 && code <= 3) return { label: "Nuboso", icon: "☁️", color: "text-gray-300", bg: "from-gray-600/40 to-slate-700/40 border-gray-500/30" };
    if (code >= 45 && code <= 48) return { label: "Niebla", icon: "🌫️", color: "text-slate-400", bg: "from-slate-600/40 to-gray-700/40 border-slate-500/30" };
    if (code >= 51 && code <= 67) return { label: "Lluvia", icon: "🌧️", color: "text-blue-400", bg: "from-blue-900/40 to-cyan-900/40 border-blue-500/30" };
    if (code >= 95) return { label: "Tormenta", icon: "⚡", color: "text-purple-400", bg: "from-purple-900/40 to-indigo-900/40 border-purple-500/30" };
    return { label: "Desconocido", icon: "❓", color: "text-gray-500", bg: "bg-white/5 border-white/10" };
};

export default function Sensores() {
  const [currentStatus, setCurrentStatus] = useState(null);
  const [solarData, setSolarData] = useState({ current: "--", total: "--", percent: 0, sunrise: "--:--", sunset: "--:--" });
  const [weatherData, setWeatherData] = useState(null);
  
  const currentField = localStorage.getItem("currentField");

  // 1. API SOLAR + CLIMA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const lat = 39.4699; 
        const lng = -0.3763;

        // A) SOL
        const solRes = await axios.get(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
        const { sunrise, sunset, day_length } = solRes.data.results;

        const now = new Date();
        const sunriseDate = new Date(sunrise);
        const sunsetDate = new Date(sunset);
        
        let secondsPassed = 0;
        if (now < sunriseDate) secondsPassed = 0;
        else if (now > sunsetDate) secondsPassed = day_length;
        else secondsPassed = (now - sunriseDate) / 1000;

        const hCurr = Math.floor(secondsPassed / 3600);
        const mCurr = Math.floor((secondsPassed % 3600) / 60);
        const hTotal = Math.floor(day_length / 3600);
        const mTotal = Math.floor((day_length % 3600) / 60);
        const pct = Math.min(100, Math.max(0, (secondsPassed / day_length) * 100));

        setSolarData({
          current: `${hCurr}h ${mCurr}m`,
          total: `${hTotal}h ${mTotal}m`,
          percent: pct,
          sunrise: sunriseDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          sunset: sunsetDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });

        // B) CLIMA
        const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=weathercode&timezone=auto`);
        setWeatherData(getWeatherInfo(weatherRes.data.current.weathercode));

      } catch (err) { console.error("Error APIs", err); }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. SENSORES (Firebase)
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Monitor de Cultivo</h2>
        <span className="bg-stone-800 text-gray-300 border border-gray-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Finca #{currentField}
        </span>
      </div>
      
      {/* --- GRID DE KPIs --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. TEMPERATURA (NUEVO DISEÑO: Blanco, Barra Roja, Termómetro) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-200 border border-white/50 p-6 rounded-2xl text-gray-900 shadow-xl group transition-all hover:scale-[1.02]">
            {/* Icono de fondo: Termómetro rojo */}
            <div className="absolute -right-6 -top-6 opacity-10 text-red-600 group-hover:opacity-20 transition-opacity">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2a3 3 0 0 0-3 3v7.27a5.001 5.001 0 0 0 1.17 8.513 5 5 0 1 0 5.66-8.513A5.001 5.001 0 0 0 15 12.27V5a3 3 0 0 0-3-3zm0 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
               </svg>
            </div>
            <h3 className="font-bold uppercase tracking-wider text-red-700 text-xs mb-3">Temperatura Aire</h3>
            <div className="flex items-baseline gap-1">
                 <p className="text-4xl font-black text-gray-900">{currentStatus?.temp ?? "--"}</p>
                 <span className="text-lg font-medium text-gray-500">°C</span>
            </div>
            {/* Barra Roja */}
            <div className="mt-3 w-full h-1 bg-gray-300 rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: `${Math.min(100, (currentStatus?.temp || 0) * 2)}%` }}></div>
            </div>
             <p className="text-xs text-gray-500 mt-2 text-right font-mono">{currentStatus?.timeTemp || "--:--"}</p>
        </div>

        {/* 2. CICLO SOLAR (Naranja - Con Amanecer/Atardecer) */}
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
            <div className="flex justify-between text-[10px] text-gray-400 font-mono mt-2">
                <div className="flex flex-col">
                    <span className="text-yellow-200/70">🌅 {solarData.sunrise}</span>
                    <span className="opacity-50">Amanecer</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-yellow-200/70">🌇 {solarData.sunset}</span>
                    <span className="opacity-50">Atardecer</span>
                </div>
            </div>
        </div>

        {/* 3. HUMEDAD (Azul - Diseño Original) */}
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

        {/* 4. CLIMA ACTUAL */}
        {weatherData ? (
             <div className={`relative overflow-hidden bg-gradient-to-br ${weatherData.bg} border p-6 rounded-2xl text-white shadow-xl group transition-all hover:scale-[1.02]`}>
                <div className={`absolute -right-2 -top-2 opacity-30 text-6xl group-hover:scale-110 transition-transform`}>
                    {weatherData.icon}
                </div>
                <h3 className="font-bold uppercase tracking-wider text-gray-300 text-xs mb-3">Clima Ahora</h3>
                
                <div className="mt-2">
                    <p className={`text-3xl font-black ${weatherData.color} tracking-tight`}>
                        {weatherData.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Zona Valencia</p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-white/60">Prob. Lluvia</span>
                    <span className="text-sm font-bold text-blue-300">--%</span>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 border-dashed p-6 rounded-2xl text-gray-500 min-h-[160px]">
                <span className="text-4xl mb-2 opacity-20">🌤️</span>
                <p className="text-sm font-medium">Cargando clima...</p>
            </div>
        )}

      </div>

      {/* --- GRÁFICAS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemperatureChart fieldId={currentField} />
        <HumidityChart fieldId={currentField} />
      </div>
      
    </div>
  );
}