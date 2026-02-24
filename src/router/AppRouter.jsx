// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import MenuAdmin from "../pages/administrativo/MenuPrincipal";
import MenuMedico from "../pages/medico/MenuPrincipal";
import AltaPaciente from "../pages/administrativo/AltaPaciente";
import Header from "../components/Header";
import { Link } from "react-router-dom";

const GuardiaAdmin = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Guardia - Administrativo</h2>
    <Link to="alta-paciente" className="btn btn-primary">
      Alta Paciente
    </Link>
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

const GuardiaMedico = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Guardia - Administrativo</h2>
  </>
);

const ConsultoriosMedico = () => (
  <>
    <Header />
    <h2 style={{ padding: "20px" }}>Consultorios Externos - Administrativo</h2>
  </>
);

const HospitalizacionMedico = () => (
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
        path="/administrativo/*"
        element={
          <ProtectedRoute rolPermitido="administrativo">
            <Routes>
              {/* index = ruta principal /administrativo */}
              <Route index element={<MenuAdmin />} />

              {/* subrutas */}
              <Route
                path="guardia/*"
                element={
                  <Routes>
                    <Route index element={<GuardiaAdmin />} />
                    <Route path="alta-paciente" element={<AltaPaciente />} />
                    <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
                  </Routes>
                }
              />

              <Route
                path="consultorios/*"
                element={
                  <Routes>
                    <Route index element={<ConsultoriosAdmin />} />
                    <Route path="alta-paciente" element={<AltaPaciente />} />
                    <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
                  </Routes>
                }
              />

              <Route
                path="hospitalizacion/*"
                element={
                  <Routes>
                    <Route index element={<HospitalizacionAdmin />} />
                    <Route path="alta-paciente" element={<AltaPaciente />} />
                    <Route path="*" element={<h2 style={{ padding: "20px" }}>Sección no encontrada</h2>} />
                  </Routes>
                }
              />

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
