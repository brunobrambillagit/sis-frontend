import Header from "../../../components/Header";
import EpisodiosMedicoTable from "../../../components/EpisodiosMedicoTable";

export default function ListaEspera() {
  return (
    <>
      <Header />
      <EpisodiosMedicoTable
        servicio="CONSULTORIOS"
        titulo="Consultorios - Lista de espera médica"
      />
    </>
  );
}
