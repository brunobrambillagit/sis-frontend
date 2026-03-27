import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import ConfirmDialog from "../../../components/ConfirmDialog";
import AlertDialog from "../../../components/AlertDialog";
import {
  asignarPacienteATurno,
  buscarPacientePorDni,
  obtenerAgendas,
  obtenerTurnosAdministrativo,
} from "../../../api/consultoriosApi";
import { useAuth } from "../../../context/AuthContext";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatearHora(valor) {
  if (!valor) return "-";
  return String(valor).slice(0, 5);
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return "-";
  const [anio, mes, dia] = fechaIso.split("-");
  return `${dia}/${mes}/${anio}`;
}

export default function AdmisionConsultorios() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [dniBusqueda, setDniBusqueda] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);
  const [errorPaciente, setErrorPaciente] = useState("");

  const [agendas, setAgendas] = useState([]);
  const [turnosDisponibles, setTurnosDisponibles] = useState([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const [form, setForm] = useState({
    agendaId: "",
    fecha: hoyISO(),
    turnoId: "",
  });

  useEffect(() => {
    const cargarAgendas = async () => {
      try {
        const data = await obtenerAgendas();
        setAgendas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };

    cargarAgendas();
  }, []);

  useEffect(() => {
    const cargarTurnos = async () => {
      if (!form.agendaId || !form.fecha) {
        setTurnosDisponibles([]);
        return;
      }

      try {
        setLoadingTurnos(true);
        const data = await obtenerTurnosAdministrativo({
          agendaId: form.agendaId,
          fecha: form.fecha,
          estado: "DISPONIBLE",
        });
        setTurnosDisponibles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setTurnosDisponibles([]);
      } finally {
        setLoadingTurnos(false);
      }
    };

    cargarTurnos();
  }, [form.agendaId, form.fecha]);

  const agendaSeleccionada = useMemo(
    () => agendas.find((a) => String(a.id ?? a.agendaId) === String(form.agendaId)),
    [agendas, form.agendaId]
  );

  const turnoSeleccionado = useMemo(
    () => turnosDisponibles.find((t) => String(t.turnoId) === String(form.turnoId)),
    [turnosDisponibles, form.turnoId]
  );

  const handleBuscarPaciente = async (e) => {
    e.preventDefault();

    if (!dniBusqueda.trim()) {
      setErrorPaciente("Ingresá un DNI para buscar el paciente.");
      setPaciente(null);
      return;
    }

    try {
      setBuscandoPaciente(true);
      setErrorPaciente("");
      const data = await buscarPacientePorDni(dniBusqueda.trim());
      setPaciente(data);
    } catch (err) {
      console.error(err);
      setPaciente(null);
      setErrorPaciente(
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se encontró un paciente con ese DNI."
      );
    } finally {
      setBuscandoPaciente(false);
    }
  };

  const handleAbrirConfirmacion = (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (!paciente?.id && !paciente?.pacienteId) {
      alert("Buscá y seleccioná un paciente válido antes de otorgar el turno.");
      return;
    }

    if (!form.turnoId) {
      alert("Seleccioná un turno disponible.");
      return;
    }

    setOpenConfirm(true);
  };

  const handleConfirmarAsignacion = async () => {
    try {
      setGuardando(true);

      await asignarPacienteATurno(form.turnoId, {
        pacienteId: paciente.id ?? paciente.pacienteId,
        usuarioId: usuario.id,
      });

      setOpenConfirm(false);
      setOpenAlert(true);
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo otorgar el turno."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarAlert = () => {
    setOpenAlert(false);
    navigate("/administrativo/consultorios");
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Agendar un turno</h2>
          </div>

          <div className="sis-page-actions">
            <button className="sis-btn sis-btn-outline" onClick={() => navigate(-1)}>
              Volver
            </button>

            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate("/administrativo/guardia/crear-paciente")}
            >
              Crear paciente
            </button>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <form onSubmit={handleBuscarPaciente}>
              <div className="sis-form-grid" style={{ gridTemplateColumns: "2fr 1fr" }}>
                <div className="sis-form-group">
                  <label className="sis-form-label">DNI del paciente</label>
                  <input
                    className="sis-form-control"
                    type="text"
                    value={dniBusqueda}
                    onChange={(e) => setDniBusqueda(e.target.value)}
                    placeholder="Ingresá el DNI"
                  />
                </div>

                <div
                  className="sis-form-field"
                  style={{ justifyContent: "end", display: "flex", alignItems: "end" }}
                >
                  <button
                    className="sis-btn sis-btn-primary"
                    type="submit"
                    disabled={buscandoPaciente}
                  >
                    {buscandoPaciente ? "Buscando..." : "Buscar paciente"}
                  </button>
                </div>
              </div>
            </form>

            {errorPaciente && (
              <div
                className="sis-alert sis-alert-danger"
                role="alert"
                style={{ marginTop: 12 }}
              >
                {errorPaciente}
              </div>
            )}

            {paciente && (
              <div
                className="sis-alert sis-alert-info"
                role="alert"
                style={{ marginTop: 12 }}
              >
                Paciente encontrado: {paciente.apellido} {paciente.nombre} · DNI:{" "}
                {paciente.dni} · HC: {paciente.nroHistoriaClinica || "-"}
              </div>
            )}
          </div>
        </div>

        <div className="sis-card">
          <div className="sis-card-body">
            <form onSubmit={handleAbrirConfirmacion}>
              <div
                className="sis-form-grid"
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
              >
                <div className="sis-form-group">
                  <label className="sis-form-label">Agenda</label>
                  <select
                    className="sis-form-control"
                    value={form.agendaId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        agendaId: e.target.value,
                        turnoId: "",
                      }))
                    }
                  >
                    <option value="">Seleccionar agenda</option>
                    {agendas.map((agenda) => (
                      <option
                        key={agenda.id ?? agenda.agendaId}
                        value={agenda.id ?? agenda.agendaId}
                      >
                        {agenda.nombre} - {agenda.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Fecha</label>
                  <input
                    className="sis-form-control"
                    type="date"
                    value={form.fecha}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        fecha: e.target.value,
                        turnoId: "",
                      }))
                    }
                  />
                </div>
              </div>

              {agendaSeleccionada && (
                <div
                  className="sis-alert sis-alert-info"
                  role="alert"
                  style={{ marginTop: 12 }}
                >
                  Agenda seleccionada: {agendaSeleccionada.nombre} · Especialidad:{" "}
                  {agendaSeleccionada.especialidad}
                </div>
              )}

              <div style={{ marginTop: 18 }}>
                <label className="sis-form-label" style={{ marginBottom: 10, display: "block" }}>
                  Turnos disponibles
                </label>

                {!form.agendaId ? (
                  <div className="sis-empty-state">
                    Seleccioná una agenda para ver los turnos disponibles.
                  </div>
                ) : loadingTurnos ? (
                  <div className="sis-loading-state">Cargando turnos disponibles...</div>
                ) : turnosDisponibles.length === 0 ? (
                  <div className="sis-empty-state">
                    No hay turnos disponibles para la fecha seleccionada.
                  </div>
                ) : (
                  <div className="sis-turnos-grid">
                    {turnosDisponibles.map((turno) => {
                      const seleccionado = String(form.turnoId) === String(turno.turnoId);

                      return (
                        <button
                          key={turno.turnoId}
                          type="button"
                          className={`sis-turno-card ${seleccionado ? "sis-turno-card-selected" : ""}`}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              turnoId: String(turno.turnoId),
                            }))
                          }
                        >
                          <span className="sis-turno-card-hour">
                            {formatearHora(turno.horaDesde)}
                          </span>
                          <span className="sis-turno-card-range">
                            {formatearHora(turno.horaDesde)} a {formatearHora(turno.horaHasta)}
                          </span>
                          <span className="sis-turno-card-id">Turno #{turno.turnoId}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {turnoSeleccionado && (
                <div
                  className="sis-alert sis-alert-info"
                  role="alert"
                  style={{ marginTop: 16 }}
                >
                  Turno seleccionado: {formatearFecha(form.fecha)} ·{" "}
                  {formatearHora(turnoSeleccionado.horaDesde)} a{" "}
                  {formatearHora(turnoSeleccionado.horaHasta)}
                </div>
              )}

              <div className="sis-page-actions" style={{ marginTop: 16 }}>
                <button
                  className="sis-btn sis-btn-primary"
                  type="submit"
                  disabled={guardando || !paciente || !form.turnoId}
                >
                  {guardando ? "Guardando..." : "Confirmar turno"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={openConfirm}
        title="Confirmar otorgamiento del turno"
        message={
          turnoSeleccionado
            ? `¿Está seguro de otorgar el turno para el día ${formatearFecha(
                form.fecha
              )} de ${formatearHora(turnoSeleccionado.horaDesde)} a ${formatearHora(
                turnoSeleccionado.horaHasta
              )}?`
            : "¿Está seguro de otorgar el turno seleccionado?"
        }
        onConfirm={handleConfirmarAsignacion}
        onCancel={() => !guardando && setOpenConfirm(false)}
        confirmText="Sí, otorgar turno"
        cancelText="Cancelar"
        loading={guardando}
      />

      <AlertDialog
        open={openAlert}
        title="Turno asignado"
        message={
          turnoSeleccionado
            ? `El turno fue asignado correctamente para el día ${formatearFecha(
                form.fecha
              )} de ${formatearHora(turnoSeleccionado.horaDesde)} a ${formatearHora(
                turnoSeleccionado.horaHasta
              )}.`
            : "El turno fue asignado correctamente."
        }
        onClose={handleCerrarAlert}
        buttonText="Aceptar"
        type="success"
      />
    </>
  );
}
