import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AltaPaciente from "../AltaPaciente";
import AdmitirPacienteGuardia from "./AdmitirPacienteGuardia";

export default function AdmisionGuardia() {
  const navigate = useNavigate();
  const [vistaActiva, setVistaActiva] = useState("crear");

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Admisión de guardia</h2>
            <p className="sis-page-subtitle">
              Desde acá podés crear un paciente nuevo o admitir un paciente ya existente.
            </p>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </div>
        </div>

        <section className="sis-card sis-section-card" style={{ marginBottom: "20px" }}>
          <div className="sis-card-body">
            <div className="sis-page-actions">
              <button
                type="button"
                className={`sis-btn ${vistaActiva === "crear" ? "sis-btn-primary" : "sis-btn-outline"}`}
                onClick={() => setVistaActiva("crear")}
              >
                Crear paciente
              </button>

              <button
                type="button"
                className={`sis-btn ${vistaActiva === "admitir" ? "sis-btn-primary" : "sis-btn-outline"}`}
                onClick={() => setVistaActiva("admitir")}
              >
                Admitir paciente
              </button>
            </div>
          </div>
        </section>

        {vistaActiva === "crear" ? (
          <AltaPaciente
            titulo="Alta de paciente"
            subtitulo="Buscá un paciente por DNI y, si no existe, registralo en el sistema."
            textoExitoCreacion="Paciente creado correctamente."
          />
        ) : (
          <AdmitirPacienteGuardia onIrACrearPaciente={() => setVistaActiva("crear")} />
        )}
      </div>
    </>
  );
}
