import { useState } from "react";
import { crearPaciente } from "../../api/pacientesApi";
import { useNavigate } from "react-router-dom";

const initialForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "", // YYYY-MM-DD
  sexo: "",            // opcional si tu DTO lo pide
  // agregá acá los campos que tu backend requiera
};

export default function AltaPaciente({ redirectOnSuccess }) {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [nroHistoriaClinica, setNroHistoriaClinica] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const resetForm = () => setForm(initialForm);

  const parseBackendError = (err) => {
    const status = err?.response?.status;

    // casos típicos: {message: "..."} o {error: "..."} o texto plano
    const data = err?.response?.data;
    const backendMsg =
      (typeof data === "string" && data) ||
      data?.message ||
      data?.error ||
      data?.mensaje ||
      null;

    // si Spring devuelve validaciones tipo {errors:[...]} o {fieldErrors:[...]}
    const fieldErrors = data?.errors || data?.fieldErrors || null;
    const fieldErrorText = Array.isArray(fieldErrors)
      ? fieldErrors
          .map((x) => x?.defaultMessage || x?.message || `${x?.field}: ${x?.msg}` || "")
          .filter(Boolean)
          .join(" | ")
      : null;

    return { status, message: backendMsg || fieldErrorText };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    resetAlerts();
    setNroHistoriaClinica(null);

    setLoading(true);
    try {
      const data = await crearPaciente(form);

      // Ajustá esta extracción a lo que devuelva tu backend:
      const nro = data?.nroHistoriaClinica ?? null;
      setNroHistoriaClinica(nro);
      setSuccessMsg("Paciente creado y admisionado correctamente.");
      resetForm(); // opcional (lo pediste como “opcional”)
    } catch (err) {
      const { status, message } = parseBackendError(err);

      if (status === 400) {
        setErrorMsg(message || "Datos inválidos. Revisá los campos.");
      } else if (status === 409) {
        setErrorMsg(message || "Conflicto: ya existe un paciente con ese DNI.");
      } else if (status === 401) {
        setErrorMsg("No autorizado. Iniciá sesión nuevamente.");
      } else {
        setErrorMsg(message || "Error inesperado al crear el paciente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 24 }}>
      <h2>Admisión - Alta de Paciente</h2>

      {errorMsg && (
        <div className="alert alert-danger mt-3" role="alert">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success mt-3" role="alert">
          <div>{successMsg}</div>

          {nroHistoriaClinica && (
            <div className="mt-2">
              <strong>N° Historia Clínica:</strong> {nroHistoriaClinica}
            </div>
          )}

          {redirectOnSuccess && (
            <button
              type="button"
              className="btn btn-success mt-3"
              onClick={() => navigate(redirectOnSuccess)}
            >
              Volver
            </button>
          )}
        </div>
      )}

      <form className="mt-3" onSubmit={onSubmit}>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">DNI</label>
            <input
              className="form-control"
              name="dni"
              value={form.dni}
              onChange={onChange}
              required
              disabled={loading}
              placeholder="35123456"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              name="nombre"
              value={form.nombre}
              onChange={onChange}
              required
              disabled={loading}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Apellido</label>
            <input
              className="form-control"
              name="apellido"
              value={form.apellido}
              onChange={onChange}
              required
              disabled={loading}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Fecha de nacimiento</label>
            <input
              type="date"
              className="form-control"
              name="fechaNacimiento"
              value={form.fechaNacimiento}
              onChange={onChange}
              disabled={loading}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Sexo</label>
            <select
              className="form-select"
              name="sexo"
              value={form.sexo}
              onChange={onChange}
              disabled={loading}
            >
              <option value="">Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="X">Otro</option>
            </select>
          </div>
        </div>

        <div className="d-flex gap-2 mt-4">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Crear paciente"}
          </button>

          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={loading}
            onClick={() => {
              resetAlerts();
              setNroHistoriaClinica(null);
              resetForm();
            }}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}