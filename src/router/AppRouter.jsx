// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import MenuAdmin from "../pages/administrativo/MenuPrincipal";
import MenuMedico from "../pages/medico/MenuPrincipal";

export default function AppRouter() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute rolPermitido="administrativo">
            <MenuAdmin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medico/*"
        element={
          <ProtectedRoute rolPermitido="medico">
            <MenuMedico />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
