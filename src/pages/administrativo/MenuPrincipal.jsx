import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./MenuPrincipal.css";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="menu-container">
        <h2>Panel Administrativo</h2>
        <div className="menu-options">
          <div
            className="menu-box guardia"
            onClick={() => navigate("/administrativo/guardia")}
          >
            🏥 <h3>Guardia</h3>
            <p>Lista de espera y admisión de pacientes.</p>
          </div>

          <div
            className="menu-box consultorios"
            onClick={() => navigate("/administrativo/consultorios")}
          >
            💉 <h3>Consultorios Externos</h3>
            <p>Admisión y gestión de consultorios.</p>
          </div>

          <div
            className="menu-box hospitalizacion"
            onClick={() => navigate("/administrativo/hospitalizacion")}
          >
            🏨 <h3>Hospitalización</h3>
            <p>Pacientes internados y evolución clínica.</p>
          </div>

        
          <div
            className="menu-box pacientes"
            onClick={() => navigate("/administrativo/pacientes")}
          >
            🔎 <h3>Pacientes</h3>
            <p>Búsqueda y actualización de datos del paciente.</p>
          </div>

        </div>
      </div>
    </>
  );
}
