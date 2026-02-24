// src/router/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { usuario, token } = useAuth();

  // Si no hay token, no está autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay restricción de roles
  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}