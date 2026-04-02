import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./MenuPrincipal.css";

export default function MenuPrincipal() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="menu-container-medico">
        <h2>Panel Médico</h2>
        <div className="menu-options-medico">
          <div
            className="menu-box-medico guardia"
            onClick={() => navigate("/medico/guardia")}
          >
            🏥 <h3>Guardia</h3>
            <p>Lista de espera y evolución de pacientes.</p>
          </div>

          <div
            className="menu-box-medico consultorios"
            onClick={() => navigate("/medico/consultorios")}
          >
            💉 <h3>Consultorios Externos</h3>
            <p>Atención médica ambulatoria.</p>
          </div>

          <div
            className="menu-box-medico hospitalizacion"
            onClick={() => navigate("/medico/hospitalizacion")}
          >
            🏨 <h3>Hospitalización</h3>
            <p>Pacientes internados y registro de evolución clínica.</p>
          </div>

          <div
            className="menu-box-medico pacientes"
            onClick={() => navigate("/medico/pacientes")}
          >
            🔎 <h3>Pacientes</h3>
            <p>Búsqueda y consulta de datos del paciente.</p>
          </div>

        </div>
      </div>
    </>
  );
}
