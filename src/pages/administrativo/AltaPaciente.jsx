// src/pages/administrativo/AltaPaciente.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // estados del flujo
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

    // si cambia DNI, volvemos a idle (porque cambió el paciente)
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
    setSuccessMsg("");
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

      // opcional: completar nombre/apellido en el form solo a modo visual
      setForm((prev) => ({
        ...prev,
        dni: p.dni,
        nombre: p.nombre || "",
        apellido: p.apellido || "",
      }));
      setNroHistoriaClinica(p.nroHistoriaClinica || null);
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      // tu backend usa 400 para "no existe"
      if (status === 400 && msg.includes("No existe paciente con DNI")) {
        setModo("nuevo");
        setSuccessMsg(`No existe el paciente. Completá los datos para crearlo.`);
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
    setSuccessMsg("");
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

      // después de crear, ya “existe”
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
    <div className="container" style={{ maxWidth: 900 }}>
      {/* Alertas */}
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

          {redirectOnSuccess && modo === "encontrado" && (
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

      {/* Buscador DNI */}
      <div className="card mt-3">
        <div className="card-body">
          <h5 className="card-title">Buscar paciente por DNI</h5>

          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">DNI</label>
              <input
                className="form-control"
                name="dni"
                value={form.dni}
                onChange={onChange}
                placeholder="35123456"
                disabled={disabledGeneral}
              />
            </div>

            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={buscarPorDni}
                disabled={disabledGeneral}
              >
                {loadingBuscar ? "Buscando..." : "Buscar"}
              </button>
            </div>

            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={resetTodo}
                disabled={disabledGeneral}
              >
                Limpiar
              </button>
            </div>
          </div>

          {/* Tarjeta paciente encontrado */}
          {modo === "encontrado" && pacienteEncontrado && (
            <div className="mt-3">
              <div className="border rounded p-3">
                <div><strong>Nombre:</strong> {pacienteEncontrado.nombre}</div>
                <div><strong>Apellido:</strong> {pacienteEncontrado.apellido}</div>
                <div><strong>DNI:</strong> {pacienteEncontrado.dni}</div>
                <div><strong>HC:</strong> {pacienteEncontrado.nroHistoriaClinica}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form de creación: solo si no existe */}
      <form className="mt-3" onSubmit={crearNuevoPaciente}>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Crear paciente (solo si no existe)</h5>

            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  required={modo === "nuevo"}
                  disabled={disabledGeneral || modo !== "nuevo"}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Apellido</label>
                <input
                  className="form-control"
                  name="apellido"
                  value={form.apellido}
                  onChange={onChange}
                  required={modo === "nuevo"}
                  disabled={disabledGeneral || modo !== "nuevo"}
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
                  disabled={disabledGeneral || modo !== "nuevo"}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Sexo</label>
                <select
                  className="form-select"
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

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-success"
                type="submit"
                disabled={disabledGeneral || modo !== "nuevo"}
              >
                {loadingCrear ? "Creando..." : "Crear paciente"}
              </button>

              {modo !== "nuevo" && (
                <div className="text-muted" style={{ alignSelf: "center" }}>
                  Primero buscá por DNI. Si no existe, se habilita el alta.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}