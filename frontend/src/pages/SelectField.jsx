import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SelectField() {
  const navigate = useNavigate();

  const [fields, setFields] = useState([
    { id: 1, name: "Campo Norte", image: "https://picsum.photos/400?1" },
    { id: 2, name: "Huerto Central", image: "https://picsum.photos/400?2" },
  ]);
  const [newName, setNewName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const handleSelect = (fieldId) => {
    localStorage.setItem("currentField", fieldId);
    navigate("/dashboard");
  };

  const handleAddField = () => {
    if (!newName.trim()) return;
    const newField = {
      id: Date.now(),
      name: newName,
      image: `https://picsum.photos/400?random=${Date.now()}`,
      isNew: true,
    };
    setFields([...fields, newField]);
    setNewName("");

    setTimeout(() => {
      setFields((prev) =>
        prev.map((f) => (f.id === newField.id ? { ...f, isNew: false } : f))
      );
    }, 1000);
  };

  const handleEditField = (id) => {
    const newFieldName = prompt("Nuevo nombre de la finca:");
    if (!newFieldName) return;
    setFields(fields.map((f) => (f.id === id ? { ...f, name: newFieldName } : f)));
  };

  // --- CORRECCIÓN AQUÍ ---
  const handleDeleteField = (field) => {
    const confirmName = prompt(`Para borrar "${field.name}", escribe su nombre exacto:`);
    
    // localeCompare devuelve 0 si son idénticos
    if (confirmName && confirmName.localeCompare(field.name) === 0) {
      setDeletingId(field.id);
      setTimeout(() => {
        setFields((prev) => prev.filter((f) => f.id !== field.id));
        setDeletingId(null);
      }, 400);
    } else {
      alert("El nombre no coincide. No se ha borrado nada.");
    }
  };

  return (
    <div className="min-h-screen min-w-screen text-white flex flex-col items-center bg-stone-900 p-6 sm:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
        Selecciona tu finca
      </h1>

      <div className="mb-8 flex flex-row gap-3 w-full max-w-md justify-center">
        <input
          type="text"
          placeholder="Nueva finca"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddField()}
          className="p-2 border rounded text-black w-full flex-1" // text-black para que se lea al escribir
        />
        <button
          onClick={handleAddField}
          className="rounded-full border text-green-400 border-green-300 bg-green-100 p-2 hover:bg-green-200 transition flex-shrink-0"
        >
           {/* SVG Icon... */}
           <svg className="w-6 h-6 stroke-green-700" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M16 2 L16 30 M2 16 L30 16"></path></svg>
        </button>
      </div>

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
              {/* CORRECCIÓN EN EL ONCLICK: pasamos el objeto 'field' completo */}
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
      
       {/* Mantén tus estilos de animación aquí */}
       <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.4s ease-in forwards; }
      `}</style>
    </div>
  );
}