import { useNavigate } from "react-router-dom";
import AltaPaciente from "../AltaPaciente";

export default function AdmisionConsultorios() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h2>Consultorios Externos - Admisión</h2>

      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate("/administrativo/consultorios")}
      >
        Volver a Consultorios
      </button>

      <AltaPaciente redirectOnSuccess="/administrativo/consultorios" />
    </div>
  );
}