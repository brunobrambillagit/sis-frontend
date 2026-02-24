// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  // Al iniciar la app, recupera sesión (si existe)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUsuario(JSON.parse(storedUser));
  }, []);

  const login = (email, password) => {
    // Simulación temporal: después se reemplaza por API real
    if (email === "admin@hospital.com" && password === "1234") {
      const fakeToken = "FAKE_JWT_ADMIN";
      const user = { nombre: "Administrador", rol: "administrativo" };

      setUsuario(user);
      setToken(fakeToken);

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("usuario", JSON.stringify(user));

      navigate("/admin");
      return;
    }

    if (email === "medico@hospital.com" && password === "1234") {
      const fakeToken = "FAKE_JWT_MEDICO";
      const user = { nombre: "Dr. Gómez", rol: "medico" };

      setUsuario(user);
      setToken(fakeToken);

      localStorage.setItem("token", fakeToken);
      localStorage.setItem("usuario", JSON.stringify(user));

      navigate("/medico");
      return;
    }

    alert("Credenciales inválidas");
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);