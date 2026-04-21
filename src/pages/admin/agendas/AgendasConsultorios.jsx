import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AlertDialog from "../../../components/AlertDialog";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {
  crearAgenda,
  generarTurnosAgenda,
  obtenerAgendas,
  obtenerMedicos,
} from "../../../api/consultoriosApi";

const DIAS = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

const EMPTY_AGENDA_FORM = {
  nombre: "",
  especialidad: "",
  duracionTurnoMinutos: 60,
  medicoIdsConPermiso: [],
  diasAtencion: [
    {
      diaSemana: "MONDAY",
      horaInicio: "08:00",
      horaFin: "12:00",
    },
  ],
};

const EMPTY_GENERACION_FORM = {
  agendaId: "",
  fechaDesde: "",
  fechaHasta: "",
};

const EMPTY_DIALOG = {
  open: false,
  title: "",
  message: "",
  type: "info",
};

const EMPTY_CONFIRM = {
  open: false,
  title: "",
  message: "",
  action: null,
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const formGridTwoStyle = {
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
};

const medicosGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 12,
};

const userResumeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 18,
};

const dayCardStyle = {
  border: "1px solid var(--sis-border)",
  borderRadius: 16,
  background: "#fbfdff",
  padding: 16,
  marginBottom: 12,
};

function StatCard({ titulo, valor, descripcion }) {
  return (
    <div className="sis-detail-item sis-detail-item--highlight">
      <span className="sis-detail-label">{titulo}</span>
      <div className="sis-detail-value" style={{ fontSize: "1.25rem" }}>
        {valor}
      </div>
      <div className="sis-text-muted" style={{ fontSize: "0.9rem", marginTop: 6 }}>
        {descripcion}
      </div>
    </div>
  );
}

function DataResumeItem({ label, value }) {
  return (
    <div className="sis-detail-item">
      <span className="sis-detail-label">{label}</span>
      <div className="sis-detail-value">{value || "-"}</div>
    </div>
  );
}

function getDiaLabel(value) {
  return DIAS.find((d) => d.value === value)?.label || value;
}

export default function AgendasConsultorios() {
  const navigate = useNavigate();

  const [agendas, setAgendas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);

  const [formAgenda, setFormAgenda] = useState(EMPTY_AGENDA_FORM);
  const [formGeneracion, setFormGeneracion] = useState(EMPTY_GENERACION_FORM);

  const [dialog, setDialog] = useState(EMPTY_DIALOG);
  const [confirmDialog, setConfirmDialog] = useState(EMPTY_CONFIRM);

  useEffect(() => {
    cargarAgendas();
    cargarMedicos();
  }, []);

  const showDialog = (title, message, type = "info") => {
    setDialog({
      open: true,
      title,
      message,
      type,
    });
  };

  const cerrarDialogo = () => {
    setDialog(EMPTY_DIALOG);
  };

  const abrirConfirmacion = (title, message, action) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action,
    });
  };

  const cerrarConfirmacion = () => {
    if (guardando || generando) return;
    setConfirmDialog(EMPTY_CONFIRM);
  };

  const cargarAgendas = async () => {
    try {
      setLoading(true);
      const data = await obtenerAgendas();
      setAgendas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAgendas([]);
      showDialog("Error", "No se pudieron cargar las agendas.", "error");
    } finally {
      setLoading(false);
    }
  };

  const cargarMedicos = async () => {
    try {
      setLoadingMedicos(true);
      const data = await obtenerMedicos();
      setMedicos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMedicos([]);
      showDialog("Error", "No se pudieron cargar los médicos.", "error");
    } finally {
      setLoadingMedicos(false);
    }
  };

  const totalAgendas = agendas.length;
  const totalMedicos = medicos.length;
  const totalDiasConfigurados = formAgenda.diasAtencion.length;

  const agendaSeleccionada = useMemo(() => {
    return agendas.find(
      (agenda) => String(agenda.id ?? agenda.agendaId) === String(formGeneracion.agendaId)
    );
  }, [agendas, formGeneracion.agendaId]);

  const medicosSeleccionados = useMemo(() => {
    return medicos.filter((m) => formAgenda.medicoIdsConPermiso.includes(m.id));
  }, [medicos, formAgenda.medicoIdsConPermiso]);

  const handleDiaChange = (index, field, value) => {
    setFormAgenda((prev) => {
      const copia = [...prev.diasAtencion];
      copia[index] = {
        ...copia[index],
        [field]: value,
      };
      return { ...prev, diasAtencion: copia };
    });
  };

  const agregarDia = () => {
    setFormAgenda((prev) => ({
      ...prev,
      diasAtencion: [
        ...prev.diasAtencion,
        {
          diaSemana: "MONDAY",
          horaInicio: "08:00",
          horaFin: "12:00",
        },
      ],
    }));
  };

  const eliminarDia = (index) => {
    setFormAgenda((prev) => ({
      ...prev,
      diasAtencion: prev.diasAtencion.filter((_, i) => i !== index),
    }));
  };

  const toggleMedico = (medicoId) => {
    setFormAgenda((prev) => {
      const yaExiste = prev.medicoIdsConPermiso.includes(medicoId);

      return {
        ...prev,
        medicoIdsConPermiso: yaExiste
          ? prev.medicoIdsConPermiso.filter((id) => id !== medicoId)
          : [...prev.medicoIdsConPermiso, medicoId],
      };
    });
  };

  const ejecutarCrearAgenda = async () => {
    const payload = {
      nombre: formAgenda.nombre,
      especialidad: formAgenda.especialidad,
      duracionTurnoMinutos: Number(formAgenda.duracionTurnoMinutos),
      medicoIdsConPermiso: formAgenda.medicoIdsConPermiso,
      diasAtencion: formAgenda.diasAtencion,
    };

    try {
      setGuardando(true);
      await crearAgenda(payload);
      setFormAgenda(EMPTY_AGENDA_FORM);
      await cargarAgendas();
      cerrarConfirmacion();
      window.scrollTo({ top: 0, behavior: "smooth" });
      showDialog("Agenda creada", "La agenda se creó correctamente.", "success");
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo crear la agenda.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarGenerarTurnos = async () => {
    try {
      setGenerando(true);
      await generarTurnosAgenda(formGeneracion.agendaId, {
        fechaDesde: formGeneracion.fechaDesde,
        fechaHasta: formGeneracion.fechaHasta,
      });
      cerrarConfirmacion();
      showDialog("Turnos generados", "Los turnos se generaron correctamente.", "success");
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudieron generar los turnos.",
        "error"
      );
    } finally {
      setGenerando(false);
    }
  };

  const confirmarAccion = async () => {
    switch (confirmDialog.action) {
      case "crearAgenda":
        await ejecutarCrearAgenda();
        break;
      case "generarTurnos":
        await ejecutarGenerarTurnos();
        break;
      default:
        cerrarConfirmacion();
        break;
    }
  };

  const handleCrearAgenda = async (e) => {
    e.preventDefault();

    if (formAgenda.medicoIdsConPermiso.length === 0) {
      showDialog(
        "Faltan datos",
        "Debés seleccionar al menos un médico con permiso.",
        "warning"
      );
      return;
    }

    abrirConfirmacion(
      "Confirmar creación",
      "¿Seguro que querés crear esta agenda?",
      "crearAgenda"
    );
  };

  const handleGenerarTurnos = async (e) => {
    e.preventDefault();

    if (
      !formGeneracion.agendaId ||
      !formGeneracion.fechaDesde ||
      !formGeneracion.fechaHasta
    ) {
      showDialog(
        "Faltan datos",
        "Debés completar agenda, fecha desde y fecha hasta.",
        "warning"
      );
      return;
    }

    abrirConfirmacion(
      "Confirmar generación",
      "¿Seguro que querés generar los turnos para el rango seleccionado?",
      "generarTurnos"
    );
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Administración de agendas</h2>
            <p className="sis-page-subtitle">
              Creá agendas, asigná médicos, definí días de atención y generá turnos por rango.
            </p>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Volver
            </button>
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => {
                cargarAgendas();
                cargarMedicos();
              }}
              disabled={loading || loadingMedicos}
              type="button"
            >
              {loading || loadingMedicos ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <div style={statsGridStyle}>
          <StatCard
            titulo="Agendas"
            valor={totalAgendas}
            descripcion="Agendas registradas en consultorios"
          />
          <StatCard
            titulo="Médicos"
            valor={totalMedicos}
            descripcion="Profesionales disponibles para asignar"
          />
        </div>

        <div className="sis-card" style={{ marginBottom: 24 }}>
          <div className="sis-card-body">
            <div className="sis-page-title-wrap" style={{ marginBottom: 18 }}>
              <h3 className="sis-page-title2">Crear agenda</h3>
              <p className="sis-page-subtitle">
                Definí los datos principales, asigná médicos y configurá los horarios de atención.
              </p>
            </div>

            <form onSubmit={handleCrearAgenda} className="sis-form">
              <div className="sis-form-grid" style={formGridTwoStyle}>
                <div className="sis-form-group">
                  <label className="sis-form-label">Nombre</label>
                  <input
                    className="sis-form-control"
                    value={formAgenda.nombre}
                    onChange={(e) =>
                      setFormAgenda((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    placeholder="Ej: Consultorio Dr. Pérez mañana"
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Especialidad</label>
                  <input
                    className="sis-form-control"
                    value={formAgenda.especialidad}
                    onChange={(e) =>
                      setFormAgenda((prev) => ({
                        ...prev,
                        especialidad: e.target.value,
                      }))
                    }
                    placeholder="Ej: Clínica médica"
                    required
                  />
                </div>
              </div>

              <div className="sis-form-grid" style={{ gridTemplateColumns: "minmax(220px, 280px)", marginTop: 4 }}>
                <div className="sis-form-group">
                  <label className="sis-form-label">Duración del turno (minutos)</label>
                  <input
                    className="sis-form-control"
                    type="number"
                    min="5"
                    step="5"
                    value={formAgenda.duracionTurnoMinutos}
                    onChange={(e) =>
                      setFormAgenda((prev) => ({
                        ...prev,
                        duracionTurnoMinutos: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="sis-card" style={{ marginTop: 18 }}>
                <div className="sis-card-body">
                  <div className="sis-page-title-wrap" style={{ marginBottom: 16 }}>
                    <h4 className="sis-page-title2">Médicos con permiso</h4>
                    <p className="sis-page-subtitle">
                      Seleccioná los médicos que podrán trabajar con esta agenda.
                    </p>
                  </div>

                  {loadingMedicos && (
                    <div className="sis-loading-state">Cargando médicos...</div>
                  )}

                  {!loadingMedicos && medicos.length === 0 && (
                    <div className="sis-alert sis-alert-info" role="alert">
                      No hay médicos disponibles para asignar.
                    </div>
                  )}

                  {!loadingMedicos && medicos.length > 0 && (
                    <>
                      <div style={medicosGridStyle}>
                        {medicos.map((medico) => {
                          const checked = formAgenda.medicoIdsConPermiso.includes(medico.id);

                          return (
                            <label
                              key={medico.id}
                              className="sis-card"
                              style={{
                                padding: 14,
                                cursor: "pointer",
                                border: checked ? "2px solid var(--sis-primary)" : "1px solid var(--sis-border)",
                                background: checked
                                  ? "linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%)"
                                  : "#ffffff",
                                boxShadow: checked ? "0 0 0 3px rgba(37, 99, 235, 0.10)" : undefined,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleMedico(medico.id)}
                                  style={{ marginTop: 4 }}
                                />
                                <div>
                                  <div className="sis-cell-strong">
                                    {medico.nombreCompleto || `Médico #${medico.id}`}
                                  </div>
                                  <div className="sis-text-muted">{medico.email || "Sin email"}</div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div style={{ marginTop: 16 }}>
                        <div className="sis-detail-item">
                          <span className="sis-detail-label">Seleccionados</span>
                          <div className="sis-detail-value">
                            {medicosSeleccionados.length}
                          </div>
                          <div className="sis-text-muted" style={{ marginTop: 6 }}>
                            {medicosSeleccionados.length > 0
                              ? medicosSeleccionados
                                  .map((m) => m.nombreCompleto || `Médico #${m.id}`)
                                  .join(" · ")
                              : "Todavía no seleccionaste médicos para esta agenda."}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="sis-card" style={{ marginTop: 18 }}>
                <div className="sis-card-body">
                  <div className="sis-page-header" style={{ marginBottom: 16 }}>
                    <div className="sis-page-title-wrap">
                      <h4 className="sis-page-title2">Días y horarios de atención</h4>
                      <p className="sis-page-subtitle">
                        Configurá uno o más bloques semanales para esta agenda.
                      </p>
                    </div>

                    <div className="sis-page-actions">
                      <button
                        type="button"
                        className="sis-btn sis-btn-outline"
                        onClick={agregarDia}
                      >
                        Agregar día
                      </button>
                    </div>
                  </div>

                  {formAgenda.diasAtencion.map((dia, index) => (
                    <div key={index} style={dayCardStyle}>
                      <div className="sis-page-header" style={{ marginBottom: 12 }}>
                        <div className="sis-page-title-wrap">
                          <h5 className="sis-page-title2" style={{ fontSize: "1.1rem" }}>
                            Bloque #{index + 1}
                          </h5>
                          <p className="sis-page-subtitle">
                            {getDiaLabel(dia.diaSemana)} · {dia.horaInicio} a {dia.horaFin}
                          </p>
                        </div>

                        <button
                          type="button"
                          className="sis-btn sis-btn-outline sis-btn-sm"
                          onClick={() => eliminarDia(index)}
                          disabled={formAgenda.diasAtencion.length === 1}
                        >
                          Quitar
                        </button>
                      </div>

                      <div
                        className="sis-form-grid"
                        style={{
                          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        }}
                      >
                        <div className="sis-form-group">
                          <label className="sis-form-label">Día</label>
                          <select
                            className="sis-form-control"
                            value={dia.diaSemana}
                            onChange={(e) =>
                              handleDiaChange(index, "diaSemana", e.target.value)
                            }
                          >
                            {DIAS.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sis-form-group">
                          <label className="sis-form-label">Hora inicio</label>
                          <input
                            className="sis-form-control"
                            type="time"
                            value={dia.horaInicio}
                            onChange={(e) =>
                              handleDiaChange(index, "horaInicio", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="sis-form-group">
                          <label className="sis-form-label">Hora fin</label>
                          <input
                            className="sis-form-control"
                            type="time"
                            value={dia.horaFin}
                            onChange={(e) =>
                              handleDiaChange(index, "horaFin", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="sis-page-actions" style={{ marginTop: 16 }}>
                    <button
                      type="submit"
                      className="sis-btn sis-btn-primary"
                      disabled={guardando}
                    >
                      {guardando ? "Guardando..." : "Crear agenda"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 24 }}>
          <div className="sis-card-body">
            <div className="sis-page-title-wrap" style={{ marginBottom: 18 }}>
              <h3 className="sis-page-title2">Generar turnos por rango</h3>
              <p className="sis-page-subtitle">
                Elegí una agenda y definí el período en el que querés crear turnos disponibles.
              </p>
            </div>

            {agendaSeleccionada && (
              <div style={userResumeGridStyle}>
                <DataResumeItem label="Agenda" value={agendaSeleccionada.nombre} />
                <DataResumeItem label="Especialidad" value={agendaSeleccionada.especialidad} />
                <DataResumeItem
                  label="Duración"
                  value={`${agendaSeleccionada.duracionTurnoMinutos} minutos`}
                />
              </div>
            )}

            <form onSubmit={handleGenerarTurnos} className="sis-form">
              <div
                className="sis-form-grid"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
              >
                <div className="sis-form-group">
                  <label className="sis-form-label">Agenda</label>
                  <select
                    className="sis-form-control"
                    value={formGeneracion.agendaId}
                    onChange={(e) =>
                      setFormGeneracion((prev) => ({
                        ...prev,
                        agendaId: e.target.value,
                      }))
                    }
                    required
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
                  <label className="sis-form-label">Fecha desde</label>
                  <input
                    className="sis-form-control"
                    type="date"
                    value={formGeneracion.fechaDesde}
                    onChange={(e) =>
                      setFormGeneracion((prev) => ({
                        ...prev,
                        fechaDesde: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Fecha hasta</label>
                  <input
                    className="sis-form-control"
                    type="date"
                    value={formGeneracion.fechaHasta}
                    onChange={(e) =>
                      setFormGeneracion((prev) => ({
                        ...prev,
                        fechaHasta: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="sis-page-actions" style={{ marginTop: 16 }}>
                <button
                  type="submit"
                  className="sis-btn sis-btn-primary"
                  disabled={generando}
                >
                  {generando ? "Generando..." : "Generar turnos"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card">
          <div className="sis-card-body">
            <div className="sis-page-title-wrap" style={{ marginBottom: 18 }}>
              <h3 className="sis-page-title2">Agendas creadas</h3>
              <p className="sis-page-subtitle">
                Resumen de las agendas actualmente disponibles en consultorios.
              </p>
            </div>

            {loading && <div className="sis-loading-state">Cargando agendas...</div>}

            {!loading && agendas.length === 0 && (
              <div className="sis-alert sis-alert-info" role="alert">
                Todavía no hay agendas creadas.
              </div>
            )}

            {!loading && agendas.length > 0 && (
              <div className="sis-table-wrapper">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Especialidad</th>
                      <th>Duración turnos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendas.map((agenda) => (
                      <tr key={agenda.id ?? agenda.agendaId}>
                        <td className="sis-cell-strong">
                          {agenda.id ?? agenda.agendaId}
                        </td>
                        <td>{agenda.nombre}</td>
                        <td>{agenda.especialidad}</td>
                        <td>{agenda.duracionTurnoMinutos} minutos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmarAccion}
        onCancel={cerrarConfirmacion}
        loading={guardando || generando}
      />

      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={cerrarDialogo}
      />
    </>
  );
}
