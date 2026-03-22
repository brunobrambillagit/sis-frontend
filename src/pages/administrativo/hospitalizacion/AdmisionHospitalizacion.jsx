import { useNavigate } from "react-router-dom";
import AltaPaciente from "../AltaPaciente";
import Header from "../../../components/Header";

export default function AdmisionHospitalizacion() {
  const navigate = useNavigate();

  return (
    <>
    <Header/>
      <AltaPaciente redirectOnSuccess="/administrativo/hospitalizacion" />
    </>
  );
}