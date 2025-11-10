import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SelectField() {
  const navigate = useNavigate();

  // Datos de ejemplo, en producción vendrán del backend
  const [fields, setFields] = useState([
    { id: 1, name: "Campo Norte", image: "https://picsum.photos/200?1" },
    { id: 2, name: "Huerto Central", image: "https://picsum.photos/200?2" },
  ]);
  const [newName, setNewName] = useState("");

  const handleSelect = (fieldId) => {
    localStorage.setItem("currentField", fieldId);
    navigate("/dashboard");
  };

  const handleAddField = () => {
    if (!newName) return;
    const newField = {
      id: Date.now(),
      name: newName,
      image: "https://picsum.photos/200?random=" + Date.now(),
    };
    setFields([...fields, newField]);
    setNewName("");
  };

  const handleEditField = (id) => {
    const newFieldName = prompt("Nuevo nombre de la finca:");
    if (!newFieldName) return;
    setFields(fields.map(f => f.id === id ? { ...f, name: newFieldName } : f));
  };

  const handleDeleteField = (id) => {
    if (confirm("¿Seguro que quieres eliminar esta finca?")) {
      setFields(fields.filter(f => f.id !== id));
    }
  };

  return (
    <div className="min-h-screen min-w-screen text-white flex flex-col items-center bg-stone-900 p-6">
      <h1 className="text-3xl font-bold mb-6">Selecciona tu finca</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Nueva finca"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={handleAddField}
          className="rounded-full border text-green-400 border-green-300 bg-green-100 p-2 dark:border-green-300/10 dark:bg-green-400/10"
        >
            <svg className="size-6 stroke-green-700 dark:stroke-green-500"viewBox="0 0 32 32" id="i-plus" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16 2 L16 30 M2 16 L30 16"></path> </g></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {fields.map((field) => (
          <div
            key={field.id}
            className="bg-white rounded shadow-md p-4 flex flex-col items-center relative"
          >
            <img
              src={field.image}
              alt={field.name}
              className="w-40 h-40 object-cover rounded mb-2 cursor-pointer"
              onClick={() => handleSelect(field.id)}
            />
            <h2 className="text-xl font-semibold mb-2">{field.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditField(field.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteField(field.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
