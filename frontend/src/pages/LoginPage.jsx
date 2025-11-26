// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Si ya existe token → redirige automáticamente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/select-field");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // CAMBIO: Petición al backend real
      // Nota: Tu backend espera "correo" en lugar de "email"
      const { data } = await api.post("/auth/login", { 
        correo: email, 
        password: password 
      });

      // Si todo va bien, guardamos el token real y el usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id_usuario); // Usamos el ID del backend
      navigate("/select-field");

    } catch (err) {
      // Si el backend devuelve error (401/404), mostramos tu mensaje
      setError("Correo o contraseña incorrectos");
      console.error("Login error:", err);
    }
  };
  
  return (
    <div
  className="min-h-screen min-w-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-0"
  style={{ backgroundImage: "url('/bg-login.jpg')" }}
>
  {/* overlay oscuro */}
  <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

  <div
    className="relative z-10 bg-white/95 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md mx-auto"
  >
    <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-green-700">
      Iniciar sesión
    </h2>

    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button
        type="submit"
        className="bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all"
      >
        Entrar
      </button>
    </form>
  </div>
</div>
  );
}
