import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
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

export default function AgendasConsultorios() {
  const navigate = useNavigate();

  const [agendas, setAgendas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMedicos, setLoadingMedicos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);

  const [formAgenda, setFormAgenda] = useState({
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
  });

  const [formGeneracion, setFormGeneracion] = useState({
    agendaId: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    cargarAgendas();
    cargarMedicos();
  }, []);

  const cargarAgendas = async () => {
    try {
      setLoading(true);
      const data = await obtenerAgendas();
      setAgendas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAgendas([]);
      alert("No se pudieron cargar las agendas.");
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
      alert("No se pudieron cargar los médicos.");
    } finally {
      setLoadingMedicos(false);
    }
  };

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

  const handleCrearAgenda = async (e) => {
    e.preventDefault();

    if (formAgenda.medicoIdsConPermiso.length === 0) {
      alert("Debés seleccionar al menos un médico con permiso.");
      return;
    }

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
      alert("La agenda se creó correctamente.");

      setFormAgenda({
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
      });

      await cargarAgendas();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo crear la agenda."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleGenerarTurnos = async (e) => {
    e.preventDefault();

    if (
      !formGeneracion.agendaId ||
      !formGeneracion.fechaDesde ||
      !formGeneracion.fechaHasta
    ) {
      alert("Debés completar agenda, fecha desde y fecha hasta.");
      return;
    }

    try {
      setGenerando(true);
      await generarTurnosAgenda(formGeneracion.agendaId, {
        fechaDesde: formGeneracion.fechaDesde,
        fechaHasta: formGeneracion.fechaHasta,
      });
      alert("Los turnos se generaron correctamente.");
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudieron generar los turnos."
      );
    } finally {
      setGenerando(false);
    }
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Administración de agendas</h2>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate(-1)}
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
            >
              {loading || loadingMedicos ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <h3 className="sis-page-title">Crear agenda</h3>

            <form onSubmit={handleCrearAgenda}>
              <div
                className="sis-form-grid"
                style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
              >
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

              <div
                className="sis-form-grid"
                style={{
                  gridTemplateColumns: "minmax(220px, 280px)",
                  marginTop: 16,
                }}
              >
                <div className="sis-form-group">
                  <label className="sis-label">Duración turno (min)</label>
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

              <div style={{ marginTop: 16 }}>
                <h4 className="sis-page-title2">Médicos con permiso</h4>

                {loadingMedicos && (
                  <div className="sis-loading-state">Cargando médicos...</div>
                )}

                {!loadingMedicos && medicos.length === 0 && (
                  <div className="sis-alert sis-alert-info" role="alert">
                    No hay médicos disponibles para asignar.
                  </div>
                )}

                {!loadingMedicos && medicos.length > 0 && (
                  <div
                    className="sis-form-grid"
                    style={{
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    {medicos.map((medico) => {
                      const checked = formAgenda.medicoIdsConPermiso.includes(medico.id);

                      return (
                        <label
                          key={medico.id}
                          className="sis-card"
                          style={{
                            padding: 12,
                            cursor: "pointer",
                            border: checked ? "2px solid #2563eb" : undefined,
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
                              <div className="sis-muted-text">{medico.email}</div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16 }}>
                <h4 className="sis-page-title">Días y horarios de atención</h4>

                {formAgenda.diasAtencion.map((dia, index) => (
                  <div
                    key={index}
                    className="sis-form-grid"
                    style={{
                      gridTemplateColumns: "1.3fr 1fr 1fr auto",
                      marginBottom: 12,
                      alignItems: "end",
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

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline"
                      onClick={() => eliminarDia(index)}
                      disabled={formAgenda.diasAtencion.length === 1}
                    >
                      Quitar
                    </button>
                  </div>
                ))}

                <div className="sis-page-actions" style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={agregarDia}
                  >
                    Agregar día
                  </button>

                  <button
                    type="submit"
                    className="sis-btn sis-btn-primary"
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Crear agenda"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <h3 className="sis-page-title">Generar turnos por rango</h3>

            <form onSubmit={handleGenerarTurnos}>
              <div
                className="sis-form-grid"
                style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
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
            <h3 className="sis-page-title">Agendas creadas</h3>

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
    </>
  );
}