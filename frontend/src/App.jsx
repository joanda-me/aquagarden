import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import SelectField from "./pages/SelectField";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas del Dashboard
import Home from "./pages/Home";       // <--- IMPORTAR
import Sensores from "./pages/Sensores";
import Riegos from "./pages/Riegos";
import Historicos from "./pages/Historicos";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ... Login y SelectField (sin cambios) ... */}
        <Route path="/" element={<Login />} />
        <Route
          path="/select-field"
          element={
            <ProtectedRoute>
              <SelectField />
            </ProtectedRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Ruta INDEX: Ahora carga tu componente Home */}
          <Route index element={<Home />} />
          
          <Route path="sensores" element={<Sensores />} />
          <Route path="riegos" element={<Riegos />} />
          <Route path="historicos" element={<Historicos />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}