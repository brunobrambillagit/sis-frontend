import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import EpisodiosActivosTable from "../../../components/EpisodiosActivosTable";


export default function ListaEspera() {
const navigate = useNavigate();

  return (
    <>
      <Header />
      <EpisodiosActivosTable
        servicio="GUARDIA"
        titulo="Lista de espera - Guardia"
        mostrarBotonAdmision={true}
        onAdmision={() => navigate("/administrativo/guardia/admision")}
      />
    </>
  );
}
