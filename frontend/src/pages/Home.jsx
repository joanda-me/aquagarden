import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { db } from "../firebase/client";
import { doc, onSnapshot } from "firebase/firestore";

export default function Home() {
  const currentField = localStorage.getItem("currentField");
  
  // Estado
  const [status, setStatus] = useState(null); // Clima (Firebase)
  const [sectorCount, setSectorCount] = useState(0); // Infraestructura (SQL)

  useEffect(() => {
    if (!currentField) return;

    // 1. ESCUCHAR CLIMA (Firebase - Tiempo Real)
    // Leemos el documento de estado rápido
    const docRef = doc(db, "field_status", String(currentField));
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data());
      }
    });

    // 2. CONTAR SECTORES (API SQL)
    // Pedimos la lista para saber cuántos hay
    api.get(`/fields/${currentField}/sectors`)
      .then(res => setSectorCount(res.data.length))
      .catch(err => console.error(err));

    return () => unsubscribe();
  }, [currentField]);

  // Componente de Tarjeta Resumen
  const SummaryCard = ({ title, value, unit, icon, color, link, linkText }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
           <p className={`text-xs font-bold uppercase tracking-wider text-${color}-400 mb-1`}>{title}</p>
           <div className="flex items-baseline gap-1">
             <span className="text-4xl font-black text-white">{value ?? "--"}</span>
             <span className="text-sm text-gray-400">{unit}</span>
           </div>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
          {icon}
        </div>
      </div>
      
      {link && (
        <Link to={link} className="text-xs text-gray-400 hover:text-white flex items-center gap-1 mt-2 transition-colors">
          {linkText} <span>→</span>
        </Link>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      
      {/* 1. BIENVENIDA */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-white/10 p-8 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">Resumen de la Finca</h2>
          <p className="text-gray-300 max-w-xl">
            Bienvenido de nuevo. Tienes {sectorCount} sectores operativos y la conexión con los sensores es estable.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* 2. GRID DE RESUMEN (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Temperatura */}
        <SummaryCard 
          title="Clima Actual"
          value={status?.last_temperatura}
          unit="°C"
          color="orange"
          link="/dashboard/sensores"
          linkText="Ver gráficas"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />

        {/* Humedad */}
        <SummaryCard 
          title="Humedad Aire"
          value={status?.last_humedad}
          unit="%"
          color="blue"
          link="/dashboard/sensores"
          linkText="Ver gráficas"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
        />

        {/* Infraestructura */}
        <SummaryCard 
          title="Sectores"
          value={sectorCount}
          unit="Zonas"
          color="green"
          link="/dashboard/riegos"
          linkText="Gestionar riego"
          icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
        />
      </div>

      {/* 3. ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Estado del Sistema */}
         <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Estado del Sistema
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Conexión MQTT</span>
                    <span className="text-green-400 font-mono">ONLINE</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Última Actualización</span>
                    <span className="text-white font-mono">
                        {status?.lastUpdate?.toDate().toLocaleTimeString() || "Esperando..."}
                    </span>
                </div>
            </div>
         </div>

         {/* Botones */}
         <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center gap-3">
             <h3 className="font-bold text-white mb-2">Acciones Rápidas</h3>
             <Link to="/dashboard/historicos" className="bg-blue-100 hover:bg-blue-500 text-white hover:text-white p-3 rounded-xl text-center font-medium transition-colors">
                Buscar los registros históricos
             </Link>
         </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
}