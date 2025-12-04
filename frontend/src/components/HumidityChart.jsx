import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { db } from "../firebase/client";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function HumidityChart({ fieldId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!fieldId) return;

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const q = query(
      collection(db, "sensors"),
      where("fieldId", "==", Number(fieldId)),
      where("type", "==", "humedad"),
      where("timestamp", ">", yesterday),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const formattedData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          time: d.timestamp?.seconds 
            ? new Date(d.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : "",
          value: d.value
        };
      });
      setData(formattedData);
    });

    return () => unsubscribe();
  }, [fieldId]);

  if (data.length === 0) return (
    <div className="h-64 flex items-center justify-center text-gray-400 bg-white/5 rounded-xl border border-white/10">
      Esperando datos de humedad...
    </div>
  );

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        💧 Humedad (24h)
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickMargin={10} />
            <YAxis stroke="#9ca3af" unit="%" fontSize={12} domain={[0, 100]} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorHum)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}