import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import EpisodiosActivosTableGuardia from "../../../components/EpisodiosActivosTableGuardia";

export default function ListaPacientes() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <EpisodiosActivosTableGuardia
        servicio="HOSPITALIZACION"
        titulo="Lista de pacientes Hospitalizados"
        mostrarBotonAdmision={true}
        onAdmision={() => navigate("/administrativo/hospitalizacion/admision")}
      />
    </>
  );
}

