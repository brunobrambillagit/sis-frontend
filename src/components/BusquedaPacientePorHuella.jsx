import { useState } from "react";
import AlertDialog from "./AlertDialog";

export default function BusquedaPacientePorHuellaMock({
  onPacienteEncontrado,
  disabled = false,
}) {
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const buscarMock = () => {
    const pacienteFake = {
      dni: "12345678",
      nombre: "Paciente",
      apellido: "Huella",
      fechaNacimiento: "1990-05-10",
      sexo: "MASCULINO",
      estadoPersona: "VIVO",
      nroHistoriaClinica: "HC-12345678",
    };

    onPacienteEncontrado?.(pacienteFake);

    setDialog({
      open: true,
      title: "Búsqueda por huella",
      message:
        "Se utilizó una búsqueda simulada por huella. Más adelante podés reemplazar este componente por la implementación real.",
      type: "warning",
    });
  };

  return (
    <>
      <section
        className="sis-card sis-section-card"
        style={{ marginTop: "16px" }}
      >
        <div className="sis-section-header">
          <div>
            <h3 className="sis-section-title">Buscar paciente por huella</h3>
          </div>
        </div>

        <div className="sis-card-body">
          <p className="sis-text-muted" style={{ marginTop: 0, marginBottom: 16 }}>
            Por el momento esta búsqueda funciona en modo temporal/mock.
          </p>

          <div className="sis-page-actions">
            <button
              type="button"
              className="sis-btn sis-btn-outline"
              onClick={buscarMock}
              disabled={disabled}
            >
              Buscar por huella
            </button>
          </div>
        </div>
      </section>

      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}