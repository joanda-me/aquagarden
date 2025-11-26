export default function Header({ title, onLogout }) {
  return (
    <div className="bg-stone-900">
      <header className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 shadow">
        <h1 className="text-2xl font-bold">{title}</h1>
        {onLogout && (
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Cerrar sesión
          </button>
        )}
        
      </header>
    </div>
  );
}
