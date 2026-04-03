export default function BusquedaPacientePorHuellaMock({
  onPacienteEncontrado,
  disabled = false,
  buttonText = "Buscar por huella (mock)",
}) {
  const buscarMock = () => {
    if (disabled) return;

    const pacienteFake = {
      dni: "12345678",
      nombre: "Paciente",
      apellido: "Huella",
    };

    onPacienteEncontrado?.(pacienteFake);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        className="sis-btn sis-btn-outline"
        onClick={buscarMock}
        disabled={disabled}
      >
        {buttonText}
      </button>
    </div>
  );
}