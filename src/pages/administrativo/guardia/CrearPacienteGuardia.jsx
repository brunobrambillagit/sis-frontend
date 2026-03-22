import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AltaPaciente from "../AltaPaciente";

export default function CrearPacienteGuardia() {
  const navigate = useNavigate();

  return (
    <>
      <Header/>
        <AltaPaciente/>
    </>
  );
}
