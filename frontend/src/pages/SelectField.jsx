import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client"; 

export default function SelectField() {
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({ name: "", location: "" });

  // 1. CARGAR DATOS
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get("/fields", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const mappedFields = data.map(f => ({
        id: f.id_campo,
        name: f.nombre_campo,
        location: f.ubicacion || "Sin ubicación",
        image: f.ubicacion?.toLowerCase().includes('valencia') 
          ? "https://picsum.photos/400?1" 
          : `https://picsum.photos/400?random=${f.id_campo}`,
        isNew: false
      }));
      
      setFields(mappedFields);
    } catch (err) {
      console.error("Error cargando fincas:", err);
      if (err.response?.status === 401) navigate("/");
    }
  };

  const handleSelect = (fieldId) => {
    localStorage.setItem("currentField", fieldId);
    navigate("/dashboard");
  };

  // --- GESTIÓN DEL MODAL ---
  const openCreateModal = () => {
    setEditingField(null);
    setFormData({ name: "", location: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (field) => {
    setEditingField(field);
    setFormData({ name: field.name, location: field.location });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  // --- GUARDAR ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("El nombre es obligatorio");

    const token = localStorage.getItem("token");
    const payload = {
        nombre_campo: formData.name,
        ubicacion: formData.location
    };

    try {
        if (editingField) {
            await api.put(`/fields/${editingField.id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } else {
            await api.post("/fields", payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        await fetchFields();
        closeModal();
    } catch (err) {
        alert("Error al guardar la finca");
    }
  };

  // --- BORRAR ---
  const handleDeleteField = async (field) => {
    const confirmName = prompt(`Para borrar "${field.name}", escribe su nombre exacto:`);
    
    if (confirmName && confirmName === field.name) {
      setDeletingId(field.id);
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/fields/${field.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setTimeout(() => {
          setFields((prev) => prev.filter((f) => f.id !== field.id));
          setDeletingId(null);
        }, 400);
      } catch (e) { 
        alert("Error al borrar"); 
        setDeletingId(null); 
      }
    }
  };

  return (
    <div className="min-h-screen min-w-screen text-white flex flex-col items-center bg-stone-900 p-6 sm:p-10 relative">
      
      <div className="flex flex-col items-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">
            Mis Fincas
        </h1>
        <p className="text-gray-400 text-sm">Selecciona una parcela para gestionar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        
        {/* TARJETA AÑADIR */}
        <div 
            onClick={openCreateModal}
            className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:bg-white/10 hover:border-green-500/50 transition-all group"
        >
            <div className="bg-green-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-lg font-medium text-gray-300 group-hover:text-white">Añadir Nueva Finca</span>
        </div>

        {/* TARJETAS EXISTENTES */}
        {fields.map((field) => (
          <div
            key={field.id}
            className={`bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-md p-4 flex flex-col transition-transform duration-200 hover:scale-[1.02]
              ${deletingId === field.id ? "animate-fadeOut" : "animate-fadeIn"}
            `}
          >
            <div onClick={() => handleSelect(field.id)} className="cursor-pointer flex-1">
                {/* 👇 CAMBIO AQUÍ: 'aspect-video' en lugar de 'aspect-square' */}
                <img
                  src={field.image}
                  alt={field.name}
                  className="w-full aspect-video object-cover rounded-xl mb-4 shadow-lg"
                />
                <h2 className="text-xl font-bold mb-1">{field.name}</h2>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {field.location}
                </p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-white/10">
              <button
                onClick={() => openEditModal(field)}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteField(field)}
                className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-stone-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-6">
                    {editingField ? "Editar Finca" : "Nueva Finca"}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Nombre</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Ej: Huerto Norte"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Ubicación</label>
                        <input 
                            type="text" 
                            value={formData.location}
                            onChange={e => setFormData({...formData, location: e.target.value})}
                            placeholder="Ej: Valencia, ES"
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={closeModal}
                            className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20 transition-all"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
       <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
}