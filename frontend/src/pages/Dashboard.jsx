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
    <div className="flex min-h-screen min-w-screen bg-stone-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
            <Header title={`Dashboard - Campo ${currentField || ""}`} onLogout={handleLogout} />
            
            {/* Aquí se renderizarán Riegos, Sensores o Históricos */}
            <main className="p-6 flex-1 overflow-auto text-white">
                <Outlet />
            </main>
        </div>
    </div>
  );
}