import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client"; // Importamos la conexión real

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/select-field");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 1. PEDIR TOKEN REAL AL BACKEND
      // (Tu backend espera 'correo', no 'email')
      const { data } = await api.post("/auth/login", { 
        correo: email, 
        password: password 
      });

      // 2. GUARDAR TOKEN VÁLIDO
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id_usuario); 
      
      // 3. ENTRAR
      navigate("/select-field");

    } catch (err) {
      console.error("Error login:", err);
      setError("Correo o contraseña incorrectos");
    }
  };
  
  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-cover bg-center px-4 sm:px-0" style={{ backgroundImage: "url('/bg-login.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <div className="relative z-10 bg-white/95 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-sm sm:max-w-md mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-green-700">Iniciar sesión</h2>
        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-black" />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-black" />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-all">Entrar</button>
        </form>
      </div>
    </div>
  );
}