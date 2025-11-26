import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client"; // Cliente Axios conectado al backend

export default function SelectField() {
  const navigate = useNavigate();

  // Estado local
  const [fields, setFields] = useState([]);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState(null); // ¡Recuperado!

  // 1. CARGAR FINCAS AL INICIAR (READ)
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get("/fields", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Adaptador: Backend (español) -> Frontend (inglés)
        // Así no tenemos que cambiar todo tu JSX
        const mappedFields = data.map(f => ({
          id: f.id_campo,
          name: f.nombre_campo,
          image: f.ubicacion === 'Valencia, ES' 
            ? "https://picsum.photos/400?1" 
            : `https://picsum.photos/400?random=${f.id_campo}`,
          isNew: false
        }));
        
        setFields(mappedFields);
      } catch (err) {
        console.error("Error cargando fincas:", err);
        if (err.response?.status === 401) navigate("/"); // Si el token caducó, al login
      }
    };
    fetchFields();
  }, [navigate]);

  const handleSelect = (fieldId) => {
    localStorage.setItem("currentField", fieldId);
    navigate("/dashboard");
  };

  // 2. CREAR FINCA (CREATE)
  const handleAddField = async () => {
    if (!newName.trim()) return;
    
    try {
      const token = localStorage.getItem("token");
      // Petición al backend
      const { data } = await api.post("/fields", 
        { nombre_campo: newName, ubicacion: "Ubicación por defecto" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newField = {
        id: data.id_campo, // ID real de la base de datos
        name: data.nombre_campo,
        image: `https://picsum.photos/400?random=${Date.now()}`,
        isNew: true, // Activa la animación de entrada
      };

      setFields([...fields, newField]);
      setNewName("");

      // Quitar la bandera 'isNew' tras la animación
      setTimeout(() => {
        setFields((prev) =>
          prev.map((f) => (f.id === newField.id ? { ...f, isNew: false } : f))
        );
      }, 1000);

    } catch (err) {
      alert("Error al crear la finca: " + (err.response?.data?.error || err.message));
    }
  };

  // 3. EDITAR FINCA (UPDATE)
  const handleEditField = async (id) => {
    const fieldToEdit = fields.find(f => f.id === id);
    const newFieldName = prompt("Nuevo nombre de la finca:", fieldToEdit?.name);
    
    if (!newFieldName || newFieldName === fieldToEdit.name) return;

    try {
      const token = localStorage.getItem("token");
      // Actualizar en backend
      await api.put(`/fields/${id}`, 
        { nombre_campo: newFieldName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar visualmente
      setFields(fields.map((f) => (f.id === id ? { ...f, name: newFieldName } : f)));

    } catch (err) {
      alert("Error al editar: " + err.message);
    }
  };

  // 4. BORRAR FINCA (DELETE) con Animación
  const handleDeleteField = async (field) => {
    // Lógica de seguridad: Confirmar nombre exacto
    const confirmName = prompt(`Para borrar "${field.name}", escribe su nombre exacto:`);
    
    if (confirmName && confirmName === field.name) {
      // 1º Activamos animación de salida
      setDeletingId(field.id);

      try {
        const token = localStorage.getItem("token");
        // 2º Esperamos a que termine la animación (400ms) antes de borrar visualmente
        setTimeout(async () => {
          // Petición al backend (mientras la carta desaparece)
          await api.delete(`/fields/${field.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          // Actualizar estado eliminando la finca
          setFields((prev) => prev.filter((f) => f.id !== field.id));
          setDeletingId(null);
        }, 400);

      } catch (err) {
        alert("Error al borrar: " + err.message);
        setDeletingId(null); // Si falla, cancelamos la animación
      }
    } else {
      if (confirmName !== null) alert("El nombre no coincide.");
    }
  };

  return (
    <div className="min-h-screen min-w-screen text-white flex flex-col items-center bg-stone-900 p-6 sm:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        Selecciona tu finca
      </h1>

      {/* Input de nueva finca */}
      <div className="mb-8 flex flex-row gap-3 w-full max-w-md justify-center">
        <input
          type="text"
          placeholder="Nueva finca"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddField()}
          className="p-2 border rounded text-black w-full flex-1"
        />
        <button
          onClick={handleAddField}
          className="rounded-full border text-green-400 border-green-300 bg-green-100 p-2 hover:bg-green-200 transition flex-shrink-0"
        >
          <svg className="w-6 h-6 stroke-green-700" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M16 2 L16 30 M2 16 L30 16"></path></svg>
        </button>
      </div>

      {/* Grid de fincas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {fields.map((field) => (
          <div
            key={field.id}
            className={`bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-md p-4 flex flex-col items-center transition-transform duration-200 hover:scale-[1.03] 
              ${field.isNew ? "animate-fadeIn" : ""}
              ${deletingId === field.id ? "animate-fadeOut" : ""}
            `}
          >
            <img
              src={field.image}
              alt={field.name}
              className="w-full aspect-square object-cover rounded-xl mb-3 cursor-pointer"
              onClick={() => handleSelect(field.id)}
            />
            <h2 className="text-xl font-semibold mb-3 text-center">{field.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditField(field.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteField(field)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Estilos de Animación */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-fadeOut {
          animation: fadeOut 0.4s ease-in forwards;
        }
      `}</style>
    </div>
  );
}