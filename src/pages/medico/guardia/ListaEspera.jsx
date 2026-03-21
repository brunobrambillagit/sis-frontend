import Header from "../../../components/Header";
import EpisodiosMedicoTable from "../../../components/EpisodiosMedicoTable";

export default function ListaEspera() {
  return (
    <>
      <Header />
      <EpisodiosMedicoTable
        servicio="GUARDIA"
        titulo="Listado de pacientes en Guardia"
      />
    </>
  );
}
    