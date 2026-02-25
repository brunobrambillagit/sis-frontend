import { useNavigate } from "react-router-dom";
import AltaPaciente from "../AltaPaciente";

export default function AdmisionHospitalizacion() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Hospitalización - Admisión</h2>

      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate("/administrativo/hospitalizacion")}
      >
        Volver a Hospitalización
      </button>

      <AltaPaciente redirectOnSuccess="/administrativo/hospitalizacion" />
    </div>
  );
}