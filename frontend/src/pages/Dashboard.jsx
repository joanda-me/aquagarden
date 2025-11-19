import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const currentField = localStorage.getItem("currentField");

  return (
    <div className="flex min-h-screen min-w-screen">
        <Sidebar />  {/* ancho fijo */}
            <div className="flex-1 flex flex-col min-h-screen bg-gray-100">
            <Header title={`Dashboard - Campo ${currentField || ""}`} onLogout={handleLogout} />
            <main className="p-6 flex-1 bg-stone-900 text-white">
                <Outlet />
                <p>Bienvenido a AquaGarden. Aquí irán los sensores y controles de riego.</p>
            </main>
        </div>
    </div>
  );
}
