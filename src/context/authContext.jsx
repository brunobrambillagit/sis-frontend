//Manejador de la sesion del usuario junto con su rol de manera global
// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);

  const login = (email, password) => {
    // Simulación temporal: después se reemplaza por API real
    if (email === "admin@hospital.com" && password === "1234") {
      setUsuario({ nombre: "Administrador", rol: "administrativo" });
      navigate("/admin");
    } else if (email === "medico@hospital.com" && password === "1234") {
      setUsuario({ nombre: "Dr. Gómez", rol: "medico" });
      navigate("/medico");
    } else {
      alert("Credenciales inválidas");
    }
  };

  const logout = () => {
    setUsuario(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);