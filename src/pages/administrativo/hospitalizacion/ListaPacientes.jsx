import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import EpisodiosActivosTable from "../../../components/EpisodiosActivosTable";

export default function ListaPacientes() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <EpisodiosActivosTable
        servicio="HOSPITALIZACION"
        titulo="Lista de pacientes hospitalizados"
        mostrarBotonAdmision={true}
        onAdmision={() => navigate("/administrativo/hospitalizacion/admision")}
      />
    </>
  );
}