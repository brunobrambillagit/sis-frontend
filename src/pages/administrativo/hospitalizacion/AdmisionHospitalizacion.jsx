import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AdmitirPacienteHospitalizacion from "./AdmitirPacienteHospitalizacion.jsx";

export default function AdmisionHospitalizacion() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Admisión de Hospitalización</h2>
            <p className="sis-page-subtitle">
              Buscá un paciente por DNI, controla y/o actualiza sus datos, seleccioná una cama y luego generá la admisión en hospitalización.
            </p>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate("/administrativo/hospitalizacion")}
            >
              Volver
            </button>
          </div>
        </div>

        <AdmitirPacienteHospitalizacion />
      </div>
    </>
  );
}