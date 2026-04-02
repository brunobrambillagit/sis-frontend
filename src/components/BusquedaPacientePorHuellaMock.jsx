export default function BusquedaPacientePorHuellaMock({ onPacienteEncontrado }) {
  const buscarMock = () => {
    const pacienteFake = {
      dni: "12345678",
      nombre: "Paciente",
      apellido: "Huella",
    };

    onPacienteEncontrado?.(pacienteFake);
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button className="sis-btn sis-btn-outline" onClick={buscarMock}>
        Buscar por huella (mock)
      </button>
    </div>
  );
}