import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import EpisodiosActivosTableGuardia from "../../../components/EpisodiosActivosTableGuardia";

export default function ListaEspera() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <EpisodiosActivosTableGuardia
        servicio="CONSULTORIOS"
        titulo="Lista de espera - Consultorios"
        mostrarBotonAdmision={true}
        onAdmision={() => navigate("/administrativo/consultorios/admision")}
      />
    </>
  );
}