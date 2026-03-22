import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { crearPaciente, obtenerPacientePorDni, actualizarPacientePorDni } from "../../api/pacientesApi";

const initialForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  edad: "",
  sexo: "",
  estadoPersona: "VIVO",
};

function limpiarDni(value) {
  return (value || "").replace(/\D/g, "");
}

function toDateInputValue(value) {
  if (!value) return "";

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calcularEdadDesdeFecha(fechaNacimiento) {
  if (!fechaNacimiento) return "";

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad >= 0 ? String(edad) : "";
}

function formatearFechaInput(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerFechaMinNacimiento() {
  const hoy = new Date();
  const fechaMin = new Date(hoy);
  fechaMin.setFullYear(hoy.getFullYear() - 120);
  return formatearFechaInput(fechaMin);
}

function obtenerFechaMaxNacimiento() {
  return formatearFechaInput(new Date());
}

function parseBackendMessage(err) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || data?.mensaje || "";
}

export default function AltaPaciente({
  titulo = "Crear paciente",
  subtitulo = "Buscá un paciente por DNI y, si no existe, registralo.",
  textoExitoCreacion = "Paciente creado correctamente.",
  redirectOnSuccess,
  onIrAAdmitirPaciente,
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [modo, setModo] = useState("idle");
  // idle | encontrado | nuevo

  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [pacienteCreado, setPacienteCreado] = useState(null);

  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [nroHistoriaClinica, setNroHistoriaClinica] = useState(null);

  const disabledGeneral = useMemo(
    () => loadingBuscar || loadingCrear,
    [loadingBuscar, loadingCrear]
  );

  const resetAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setWarningMsg("");
  };

  const resetTodo = () => {
    setForm(initialForm);
    setModo("idle");
    setPacienteEncontrado(null);
    setPacienteCreado(null);
    setNroHistoriaClinica(null);
    resetAlerts();
  };

  const cargarPacienteEnFormulario = (paciente) => {
    setForm({
      dni: paciente?.dni || "",
      nombre: paciente?.nombre || "",
      apellido: paciente?.apellido || "",
      fechaNacimiento: toDateInputValue(paciente?.fechaNacimiento),
      edad: paciente?.edad ?? "",
      sexo: paciente?.sexo || "",
      estadoPersona: paciente?.estadoPersona || "VIVO",
    });
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setForm((prev) => ({ ...prev, dni: value }));
      setModo("idle");
      setPacienteEncontrado(null);
      setPacienteCreado(null);
      setNroHistoriaClinica(null);
      resetAlerts();
      return;
    }

    if (name === "fechaNacimiento") {
      const edadCalculada = calcularEdadDesdeFecha(value);
      setForm((prev) => ({
        ...prev,
        fechaNacimiento: value,
        edad: edadCalculada,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buscarPorDni = async () => {
    resetAlerts();
    setNroHistoriaClinica(null);
    setPacienteEncontrado(null);
    setPacienteCreado(null);

    const dniLimpio = limpiarDni(form.dni);
    if (!dniLimpio) {
      setErrorMsg("DNI inválido.");
      return;
    }

    setLoadingBuscar(true);
    try {
      const paciente = await obtenerPacientePorDni(dniLimpio);
      setPacienteEncontrado(paciente);
      setModo("encontrado");
      setSuccessMsg("El paciente ya existe en el sistema.");
      cargarPacienteEnFormulario(paciente);
      setNroHistoriaClinica(paciente?.nroHistoriaClinica || null);
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      if (status === 400 && msg.includes("No existe paciente con DNI")) {
        setModo("nuevo");
        setForm((prev) => ({ ...prev, dni: dniLimpio }));
        setSuccessMsg("No existe el paciente. Completá los datos para crearlo.");
        return;
      }

      setErrorMsg(msg || "Error al buscar paciente.");
    } finally {
      setLoadingBuscar(false);
    }
  };

  const crearNuevoPaciente = async (e) => {
    e.preventDefault();
    resetAlerts();
    setNroHistoriaClinica(null);
    setPacienteCreado(null);

    if (modo !== "nuevo") {
      setErrorMsg("Primero buscá por DNI. Si no existe, se habilita la creación.");
      return;
    }

    const dniLimpio = limpiarDni(form.dni);
    if (!dniLimpio) {
      setErrorMsg("DNI inválido.");
      return;
    }

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setErrorMsg("Nombre y apellido son obligatorios.");
      return;
    }

    const edadNumero = form.edad === "" ? null : Number(form.edad);
    if (form.edad !== "" && Number.isNaN(edadNumero)) {
      setErrorMsg("La edad debe ser numérica.");
      return;
    }

    setLoadingCrear(true);
    try {
      const payloadCrear = {
        dni: dniLimpio,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
      };

      const creadoBase = await crearPaciente(payloadCrear);

      const payloadActualizacion = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento || null,
        edad: form.edad === "" ? null : edadNumero,
        sexo: form.sexo || null,
        estadoPersona: form.estadoPersona || null,
      };

      let pacienteFinal = creadoBase;

      try {
        pacienteFinal = await actualizarPacientePorDni(dniLimpio, payloadActualizacion);
      } catch (errUpdate) {
        pacienteFinal = creadoBase;
        setWarningMsg(
          parseBackendMessage(errUpdate) ||
            "El paciente se creó correctamente, pero no se pudieron guardar todos los datos adicionales."
        );
      }

      setPacienteCreado(pacienteFinal);
      setModo("encontrado");
      setSuccessMsg(textoExitoCreacion);
      setNroHistoriaClinica(
        pacienteFinal?.nroHistoriaClinica || creadoBase?.nroHistoriaClinica || null
      );
      cargarPacienteEnFormulario({
        ...pacienteFinal,
        dni: pacienteFinal?.dni || dniLimpio,
      });
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      if (status === 400) {
        setErrorMsg(msg || "Datos inválidos.");
      } else if (status === 409) {
        setErrorMsg(msg || "Ya existe un paciente con ese DNI.");
      } else {
        setErrorMsg(msg || "Error inesperado al crear el paciente.");
      }
    } finally {
      setLoadingCrear(false);
    }
  };

  const pacienteMostrado = pacienteCreado || pacienteEncontrado;

  return (
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">{titulo}</h2>
          <p className="sis-page-subtitle">{subtitulo}</p>
        </div>

        <div className="sis-page-actions">
          <button
            className="sis-btn sis-btn-outline"
            onClick={() => navigate(-1)}
            type="button"
          >
            Volver
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="sis-alert sis-alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      {warningMsg && (
        <div className="sis-alert sis-alert-warning" role="alert">
          {warningMsg}
        </div>
      )}

      {successMsg && (
        <div className="sis-alert sis-alert-success" role="alert">
          <div>{successMsg}</div>
          {nroHistoriaClinica && (
            <div className="mt-2">
              <strong>N° Historia Clínica:</strong> {nroHistoriaClinica}
            </div>
          )}

          {modo === "encontrado" && pacienteEncontrado && onIrAAdmitirPaciente && (
            <div className="mt-3">
              <button
                type="button"
                className="sis-btn sis-btn-outline"
                onClick={onIrAAdmitirPaciente}
              >
                Ir a admitir paciente
              </button>
            </div>
          )}

          {redirectOnSuccess && pacienteCreado && (
            <div className="mt-3">
              <button
                type="button"
                className="sis-btn sis-btn-success"
                onClick={() => navigate(redirectOnSuccess)}
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      )}

      <div className="sis-detail-layout">
        <section className="sis-card sis-section-card">
          <div className="sis-section-header">
            <h3 className="sis-section-title">Buscar paciente por DNI</h3>
          </div>

          <div className="sis-card-body">
            <div className="sis-form-grid">
              <div className="sis-form-group">
                <label className="sis-form-label">DNI</label>
                <input
                  className="sis-form-control"
                  name="dni"
                  value={form.dni}
                  onChange={onChange}
                  placeholder="Ingrese el dni a buscar..."
                  disabled={disabledGeneral}
                />
              </div>
            </div>

            <div className="sis-page-actions" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="sis-btn sis-btn-primary"
                onClick={buscarPorDni}
                disabled={disabledGeneral}
              >
                {loadingBuscar ? "Buscando..." : "Buscar"}
              </button>

              <button
                type="button"
                className="sis-btn sis-btn-outline"
                onClick={resetTodo}
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
                  <div className="sis-detail-value">{pacienteMostrado.dni || form.dni || "-"}</div>
                </div>

                <div className="sis-detail-item">
                  <span className="sis-detail-label">Historia clínica</span>
                  <div className="sis-detail-value">
                    {pacienteMostrado.nroHistoriaClinica || nroHistoriaClinica || "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <form onSubmit={crearNuevoPaciente}>
          <section className="sis-card sis-section-card">
            <div className="sis-section-header">
              <h3 className="sis-section-title">Datos del nuevo paciente</h3>
            </div>

            <div className="sis-card-body">
              <div className="sis-form-grid">
                <div className="sis-form-group">
                  <label className="sis-form-label">Nombre</label>
                  <input
                    className="sis-form-control"
                    name="nombre"
                    value={form.nombre}
                    onChange={onChange}
                    required={modo === "nuevo"}
                    disabled={disabledGeneral || modo !== "nuevo"}
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
                    disabled={disabledGeneral || modo !== "nuevo"}
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
                    min={obtenerFechaMinNacimiento()}
                    max={obtenerFechaMaxNacimiento()}
                    disabled={disabledGeneral || modo !== "nuevo"}
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Edad</label>
                  <input
                    className="sis-form-control"
                    value={form.edad}
                    disabled
                  />
                  <small className="sis-text-muted">
                    La edad se calcula automaticamente a partir de la fecha de nacimiento
                  </small>
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Sexo</label>
                  <select
                    className="sis-form-control"
                    name="sexo"
                    value={form.sexo}
                    onChange={onChange}
                    disabled={disabledGeneral || modo !== "nuevo"}
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
                    disabled={disabledGeneral || modo !== "nuevo"}
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
                    Este es el DNI utilizado en la busqueda y será el que se guardara como nuevo paciente.
                  </small>
                </div>
              </div>

              <div className="sis-page-actions" style={{ marginTop: "20px" }}>
                <button
                  className="sis-btn sis-btn-success"
                  type="submit"
                  disabled={disabledGeneral || modo !== "nuevo"}
                >
                  {loadingCrear ? "Creando..." : "Crear paciente"}
                </button>

                {modo !== "nuevo" && (
                  <span className="sis-text-muted">
                    Primero se debe buscar por DNI, si no existe un paciente con ese DNI, se habilita el boton para crear el nuevo paciente.
                  </span>
                )}
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}