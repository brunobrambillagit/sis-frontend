import { createContext, useContext, useEffect, useState } from "react";
import { loginApi } from "../api/authApi";
import { getTokenExpiration } from "../utils/jwtUtils";

const AuthContext = createContext();

function normalizarRol(rolBackend) {
  if (!rolBackend) return null;

  const r = String(rolBackend).toUpperCase();

  if (r === "ADMINISTRATIVO") return "administrativo";
  if (r === "MEDICO") return "medico";
  if (r === "ADMIN") return "admin";

  return String(rolBackend).toLowerCase();
}

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("warning");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("usuario");

    if (storedToken) setToken(storedToken);
    if (storedUser) setUsuario(JSON.parse(storedUser));
  }, []);

  const login = async (email, password) => {
    const data = await loginApi(email, password);

    const user = {
      id: data.id,
      email: data.email,
      nombre: data.nombre || "",
      apellido: data.apellido || "",
      rol: normalizarRol(data.rol),
      debeCambiarPassword: Boolean(data.debeCambiarPassword),
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

  useEffect(() => {
    if (!token) return;

    const exp = getTokenExpiration(token);
    if (!exp) return;

    const now = Date.now();
    const tiempoRestante = exp - now;

    if (tiempoRestante <= 0) {
      logout();
      window.location.href = "/";
      return;
    }

    const AVISO_ANTES = 5 * 60 * 1000;

    let avisoTimer;

    if (tiempoRestante > AVISO_ANTES) {
      avisoTimer = setTimeout(() => {
        setAlertMessage("Tu sesión está por expirar en unos minutos");
        setAlertType("warning");
        setAlertOpen(true);
      }, tiempoRestante - AVISO_ANTES);
    }

    const logoutTimer = setTimeout(() => {
      logout();
      window.location.href = "/";
    }, tiempoRestante);

    return () => {
      if (avisoTimer) clearTimeout(avisoTimer);
      clearTimeout(logoutTimer);
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        login,
        logout,
        alertOpen,
        setAlertOpen,
        alertMessage,
        alertType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
