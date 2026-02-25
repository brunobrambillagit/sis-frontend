import { useNavigate } from "react-router-dom";
import AltaPaciente from "../AltaPaciente"; // ajustá la ruta si tu AltaPaciente está en otro lugar

export default function AdmisionGuardia() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Guardia - Admisión</h2>

      <button
        type="button"
        onClick={() => navigate("/administrativo/guardia")}
        className="btn btn-outline-secondary mb-3"
      >
        Volver a Guardia
      </button>

      <AltaPaciente />
    </div>
  );
}