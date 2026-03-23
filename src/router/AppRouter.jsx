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
import CambiarCamaHospitalizacionAdmin from "../pages/administrativo/hospitalizacion/CambiarCamaHospitalizacion";
import HistorialTrasladosHospitalizacionAdmin from "../pages/administrativo/hospitalizacion/HistorialTrasladosHospitalizacion";

import ListaEsperaGuardiaMedico from "../pages/medico/guardia/ListaEspera";
import ListaEsperaConsultoriosMedico from "../pages/medico/consultorios/ListaEspera";
import ListaEsperaHospitalizacionMedico from "../pages/medico/hospitalizacion/ListaEspera";
import CambiarCamaHospitalizacionMedico from "../pages/medico/hospitalizacion/CambiarCamaHospitalizacion";
import HistorialTrasladosHospitalizacionMedico from "../pages/medico/hospitalizacion/HistorialTrasladosHospitalizacion";

import EpisodioDetalle from "../pages/medico/EpisodioDetalle";

import CrearPacienteGuardia from "../pages/administrativo/guardia/CrearPacienteGuardia";
import CrearPacienteHospitalizacion from "../pages/administrativo/hospitalizacion/CrearPacienteHospitalizacion";

const LayoutConHeader = () => (
  <>
    <Outlet />
  </>
);

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

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
        <Route path="guardia/crear-paciente" element={<CrearPacienteGuardia />} />
        <Route path="guardia/admision" element={<AdmisionGuardia />} />

        <Route path="consultorios" element={<ListaEsperaConsultoriosAdmin />} />
        <Route path="consultorios/admision" element={<AdmisionConsultorios />} />

        <Route path="hospitalizacion" element={<ListaPacientesHospitalizacionAdmin />} />
        <Route path="hospitalizacion/crear-paciente" element={<CrearPacienteHospitalizacion />} />
        <Route path="hospitalizacion/admision" element={<AdmisionHospitalizacion />} />
        <Route path="hospitalizacion/traslado-cama/:episodioId" element={<CambiarCamaHospitalizacionAdmin />} />
        <Route path="hospitalizacion/historial-traslados/:episodioId" element={<HistorialTrasladosHospitalizacionAdmin />} />


        <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
      </Route>

      <Route
        path="/medico"
        element={
          <ProtectedRoute rolPermitido="medico">
            <LayoutConHeader />
          </ProtectedRoute>
        }
      >
        <Route index element={<MenuMedico />} />
        <Route path="guardia" element={<ListaEsperaGuardiaMedico />} />
        <Route path="consultorios" element={<ListaEsperaConsultoriosMedico />} />
        <Route path="hospitalizacion" element={<ListaEsperaHospitalizacionMedico />} />
        <Route path="hospitalizacion/traslado-cama/:episodioId" element={<CambiarCamaHospitalizacionMedico />} />
        <Route path="hospitalizacion/historial-traslados/:episodioId" element={<HistorialTrasladosHospitalizacionMedico />} />
        <Route path="episodios/:id" element={<EpisodioDetalle />} />

        <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
      </Route>
    </Routes>
  );
}
