// src/router/AppRouter.jsx
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import Header from "../components/Header";

import MenuAdmin from "../pages/administrativo/MenuPrincipal";
import MenuMedico from "../pages/medico/MenuPrincipal";

import ListaEsperaGuardiaAdmin from "../pages/administrativo/guardia/ListaEspera";
import ListaEsperaConsultoriosAdmin from "../pages/administrativo/consultorios/ListaEspera";
import ListaPacientesHospitalizacionAdmin from "../pages/administrativo/hospitalizacion/ListaPacientes";

import AdmisionGuardia from "../pages/administrativo/guardia/AdmisionGuardia";
import AdmisionConsultorios from "../pages/administrativo/consultorios/AdmisionConsultorios";
import AdmisionHospitalizacion from "../pages/administrativo/hospitalizacion/AdmisionHospitalizacion";

const LayoutConHeader = () => (
  <>
    <Outlet />
  </>
);

const GuardiaMedico = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Guardia - Medico</h2>
  </>
);

const ConsultoriosMedico = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Consultorios Externos - Medico</h2>
  </>
);

const HospitalizacionMedico = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Hospitalización - Medico</h2>
  </>
);

export default function AppRouter() {
  return (
    <Routes>
      {/* públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* administrativo */}
      <Route
        path="/administrativo"
        element={
          <ProtectedRoute rolPermitido="administrativo">
            <LayoutConHeader />
          </ProtectedRoute>
        }
      >
        <Route index element={<MenuAdmin />} />
        <Route path="guardia" element={<ListaEsperaGuardiaAdmin />} />
        <Route path="guardia/admision" element={<AdmisionGuardia />} />

        <Route path="consultorios" element={<ListaEsperaConsultoriosAdmin />} />
        <Route path="consultorios/admision" element={<AdmisionConsultorios />} />

        <Route path="hospitalizacion" element={<ListaPacientesHospitalizacionAdmin />} />
        <Route path="hospitalizacion/admision" element={<AdmisionHospitalizacion />} />

        <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
      </Route>

      {/* médico */}
      <Route
        path="/medico"
        element={
          <ProtectedRoute rolPermitido="medico">
            <LayoutConHeader />
          </ProtectedRoute>
        }
      >
        <Route index element={<MenuMedico />} />
        <Route path="guardia" element={<GuardiaMedico />} />
        <Route path="consultorios" element={<ConsultoriosMedico />} />
        <Route path="hospitalizacion" element={<HospitalizacionMedico />} />
        <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
      </Route>
    </Routes>
  );
}