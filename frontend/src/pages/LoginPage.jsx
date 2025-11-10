// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // Descomenta cuando conectes backend

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // BLOQUE FUTURO (comentado) -> backend real
    /*
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/select-field");
    } catch(err) { setError("Credenciales incorrectas"); }
    */

    // BLOQUE DE PRUEBA (activo)
    const testUser = { email: "admin@aqua.com", password: "1234", token: "fakeToken12345", userId: "1" };
    if (email === testUser.email && password === testUser.password) {
      localStorage.setItem("token", testUser.token);
      localStorage.setItem("userId", testUser.userId);
      navigate("/select-field");
    } else {
      setError("Correo o contraseña incorrectos");
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
    className="
      relative z-10 
      bg-white/95 
      p-6 sm:p-8 
      rounded-2xl 
      shadow-lg 
      w-full 
      max-w-sm sm:max-w-md 
      mx-auto
    "
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
        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
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
