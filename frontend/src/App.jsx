import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import SelectField from "./pages/SelectField";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Sensores from "./pages/Sensores";
import Riegos from "./pages/Riegos";
import Historicos from "./pages/Historicos";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Página por defecto: Login */}
        <Route path="/" element={<Login />} />

        {/* Página de selección de finca */}
        <Route
          path="/select-field"
          element={
            <ProtectedRoute>
              <SelectField />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Layout (Contenedor Padre) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Rutas Hijas (Se renderizan en el <Outlet /> del Dashboard) */}
          <Route index element={<div className="p-4"><h2>Bienvenido a tu Finca</h2><p>Selecciona una opción del menú.</p></div>} />
          <Route path="sensores" element={<Sensores />} />
          <Route path="riegos" element={<Riegos />} />
          <Route path="historicos" element={<Historicos />} />
        </Route>

        {/* Redirección a / si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}