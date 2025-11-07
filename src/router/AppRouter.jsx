// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import MenuAdmin from "../pages/administrativo/MenuPrincipal";
import MenuMedico from "../pages/medico/MenuPrincipal";

const GuardiaAdmin = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Guardia - Administrativo</h2>
  </>
);

const ConsultoriosAdmin = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Consultorios Externos - Administrativo</h2>
  </>
);

const HospitalizacionAdmin = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Hospitalización - Administrativo</h2>
  </>
);


export default function AppRouter() {
  const { usuario } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas del administrador*/}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute rolPermitido="administrativo">
            <Routes>
              {/* index = ruta principal /admin */}
              <Route index element={<MenuAdmin />} />

              {/* subrutas */}
              <Route path="guardia" element={<GuardiaAdmin />} />
              <Route path="consultorios" element={<ConsultoriosAdmin />} />
              <Route path="hospitalizacion" element={<HospitalizacionAdmin />} />

              {/* fallback */}
              <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
            </Routes>
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
