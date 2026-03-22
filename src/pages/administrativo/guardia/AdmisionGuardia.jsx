import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AdmitirPacienteGuardia from "./AdmitirPacienteGuardia";

export default function AdmisionGuardia() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Admisión de Guardia</h2>
            <p className="sis-page-subtitle">
              Buscá un paciente por DNI, controla y/o actualiza sus datos y luego generá la admisión en guardia.
            </p>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate("/administrativo/guardia")}
            >
              Volver
            </button>
          </div>
        </div>

        <AdmitirPacienteGuardia />
      </div>
    </>
  );
}