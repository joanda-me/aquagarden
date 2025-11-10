import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import SelectField from "./pages/SelectField";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* Página por defecto: Login */}
        <Route path="/" element={<Login />} />

        {/* Página de selección de finca (solo si estás logueado) */}
        <Route
          path="/select-field"
          element={
            <ProtectedRoute>
              <SelectField />
            </ProtectedRoute>
          }
        />

        {/* Ejemplo de dashboard general de finca */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirección a / si la ruta no existe */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
