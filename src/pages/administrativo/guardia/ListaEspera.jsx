import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";


export default function ListaEspera() {
const navigate = useNavigate();

  return (
    <><Header />
    <div style={{ padding: "20px" }}>
      <h2>Lista de espera - Guardia</h2>
      <p>Bienvenido al panel administrativo del Sistema Integral Sanitario.</p>
    </div>
    <button
    className="btn btn-primary"
    onClick={() => navigate("/administrativo/guardia/admision")}
    >
    Admisionar paciente
    </button>
    </>
  );
}
