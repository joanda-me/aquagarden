import { useEffect, useState } from "react";
import { db } from "../firebase/client"; // Tu configuración de Firebase
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function Sensores() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    // 1. Definimos qué queremos escuchar: Colección 'sensors', últimos 10, ordenados por fecha
    const q = query(
      collection(db, "sensors"),
      orderBy("timestamp", "desc"),
      limit(12)
    );

    // 2. Abrimos el canal de escucha (onSnapshot)
    // Cada vez que el backend guarde un dato MQTT, esta función se ejecuta sola
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Formatear la fecha (si viene como Timestamp de Firebase)
        fecha: doc.data().timestamp?.seconds 
          ? new Date(doc.data().timestamp.seconds * 1000).toLocaleTimeString()
          : "Ahora"
      }));
      setReadings(data);
    });

    // 3. Cerramos el canal al salir de la página (limpieza)
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-white">Monitor de Sensores</h2>
      
      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {readings.map((sensor) => (
          <div 
            key={sensor.id} 
            className="relative overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white shadow-xl hover:scale-[1.02] transition-transform"
          >
            {/* Icono decorativo según tipo */}
            <div className="absolute -right-4 -top-4 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <h3 className="font-bold uppercase tracking-wider text-green-400 text-sm">{sensor.type}</h3>
                <span className="text-xs text-gray-400">Finca ID: {sensor.fieldId}</span>
              </div>
              <span className="px-2 py-1 bg-black/30 rounded text-xs font-mono text-gray-300">
                {sensor.fecha}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-5xl font-black tracking-tight">
                {sensor.value}
                <span className="text-2xl font-medium text-gray-400 ml-1">
                   {sensor.type === 'temperatura' ? '°C' : sensor.type === 'humedad' ? '%' : ''}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {readings.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
            <p className="text-xl">Esperando datos en tiempo real...</p>
            <p className="text-sm mt-2">Asegúrate de que el simulador está corriendo</p>
        </div>
      )}
    </div>
  );
}