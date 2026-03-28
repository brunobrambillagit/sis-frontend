function renderEstadoBiometria(estado) {
  if (estado === "cargado") return "Cargado";
  if (estado === "error") return "Error";
  return "Pendiente";
}

export default function BloqueResumenAltaPaciente({
  form,
  biometria,
  modo,
  loadingCrear,
  puedeCrearPaciente,
  onCrearPaciente,
}) {
  return (
    <>
      <div className="sis-resumen-grid">
        <div className="sis-detail-item sis-detail-item--highlight">
          <span className="sis-detail-label">DNI</span>
          <div className="sis-detail-value">{form.dni || "-"}</div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Nombre completo</span>
          <div className="sis-detail-value">
            {form.apellido || "-"}, {form.nombre || "-"}
          </div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Fecha de nacimiento</span>
          <div className="sis-detail-value">{form.fechaNacimiento || "-"}</div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Edad</span>
          <div className="sis-detail-value">{form.edad || "-"}</div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Sexo</span>
          <div className="sis-detail-value">{form.sexo || "-"}</div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Estado persona</span>
          <div className="sis-detail-value">{form.estadoPersona || "-"}</div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Rostro</span>
          <div className="sis-detail-value">
            {renderEstadoBiometria(biometria.rostro.estado)}
          </div>
        </div>

        <div className="sis-detail-item">
          <span className="sis-detail-label">Huella</span>
          <div className="sis-detail-value">
            {renderEstadoBiometria(biometria.huella.estado)}
          </div>
        </div>
      </div>

      <div className="sis-page-actions" style={{ marginTop: "20px" }}>
        <button
          className="sis-btn sis-btn-success"
          type="button"
          onClick={onCrearPaciente}
          disabled={!puedeCrearPaciente}
        >
          {loadingCrear ? "Creando..." : "Crear paciente"}
        </button>

        {modo !== "nuevo" && (
          <span className="sis-text-muted">
            El alta sólo se habilita cuando el paciente no existe y se completan los datos obligatorios.
          </span>
        )}
      </div>
    </>
  );
}