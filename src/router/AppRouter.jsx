// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import MenuAdmin from "../pages/administrativo/MenuPrincipal";
import MenuMedico from "../pages/medico/MenuPrincipal";
import AltaPaciente from "../pages/administrativo/AltaPaciente";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import ListaEsperaGuardiaAdmin from "../pages/administrativo/guardia/ListaEspera";
import ListaEsperaConsultoriosAdmin from "../pages/administrativo/consultorios/ListaEspera";
import ListaPacientesHospitalizacionAdmin from "../pages/administrativo/hospitalizacion/ListaPacientes";
import AdmisionGuardia from "../pages/administrativo/guardia/AdmisionGuardia";
import AdmisionConsultorios from "../pages/administrativo/consultorios/AdmisionConsultorios";
import AdmisionHospitalizacion from "../pages/administrativo/hospitalizacion/AdmisionHospitalizacion";


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
  const { usuario } = useAuth();

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas del administrador*/}
      <Route
        path="/administrativo/*"
        element={
          <ProtectedRoute rolPermitido="administrativo">
            <Routes>
              {/* index = ruta principal /administrativo */}
              <Route index element={<MenuAdmin />} />

              {/* subrutas */}
              <Route path="guardia" element={<ListaEsperaGuardiaAdmin />} />
              <Route path="guardia/admision" element={<AdmisionGuardia />} />


              <Route path="consultorios" element={<ListaEsperaConsultoriosAdmin />} />
              <Route path="consultorios/admision" element={<AdmisionConsultorios />} />


              <Route path="hospitalizacion" element={<ListaPacientesHospitalizacionAdmin />} />
              <Route path="hospitalizacion/admision" element={<AdmisionHospitalizacion />} />

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
            <Routes>     
              {/* index = ruta principal /medico */}
              <Route index element={<MenuMedico />} />

              {/* subrutas */}
              <Route path="guardia" element={<GuardiaMedico />} />
              <Route path="consultorios" element={<ConsultoriosMedico />} />
              <Route path="hospitalizacion" element={<HospitalizacionMedico />} />

              {/* fallback */}
              <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
