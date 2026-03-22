import { useMemo, useState } from "react";
import { obtenerPacientePorDni, actualizarPacientePorDni } from "../../../api/pacientesApi";
import { crearEpisodio } from "../../../api/episodiosApi";
import { useAuth } from "../../../context/AuthContext";

const initialForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  edad: "",
  sexo: "",
  estadoPersona: "",
  nroHistoriaClinica: "",
};

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

  return "";
}

function parseBackendMessage(err) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || data?.mensaje || "";
}

export default function AdmitirPacienteGuardia() {
  const { usuario } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [pacienteOriginal, setPacienteOriginal] = useState(null);
  const [pacienteActualizado, setPacienteActualizado] = useState(null);
  const [episodioCreado, setEpisodioCreado] = useState(null);

  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingGuardarYAdmitir, setLoadingGuardarYAdmitir] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const disabledGeneral = loadingBuscar || loadingGuardarYAdmitir;
  const pacienteActivo = pacienteActualizado || pacienteOriginal;

  const puedeAdmitir = useMemo(() => {
    return Boolean(pacienteActivo?.id && usuario?.id);
  }, [pacienteActivo, usuario]);

  const resetAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const resetTodo = () => {
    setForm(initialForm);
    setPacienteOriginal(null);
    setPacienteActualizado(null);
    setEpisodioCreado(null);
    resetAlerts();
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setPacienteOriginal(null);
      setPacienteActualizado(null);
      setEpisodioCreado(null);
      resetAlerts();
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

  const cargarPacienteEnFormulario = (paciente) => {
    setForm({
      dni: paciente?.dni || "",
      nombre: paciente?.nombre || "",
      apellido: paciente?.apellido || "",
      fechaNacimiento: toDateInputValue(paciente?.fechaNacimiento),
      edad: paciente?.edad ?? "",
      sexo: paciente?.sexo || "",
      estadoPersona: paciente?.estadoPersona || "",
      nroHistoriaClinica: paciente?.nroHistoriaClinica || "",
    });
  };

  const buscarPaciente = async () => {
    resetAlerts();
    setPacienteOriginal(null);
    setPacienteActualizado(null);
    setEpisodioCreado(null);

    const dniLimpio = limpiarDni(form.dni);
    if (!dniLimpio) {
      setErrorMsg("DNI inválido.");
      return;
    }

    setLoadingBuscar(true);
    try {
      const paciente = await obtenerPacientePorDni(dniLimpio);
      setPacienteOriginal(paciente);
      cargarPacienteEnFormulario(paciente);
      setSuccessMsg("Paciente encontrado. Verificá o actualizá los datos y luego generá la admisión.");
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      if (status === 400 && msg.includes("No existe paciente con DNI")) {
        setErrorMsg("El paciente no existe. Para continuar, primero debés crearlo desde el apartado Crear paciente.");
        return;
      }

      setErrorMsg(msg || "Error al buscar paciente.");
    } finally {
      setLoadingBuscar(false);
    }
  };

  const guardarCambiosYAdmitir = async (e) => {
    e.preventDefault();
    resetAlerts();
    setEpisodioCreado(null);

    if (!usuario?.id) {
      setErrorMsg("No se pudo obtener el usuario logueado.");
      return;
    }

    if (!pacienteOriginal?.id) {
      setErrorMsg("Primero buscá un paciente existente.");
      return;
    }

    const dniLimpio = limpiarDni(form.dni || pacienteOriginal.dni);
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

    setLoadingGuardarYAdmitir(true);
    try {
      const payloadPaciente = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento || null,
        edad: form.edad === "" ? null : edadNumero,
        sexo: form.sexo || null,
        estadoPersona: form.estadoPersona || null,
      };

      const paciente = await actualizarPacientePorDni(dniLimpio, payloadPaciente);
      setPacienteActualizado(paciente);
      cargarPacienteEnFormulario(paciente);

      const payloadEpisodio = {
        pacienteId: paciente.id,
        tipoServicio: "GUARDIA",
        usuarioId: usuario.id,
      };

      const episodio = await crearEpisodio(payloadEpisodio);
      setEpisodioCreado(episodio);
      setSuccessMsg("Paciente actualizado y admisión de guardia generada correctamente.");
    } catch (err) {
      setErrorMsg(parseBackendMessage(err) || "Error al actualizar y admitir al paciente.");
    } finally {
      setLoadingGuardarYAdmitir(false);
    }
  };

  return (
    <div className="sis-detail-layout">
      <section className="sis-card sis-section-card">
        <div className="sis-section-header">
          <div>
            <h3 className="sis-section-title">Buscar paciente para admisión</h3>
            {/* <p className="sis-text-muted" style={{ marginTop: "6px" }}>
              En este apartado solo se admiten pacientes ya existentes.
            </p> */}
          </div>
        </div>

        <div className="sis-card-body">
          {errorMsg && (
            <div className="sis-alert sis-alert-danger" role="alert">
              <div>{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="sis-alert sis-alert-success" role="alert">
              <div>{successMsg}</div>
              {episodioCreado?.id && (
                <div className="mt-2">
                  <strong>ID episodio:</strong> {episodioCreado.id}
                </div>
              )}
            </div>
          )}

          <div className="sis-form-grid">
            <div className="sis-form-group">
              <label className="sis-form-label">DNI</label>
              <input
                className="sis-form-control"
                name="dni"
                value={form.dni}
                onChange={onChange}
                placeholder="Ingresa el dni a buscar..."
                disabled={disabledGeneral}
              />
            </div>
          </div>

          <div className="sis-page-actions" style={{ marginTop: "16px" }}>
            <button
              type="button"
              className="sis-btn sis-btn-primary"
              onClick={buscarPaciente}
              disabled={disabledGeneral}
            >
              {loadingBuscar ? "Buscando..." : "Buscar paciente"}
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
        </div>
      </section>

      <section className="sis-card sis-section-card">
        <div className="sis-section-header">
          <div>
            <h3 className="sis-section-title">Datos del paciente</h3>
            {/* <p className="sis-text-muted" style={{ marginTop: "6px" }}>
              Podés modificar todos los datos permitidos antes de confirmar la admisión.
              El DNI y el número de historia clínica quedan solo lectura.
            </p> */}
          </div>
        </div>

        <div className="sis-card-body">
          <form onSubmit={guardarCambiosYAdmitir}>
            <div className="sis-form-grid">
              <div className="sis-form-group">
                <label className="sis-form-label">Nombre</label>
                <input
                  className="sis-form-control"
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  disabled={!pacienteOriginal || disabledGeneral}
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Apellido</label>
                <input
                  className="sis-form-control"
                  name="apellido"
                  value={form.apellido}
                  onChange={onChange}
                  disabled={!pacienteOriginal || disabledGeneral}
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
                  disabled={!pacienteOriginal || disabledGeneral}
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Edad</label>
                <input
                  className="sis-form-control"
                  name="edad"
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
                  disabled={!pacienteOriginal || disabledGeneral}
                >
                  <option value="">Seleccionar</option>
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
                  disabled={!pacienteOriginal || disabledGeneral}
                >
                  <option value="">Seleccionar</option>
                  <option value="VIVO">Vivo</option>
                  <option value="FALLECIDO">Fallecido</option>
                </select>
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">DNI</label>
                <input
                  className="sis-form-control"
                  name="dniReadonly"
                  value={form.dni}
                  disabled
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">N° Historia clínica</label>
                <input
                  className="sis-form-control"
                  name="nroHistoriaClinica"
                  value={form.nroHistoriaClinica}
                  disabled
                />
              </div>
            </div>

            {pacienteActivo && (
              <div className="sis-detail-grid" style={{ marginTop: "18px" }}>
                <div className="sis-detail-item">
                  <span className="sis-detail-label">ID paciente</span>
                  <div className="sis-detail-value">{pacienteActivo.id || "-"}</div>
                </div>

                <div className="sis-detail-item">
                  <span className="sis-detail-label">Fecha alta</span>
                  <div className="sis-detail-value">{pacienteActivo.fechaAlta || "-"}</div>
                </div>

                <div className="sis-detail-item">
                  <span className="sis-detail-label">Última modificación</span>
                  <div className="sis-detail-value">{pacienteActivo.fechaModificacion || "-"}</div>
                </div>
              </div>
            )}

            <div className="sis-page-actions" style={{ marginTop: "20px" }}>
              <button
                type="submit"
                className="sis-btn sis-btn-primary"
                disabled={!pacienteOriginal || !puedeAdmitir || disabledGeneral}
              >
                {loadingGuardarYAdmitir ? "Guardando y admitiendo..." : "Guardar cambios y admitir"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}