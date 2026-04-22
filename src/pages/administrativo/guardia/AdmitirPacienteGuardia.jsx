import { useMemo, useState } from "react";
import { actualizarPacientePorDni } from "../../../api/pacientesApi";
import { crearEpisodio } from "../../../api/episodiosApi";
import { useAuth } from "../../../context/AuthContext";
import AlertDialog from "../../../components/AlertDialog";
import ConfirmDialog from "../../../components/ConfirmDialog";
import BuscadorPacienteUniversal from "../../../components/BuscadorPacienteUniversal";
import { useNavigate } from "react-router-dom";

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

const initialDialog = {
  open: false,
  title: "Aviso",
  message: "",
  type: "info",
  buttonText: "Aceptar",
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
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [pacienteOriginal, setPacienteOriginal] = useState(null);
  const [pacienteActualizado, setPacienteActualizado] = useState(null);
  const [episodioCreado, setEpisodioCreado] = useState(null);

  const [loadingGuardarYAdmitir, setLoadingGuardarYAdmitir] = useState(false);
  const [dialog, setDialog] = useState(initialDialog);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dniValidadoParaAdmitir, setDniValidadoParaAdmitir] = useState("");

  const disabledGeneral = loadingGuardarYAdmitir;
  const pacienteActivo = pacienteActualizado || pacienteOriginal;

  const mostrarDialogo = ({
    title = "Aviso",
    message = "",
    type = "info",
    buttonText = "Aceptar",
  }) => {
    setDialog({
      open: true,
      title,
      message,
      type,
      buttonText,
    });
  };

  const cerrarDialogo = () => {
    const esExito =
      dialog.type === "success" && dialog.title === "Admisión generada";

    setDialog(initialDialog);

    if (esExito) {
      navigate(-1);
    }
  };

  const cargarPacienteEncontrado = (paciente, origen = "DNI") => {
    setPacienteOriginal(paciente);
    setPacienteActualizado(null);
    setEpisodioCreado(null);
    setConfirmOpen(false);
    setDniValidadoParaAdmitir("");
    cargarPacienteEnFormulario(paciente);

    mostrarDialogo({
      title: "Paciente encontrado",
      message: `Se encontró un paciente por ${origen}. Verificá o actualizá los datos y luego generá la admisión.`,
      type: "success",
    });
  };

  const manejarPacienteNoEncontrado = (_, err) => {
    if (err?.validation) {
      mostrarDialogo({
        title: "Error",
        message: err.message || "DNI inválido.",
        type: "error",
      });
      return;
    }

    const status = err?.response?.status;
    const msg = parseBackendMessage(err);

    if (status === 400 && msg.includes("No existe paciente con DNI")) {
      mostrarDialogo({
        title: "Paciente no encontrado",
        message:
          "El paciente no existe. Para continuar, primero debés crearlo desde el apartado Crear paciente.",
        type: "warning",
      });
      return;
    }

    mostrarDialogo({
      title: "Error al buscar paciente",
      message: msg || "Error al buscar paciente.",
      type: "error",
    });
  };

  const puedeAdmitir = useMemo(() => {
    return Boolean(pacienteActivo?.id && usuario?.id);
  }, [pacienteActivo, usuario]);

  const resetTodo = () => {
    setForm(initialForm);
    setPacienteOriginal(null);
    setPacienteActualizado(null);
    setEpisodioCreado(null);
    setConfirmOpen(false);
    setDniValidadoParaAdmitir("");
    setDialog(initialDialog);
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setPacienteOriginal(null);
      setPacienteActualizado(null);
      setEpisodioCreado(null);
      setConfirmOpen(false);
      setDniValidadoParaAdmitir("");
      cerrarDialogo();
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

  const handleDniChange = (value) => {
    setForm((prev) => ({ ...prev, dni: value }));
    setPacienteOriginal(null);
    setPacienteActualizado(null);
    setEpisodioCreado(null);
    setConfirmOpen(false);
    setDniValidadoParaAdmitir("");
    cerrarDialogo();
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

  const validarFormularioAntesDeConfirmar = () => {
    cerrarDialogo();
    setEpisodioCreado(null);

    if (!usuario?.id) {
      mostrarDialogo({
        title: "Error",
        message: "No se pudo obtener el usuario logueado.",
        type: "error",
      });
      return null;
    }

    if (!pacienteOriginal?.id) {
      mostrarDialogo({
        title: "Atención",
        message: "Primero buscá un paciente existente.",
        type: "warning",
      });
      return null;
    }

    const dniLimpio = limpiarDni(form.dni || pacienteOriginal.dni);
    if (!dniLimpio) {
      mostrarDialogo({
        title: "Error",
        message: "DNI inválido.",
        type: "error",
      });
      return null;
    }

    if (!form.nombre.trim() || !form.apellido.trim()) {
      mostrarDialogo({
        title: "Campos obligatorios",
        message: "Nombre y apellido son obligatorios.",
        type: "warning",
      });
      return null;
    }

    const edadNumero = form.edad === "" ? null : Number(form.edad);
    if (form.edad !== "" && Number.isNaN(edadNumero)) {
      mostrarDialogo({
        title: "Error de validación",
        message: "La edad debe ser numérica.",
        type: "error",
      });
      return null;
    }

    return dniLimpio;
  };

  const solicitarConfirmacionGuardarYAdmitir = (e) => {
    e.preventDefault();

    const dniLimpio = validarFormularioAntesDeConfirmar();
    if (!dniLimpio) return;

    setDniValidadoParaAdmitir(dniLimpio);
    setConfirmOpen(true);
  };

  const cerrarConfirmDialog = () => {
    if (loadingGuardarYAdmitir) return;
    setConfirmOpen(false);
  };

  const confirmarGuardarYAdmitir = async () => {
    const dniLimpio =
      dniValidadoParaAdmitir || validarFormularioAntesDeConfirmar();

    if (!dniLimpio) {
      setConfirmOpen(false);
      return;
    }

    setLoadingGuardarYAdmitir(true);

    try {
      const payloadPaciente = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento || null,
        edad: form.edad === "" ? null : Number(form.edad),
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

      setConfirmOpen(false);
      setDniValidadoParaAdmitir("");

      mostrarDialogo({
        title: "Admisión generada",
        message: "Paciente actualizado y admisión de guardia generada correctamente.",
        type: "success",
      });
    } catch (err) {
      setConfirmOpen(false);
      mostrarDialogo({
        title: "Error al admitir paciente",
        message:
          parseBackendMessage(err) ||
          "Error al actualizar y admitir al paciente.",
        type: "error",
      });
    } finally {
      setLoadingGuardarYAdmitir(false);
    }
  };

  return (
    <>
      <div className="sis-detail-layout">
        <section className="sis-card sis-section-card">
          <div className="sis-section-header">
            <div>
              <h3 className="sis-section-title">Buscar paciente para admisión</h3>
            </div>
          </div>

          <div className="sis-card-body">
            <BuscadorPacienteUniversal
              dniValue={form.dni}
              onDniChange={handleDniChange}
              onPacienteEncontrado={cargarPacienteEncontrado}
              onPacienteNoEncontradoDni={manejarPacienteNoEncontrado}
              onReset={resetTodo}
              disabled={disabledGeneral}
            />
          </div>
        </section>

        <section className="sis-card sis-section-card">
          <div className="sis-section-header">
            <div>
              <h3 className="sis-section-title">Datos del paciente</h3>
            </div>
          </div>

          <div className="sis-card-body">
            <form onSubmit={solicitarConfirmacionGuardarYAdmitir}>
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
                    <span className="sis-detail-label">Fecha alta paciente</span>
                    <div className="sis-detail-value">{pacienteActivo.fechaAlta || "-"}</div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Última modificación</span>
                    <div className="sis-detail-value">
                      {pacienteActivo.fechaModificacion || "-"}
                    </div>
                  </div>
                </div>
              )}

              <div className="sis-page-actions" style={{ marginTop: "20px" }}>
                <button
                  type="submit"
                  className="sis-btn sis-btn-primary"
                  disabled={!pacienteOriginal || !puedeAdmitir || disabledGeneral}
                >
                  {loadingGuardarYAdmitir
                    ? "Guardando y admitiendo..."
                    : "Guardar cambios y admitir"}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar admisión"
        message="¿Estás seguro de que querés guardar los cambios del paciente y generar la admisión en guardia?"
        onConfirm={confirmarGuardarYAdmitir}
        onCancel={cerrarConfirmDialog}
        confirmText="Sí, guardar y admitir"
        cancelText="Cancelar"
        loading={loadingGuardarYAdmitir}
      />

      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        buttonText={dialog.buttonText}
        onClose={cerrarDialogo}
      />
    </>
  );
}