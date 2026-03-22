import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import EpisodiosActivosTableGuardia from "../../../components/EpisodiosActivosTableGuardia";

export default function ListaEspera() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <EpisodiosActivosTableGuardia
        servicio="GUARDIA"
        titulo="Listado de pacientes en Guardia"
        mostrarAccionesGuardia={true}
      />
    </>
  );
}