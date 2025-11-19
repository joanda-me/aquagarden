import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Riegos() {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

  return (
    
    <div className="flex min-h-screen min-w-screen">
        <Sidebar />  {/* ancho fijo */}
      <h2 className="text-2xl font-bold mb-4">Riegos</h2>
      <p>Gráficas y datos de sensores aquí.</p>
    </div>
  );
}
