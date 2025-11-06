// src/router/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, rolPermitido }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" />;
  if (rolPermitido && usuario.rol !== rolPermitido) return <Navigate to="/login" />;
  return children;
}
