import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Riegos() {
  const currentField = localStorage.getItem("currentField");

  // Estados de Datos
  const [sectores, setSectores] = useState([]);
  const [cultivos, setCultivos] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [valveStates, setValveStates] = useState({}); 

  // Estados de Modales
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Formularios
  const [editingSector, setEditingSector] = useState(null); // <--- Estado para edición
  const [sectorForm, setSectorForm] = useState({ name: "", pin: "", cropId: "" });
  
  const [scheduleForm, setScheduleForm] = useState({ sectorId: null, name: "Riego Diario", start: "08:00", duration: "15", freq: "1" });
  const [cropForm, setCropForm] = useState({ name: "", minHum: 40, maxHum: 80, minTemp: 15, maxTemp: 30 });

  // 1. CARGAR DATOS
  const fetchData = async () => {
    if (!currentField) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const resSectors = await api.get(`/fields/${currentField}/sectors`, { headers });
      setSectores(resSectors.data);
      
      const resCrops = await api.get("/crops", { headers });
      setCultivos(resCrops.data);

      const resSched = await api.get("/irrigation", { headers });
      setSchedules(resSched.data);
      
      const initialStates = {};
      resSectors.data.forEach(s => initialStates[s.id_sector] = false);
      setValveStates(prev => ({ ...initialStates, ...prev }));

    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [currentField]);

  // --- GESTIÓN DE SECTORES (CREAR Y EDITAR) ---
  
  const openCreateModal = () => {
    setEditingSector(null); // Modo Crear
    setSectorForm({ name: "", pin: "", cropId: "" });
    setIsSectorModalOpen(true);
  };

  const openEditModal = (sector) => {
    setEditingSector(sector); // Modo Editar
    setSectorForm({ 
        name: sector.nombre_sector, 
        pin: sector.pin_valvula, 
        cropId: sector.id_cultivo 
    });
    setIsSectorModalOpen(true);
  };

  const handleSaveSector = async (e) => {
    e.preventDefault();
    if (!sectorForm.name || !sectorForm.pin || !sectorForm.cropId) return alert("Faltan datos");

    const token = localStorage.getItem("token");
    const payload = {
        nombre_sector: sectorForm.name,
        pin_valvula: Number(sectorForm.pin),
        id_cultivo: Number(sectorForm.cropId)
    };

    try {
        if (editingSector) {
            // EDITAR
            await api.put(`/fields/sectors/${editingSector.id_sector}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            // CREAR
            await api.post(`/fields/${currentField}/sectors`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        
        setIsSectorModalOpen(false);
        fetchData();
    } catch (err) { alert("Error guardando sector"); }
  };

  const handleDeleteSector = async (id) => {
    if(!confirm("¿Borrar sector?")) return;
    try {
        const token = localStorage.getItem("token");
        await api.delete(`/fields/sectors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
    } catch(err) { alert("Error borrando"); }
  };

  // --- CREAR CULTIVO ---
  const handleAddCrop = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        await api.post("/crops", {
            nombre_cultivo: cropForm.name,
            humedad_min: cropForm.minHum,
            humedad_max: cropForm.maxHum,
            temp_min: cropForm.minTemp,
            temp_max: cropForm.maxTemp
        }, { headers: { Authorization: `Bearer ${token}` } });

        setIsCropModalOpen(false);
        setCropForm({ name: "", minHum: 40, maxHum: 80, minTemp: 15, maxTemp: 30 });
        alert("Cultivo añadido");
        fetchData();
    } catch (err) { alert("Error creando cultivo"); }
  };

  // --- GESTIÓN HORARIOS ---
  const openScheduleModal = (sectorId) => {
    setScheduleForm({ sectorId, name: "Riego Auto", start: "08:00", duration: "15", freq: "1" });
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem("token");
        await api.post("/irrigation", {
            id_sector: scheduleForm.sectorId,
            nombre_programa: scheduleForm.name,
            hora_inicio: scheduleForm.start,
            duracion_min: Number(scheduleForm.duration),
            frecuencia_dias: Number(scheduleForm.freq),
            condicion_auto: "manual"
        }, { headers: { Authorization: `Bearer ${token}` } });
        setIsScheduleModalOpen(false);
        alert("Programación guardada");
        fetchData();
    } catch (err) { alert("Error guardando horario"); }
  };

  const getSchedule = (sectorId) => schedules.find(s => s.id_sector === sectorId);

  // --- CONTROL VÁLVULA ---
  const toggleValve = async (sectorId) => {
    const isCurrentlyOpen = valveStates[sectorId];
    const action = isCurrentlyOpen ? "CLOSE" : "OPEN";
    setValveStates(prev => ({ ...prev, [sectorId]: !isCurrentlyOpen }));
    try {
        const token = localStorage.getItem("token");
        await api.post("/irrigation/valve", { fieldId: currentField, sectorId, action }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { 
        setValveStates(prev => ({ ...prev, [sectorId]: isCurrentlyOpen })); 
    }
  };

  return (
    <div className="p-6 space-y-8 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Control de Riego</h2>
        <div className="flex gap-3 items-center">
            <button onClick={() => setIsCropModalOpen(true)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors flex items-center gap-2">
                <span>🌱</span> Nuevo Cultivo
            </button>
            <span className="bg-blue-900/50 text-blue-200 border border-blue-700/50 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            Finca #{currentField}
            </span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* TARJETA AÑADIR */}
        <div onClick={openCreateModal} className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 hover:border-green-500/50 transition-all group min-h-[220px]">
            <div className="bg-green-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-lg font-medium text-gray-300 group-hover:text-white">Añadir Zona</span>
        </div>

        {/* LISTA SECTORES */}
        {sectores.map((sector) => {
          const isOpen = valveStates[sector.id_sector];
          const schedule = getSchedule(sector.id_sector);

          return (
            <div key={sector.id_sector} className={`bg-white/5 border transition-all duration-300 rounded-2xl p-6 relative group flex flex-col justify-between ${isOpen ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-white/10 hover:border-white/30'}`}>
              {/* Botones Edición (Lápiz y Papelera) */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); openEditModal(sector); }} className="text-gray-400 hover:text-blue-400" title="Editar">✏️</button>
                 <button onClick={(e) => { e.stopPropagation(); handleDeleteSector(sector.id_sector); }} className="text-gray-400 hover:text-red-400" title="Borrar">✕</button>
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-1 ${isOpen ? 'text-blue-400' : 'text-white'}`}>{sector.nombre_sector}</h3>
                <p className="text-sm text-gray-400 flex items-center gap-2"><span>🌱</span> {sector.Crop?.nombre_cultivo || "Sin asignar"}</p>
                {schedule ? (
                    <div className="my-4 bg-green-900/20 border border-green-500/30 rounded-lg p-2 flex items-center gap-3">
                        <div className="p-1.5 bg-green-500/20 rounded-full text-green-400">🕒</div>
                        <div><p className="text-xs text-green-300 font-bold">Activo</p><p className="text-xs text-gray-300">{schedule.hora_inicio.slice(0,5)} • {schedule.duracion_min}m</p></div>
                    </div>
                ) : <div className="my-4 h-10"></div>}
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl mb-3">
                    <span className="text-xs font-mono text-gray-500">PIN {sector.pin_valvula}</span>
                    <button onClick={() => toggleValve(sector.id_sector)} className={`px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg active:scale-95 ${isOpen ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}>{isOpen ? "STOP" : "REGAR"}</button>
                </div>
                <button onClick={() => openScheduleModal(sector.id_sector)} className="w-full text-center text-xs text-blue-400 hover:text-blue-300 hover:underline border-t border-white/5 pt-3">{schedule ? "Modificar Horario" : "➕ Crear Horario Automático"}</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL SECTOR (CREAR/EDITAR) --- */}
      {isSectorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-stone-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">{editingSector ? "Editar Zona" : "Nueva Zona"}</h3>
                <form onSubmit={handleSaveSector} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Nombre</label>
                        <input type="text" value={sectorForm.name} onChange={e => setSectorForm({...sectorForm, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white mt-1" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Cultivo</label>
                        <select value={sectorForm.cropId} onChange={e => setSectorForm({...sectorForm, cropId: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white mt-1 appearance-none">
                            <option value="">-- Seleccionar --</option>
                            {cultivos.map(c => <option key={c.id_cultivo} value={c.id_cultivo}>{c.nombre_cultivo}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase font-bold">Pin Válvula</label>
                        <input type="number" value={sectorForm.pin} onChange={e => setSectorForm({...sectorForm, pin: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white mt-1" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsSectorModalOpen(false)} className="flex-1 py-2 rounded-lg text-gray-400 hover:bg-white/5">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL CULTIVO --- */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-stone-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl border-t-4 border-t-green-500">
                <h3 className="text-xl font-bold text-white mb-4">Nuevo Cultivo</h3>
                <form onSubmit={handleAddCrop} className="space-y-3">
                    <input type="text" placeholder="Nombre" value={cropForm.name} onChange={e => setCropForm({...cropForm, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Min Humedad" value={cropForm.minHum} onChange={e => setCropForm({...cropForm, minHum: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                        <input type="number" placeholder="Max Humedad" value={cropForm.maxHum} onChange={e => setCropForm({...cropForm, maxHum: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setIsCropModalOpen(false)} className="flex-1 py-2 rounded-lg text-gray-400 hover:bg-white/5">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold">Crear</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL HORARIO --- */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-stone-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl border-t-4 border-t-blue-500">
                <h3 className="text-xl font-bold text-white mb-2">Programar Riego</h3>
                <form onSubmit={handleSaveSchedule} className="space-y-4">
                    <input type="text" value={scheduleForm.name} onChange={e => setScheduleForm({...scheduleForm, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="time" value={scheduleForm.start} onChange={e => setScheduleForm({...scheduleForm, start: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                        <input type="number" placeholder="Minutos" value={scheduleForm.duration} onChange={e => setScheduleForm({...scheduleForm, duration: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white" />
                    </div>
                    <select value={scheduleForm.freq} onChange={e => setScheduleForm({...scheduleForm, freq: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white">
                        <option value="1">Todos los días</option>
                        <option value="2">Cada 2 días</option>
                        <option value="7">Semanalmente</option>
                    </select>
                    <div className="flex gap-3 pt-4 border-t border-white/10 mt-4">
                        <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="flex-1 py-2 rounded-lg text-gray-400 hover:bg-white/5">Cancelar</button>
                        <button type="submit" className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out; }`}</style>
    </div>
  );
}