import { useNavigate } from "react-router-dom";
import AltaPaciente from "../AltaPaciente"; // ajustá la ruta si tu AltaPaciente está en otro lugar
import Header from "../../../components/Header";


export default function AdmisionGuardia() {
  const navigate = useNavigate();

  return (
    <>      <Header />
    <div>
      <AltaPaciente />
    </div>
        </>
  );
}