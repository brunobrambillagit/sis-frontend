import { createContext, useContext, useEffect, useState } from "react";
import { loginApi } from "../api/authApi";

const AuthContext = createContext();

function normalizarRol(rolBackend) {
  if (!rolBackend) return null;
  const r = String(rolBackend).toUpperCase();
  if (r === "ADMINISTRATIVO") return "administrativo";
  if (r === "MEDICO") return "medico";
  return rolBackend;
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");
    if (storedToken) setToken(storedToken);
    if (storedUser) setUsuario(JSON.parse(storedUser));
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password); // {token, email, rol}

    const user = {
      email: data.email,
      rol: normalizarRol(data.rol),
    };

    setToken(data.token);
    setUsuario(user);

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(user));

    return user;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);