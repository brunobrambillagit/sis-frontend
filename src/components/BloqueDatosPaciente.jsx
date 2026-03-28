function limpiarDni(value) {
  return (value || "").replace(/\D/g, "");
}

export default function BloqueDatosPaciente({
  form,
  onChange,
  disabled,
  modo,
  minFechaNacimiento,
  maxFechaNacimiento,
}) {
  return (
    <>
      <div className="sis-form-grid">
        <div className="sis-form-group">
          <label className="sis-form-label">Nombre</label>
          <input
            className="sis-form-control"
            name="nombre"
            value={form.nombre}
            onChange={onChange}
            required={modo === "nuevo"}
            disabled={disabled}
          />
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">Apellido</label>
          <input
            className="sis-form-control"
            name="apellido"
            value={form.apellido}
            onChange={onChange}
            required={modo === "nuevo"}
            disabled={disabled}
          />
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">Fecha de nacimiento</label>
          <input
            type="date"
            className="sis-form-control"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={onChange}
            min={minFechaNacimiento}
            max={maxFechaNacimiento}
            disabled={disabled}
          />
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">Edad</label>
          <input className="sis-form-control" value={form.edad} disabled />
          <small className="sis-text-muted">
            La edad se calcula automáticamente a partir de la fecha de nacimiento.
          </small>
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">Sexo</label>
          <select
            className="sis-form-control"
            name="sexo"
            value={form.sexo}
            onChange={onChange}
            disabled={disabled}
          >
            <option value="">Seleccionar...</option>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
          </select>
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">Estado de la persona</label>
          <select
            className="sis-form-control"
            name="estadoPersona"
            value={form.estadoPersona}
            onChange={onChange}
            disabled={disabled}
          >
            <option value="VIVO">Vivo</option>
            <option value="FALLECIDO">Fallecido</option>
          </select>
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">DNI a registrar</label>
          <input
            className="sis-form-control"
            value={limpiarDni(form.dni)}
            disabled
          />
          <small className="sis-text-muted">
            Este es el DNI utilizado en la búsqueda y será el que se guardará como nuevo paciente.
          </small>
        </div>
      </div>

      {modo !== "nuevo" && (
        <div style={{ marginTop: "16px" }} className="sis-text-muted">
          Primero se debe buscar por DNI. Si no existe un paciente con ese DNI,
          se habilita la carga de datos.
        </div>
      )}
    </>
  );
}

