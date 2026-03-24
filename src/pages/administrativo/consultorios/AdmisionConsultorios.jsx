import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
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

  const handleAsignarTurno = async (e) => {
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

    try {
      setGuardando(true);
      await asignarPacienteATurno(form.turnoId, {
        pacienteId: paciente.id ?? paciente.pacienteId,
        usuarioId: usuario.id,
      });
      alert("El turno fue asignado correctamente.");
      navigate("/administrativo/consultorios");
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

  return (
    <>
      <Header />
      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Otorgar turno - Consultorios</h2>
            <p className="sis-page-subtitle">
              Seleccioná una agenda, elegí un bloque libre y asignalo a un paciente existente.
            </p>
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
                <div className="sis-form-field">
                  <label className="sis-label">DNI del paciente</label>
                  <input
                    className="sis-input"
                    type="text"
                    value={dniBusqueda}
                    onChange={(e) => setDniBusqueda(e.target.value)}
                    placeholder="Ingresá el DNI"
                  />
                </div>

                <div className="sis-form-field" style={{ justifyContent: "end", display: "flex", alignItems: "end" }}>
                  <button className="sis-btn sis-btn-primary" type="submit" disabled={buscandoPaciente}>
                    {buscandoPaciente ? "Buscando..." : "Buscar paciente"}
                  </button>
                </div>
              </div>
            </form>

            {errorPaciente && (
              <div className="sis-alert sis-alert-danger" role="alert" style={{ marginTop: 12 }}>
                {errorPaciente}
              </div>
            )}

            {paciente && (
              <div className="sis-alert sis-alert-info" role="alert" style={{ marginTop: 12 }}>
                Paciente encontrado: {paciente.apellido} {paciente.nombre} · DNI: {paciente.dni} · HC: {paciente.nroHistoriaClinica || "-"}
              </div>
            )}
          </div>
        </div>

        <div className="sis-card">
          <div className="sis-card-body">
            <form onSubmit={handleAsignarTurno}>
              <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <div className="sis-form-field">
                  <label className="sis-label">Agenda</label>
                    <select
                      className="sis-input"
                      value={form.agendaId}
                      onChange={(e) => setForm((prev) => ({ ...prev, agendaId: e.target.value, turnoId: "" }))}
                    >
                      <option value="">Seleccionar agenda</option>
                      {agendas.map((agenda) => (
                        <option key={agenda.id ?? agenda.agendaId} value={agenda.id ?? agenda.agendaId}>
                          {agenda.nombre} - {agenda.especialidad}
                        </option>
                      ))}
                    </select>
                </div>

                <div className="sis-form-field">
                  <label className="sis-label">Fecha</label>
                  <input
                    className="sis-input"
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm((prev) => ({ ...prev, fecha: e.target.value, turnoId: "" }))}
                  />
                </div>

                <div className="sis-form-field">
                  <label className="sis-label">Turno disponible</label>
                  <select
                    className="sis-input"
                    value={form.turnoId}
                    onChange={(e) => setForm((prev) => ({ ...prev, turnoId: e.target.value }))}
                    disabled={!form.agendaId || loadingTurnos}
                  >
                    <option value="">Seleccionar turno</option>
                    {turnosDisponibles.map((turno) => (
                      <option key={turno.turnoId} value={turno.turnoId}>
                        #{turno.turnoId} - {formatearHora(turno.horaDesde)} a {formatearHora(turno.horaHasta)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {agendaSeleccionada && (
                <div className="sis-alert sis-alert-info" role="alert" style={{ marginTop: 12 }}>
                  Agenda seleccionada: {agendaSeleccionada.nombre} · Especialidad: {agendaSeleccionada.especialidad}
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
    </>
  );
}