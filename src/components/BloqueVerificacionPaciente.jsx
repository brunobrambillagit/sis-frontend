export default function BloqueVerificacionPaciente({
  form,
  onChange,
  onBuscar,
  onReset,
  disabledGeneral,
  loadingBuscar,
  pacienteMostrado,
  nroHistoriaClinica,
  modo,
}) {
  return (
    <>
      <div className="sis-form-grid">
        <div className="sis-form-group">
          <label className="sis-form-label">DNI</label>
          <input
            className="sis-form-control"
            name="dni"
            value={form.dni}
            onChange={onChange}
            placeholder="Ingrese el DNI a buscar..."
            disabled={disabledGeneral}
          />
        </div>
      </div>

      <div className="sis-page-actions" style={{ marginTop: "16px" }}>
        <button
          type="button"
          className="sis-btn sis-btn-primary"
          onClick={onBuscar}
          disabled={disabledGeneral}
        >
          {loadingBuscar ? "Buscando..." : "Buscar"}
        </button>

        <button
          type="button"
          className="sis-btn sis-btn-outline"
          onClick={onReset}
          disabled={disabledGeneral}
        >
          Limpiar campos
        </button>
      </div>

      {pacienteMostrado && (
        <div className="sis-detail-grid" style={{ marginTop: "18px" }}>
          <div className="sis-detail-item sis-detail-item--highlight">
            <span className="sis-detail-label">Paciente</span>
            <div className="sis-detail-value">
              {pacienteMostrado.apellido || "-"}, {pacienteMostrado.nombre || "-"}
            </div>
          </div>

          <div className="sis-detail-item">
            <span className="sis-detail-label">DNI</span>
            <div className="sis-detail-value">
              {pacienteMostrado.dni || form.dni || "-"}
            </div>
          </div>

          <div className="sis-detail-item">
            <span className="sis-detail-label">Historia clínica</span>
            <div className="sis-detail-value">
              {pacienteMostrado.nroHistoriaClinica || nroHistoriaClinica || "-"}
            </div>
          </div>

          <div className="sis-detail-item">
            <span className="sis-detail-label">Estado del flujo</span>
            <div className="sis-detail-value">
              {modo === "encontrado"
                ? "Paciente existente"
                : modo === "nuevo"
                ? "Nuevo paciente"
                : "Pendiente de búsqueda"}
            </div>
          </div>
        </div>
      )}
    </>
  );
}