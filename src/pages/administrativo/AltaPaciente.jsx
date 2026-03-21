import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { crearPaciente, obtenerPacientePorDni } from "../../api/pacientesApi";

const initialForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  sexo: "",
};

function limpiarDni(value) {
  return (value || "").replaceAll(/[^0-9]/g, "");
}

export default function AltaPaciente({ redirectOnSuccess }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [modo, setModo] = useState("idle");
  // idle | encontrado | nuevo

  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);

  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [nroHistoriaClinica, setNroHistoriaClinica] = useState(null);

  const resetAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const resetTodo = () => {
    setForm(initialForm);
    setModo("idle");
    setPacienteEncontrado(null);
    setNroHistoriaClinica(null);
    resetAlerts();
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setForm((prev) => ({ ...prev, dni: value }));
      setModo("idle");
      setPacienteEncontrado(null);
      setNroHistoriaClinica(null);
      resetAlerts();
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parseBackendMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    return data?.message || data?.error || data?.mensaje || "";
  };

  const buscarPorDni = async () => {
    resetAlerts();
    setNroHistoriaClinica(null);
    setPacienteEncontrado(null);

    const dniLimpio = limpiarDni(form.dni);
    if (!dniLimpio) {
      setErrorMsg("DNI inválido.");
      return;
    }

    setLoadingBuscar(true);
    try {
      const p = await obtenerPacientePorDni(dniLimpio);

      setPacienteEncontrado(p);
      setModo("encontrado");
      setSuccessMsg("Paciente encontrado.");

      setForm((prev) => ({
        ...prev,
        dni: p.dni || dniLimpio,
        nombre: p.nombre || "",
        apellido: p.apellido || "",
      }));
      setNroHistoriaClinica(p.nroHistoriaClinica || null);
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      if (status === 400 && msg.includes("No existe paciente con DNI")) {
        setModo("nuevo");
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

    if (modo !== "nuevo") {
      setErrorMsg("Primero buscá por DNI. Si no existe, podrás crear el paciente.");
      return;
    }

    const dniLimpio = limpiarDni(form.dni);
    if (!dniLimpio) {
      setErrorMsg("DNI inválido.");
      return;
    }

    setLoadingCrear(true);
    try {
      const payload = {
        ...form,
        dni: dniLimpio,
      };

      const data = await crearPaciente(payload);

      setSuccessMsg("Paciente creado y admisionado correctamente.");
      setNroHistoriaClinica(data?.nroHistoriaClinica ?? null);
      setModo("encontrado");
      setPacienteEncontrado(data);
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      if (status === 400) {
        setErrorMsg(msg || "Datos inválidos.");
      } else if (status === 409) {
        setErrorMsg(msg || "Conflicto: ya existe paciente con ese DNI.");
      } else {
        setErrorMsg(msg || "Error inesperado al crear el paciente.");
      }
    } finally {
      setLoadingCrear(false);
    }
  };

  const disabledGeneral = loadingBuscar || loadingCrear;

  return (
    <>
      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Admisión / alta de paciente</h2>
            <p className="sis-page-subtitle">
              Buscá un paciente por DNI y, si no existe, registralo en el sistema.
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

        {errorMsg && (
          <div className="sis-alert sis-alert-danger" role="alert">
            {errorMsg}
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

            {redirectOnSuccess && modo === "encontrado" && (
              <div className="mt-3">
                <button
                  type="button"
                  className="sis-btn sis-btn-success"
                  onClick={() => navigate(redirectOnSuccess)}
                >
                  Volver
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
                    placeholder="35123456"
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
                  Limpiar
                </button>
              </div>

              {modo === "encontrado" && pacienteEncontrado && (
                <div className="sis-detail-grid" style={{ marginTop: "18px" }}>
                  <div className="sis-detail-item sis-detail-item--highlight">
                    <span className="sis-detail-label">Paciente</span>
                    <div className="sis-detail-value">
                      {pacienteEncontrado.apellido || "-"}, {pacienteEncontrado.nombre || "-"}
                    </div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">DNI</span>
                    <div className="sis-detail-value">{pacienteEncontrado.dni || "-"}</div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Historia clínica</span>
                    <div className="sis-detail-value">
                      {pacienteEncontrado.nroHistoriaClinica || "-"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <form onSubmit={crearNuevoPaciente}>
            <section className="sis-card sis-section-card">
              <div className="sis-section-header">
                <h3 className="sis-section-title">Crear paciente</h3>
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
                      disabled={disabledGeneral || modo !== "nuevo"}
                    />
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
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                      <option value="X">Otro</option>
                    </select>
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
                      Primero buscá por DNI. Si no existe, se habilita el alta.
                    </span>
                  )}
                </div>

                
              </div>
            </section>
          </form>
        </div>
      </div>
    </>
  );
}