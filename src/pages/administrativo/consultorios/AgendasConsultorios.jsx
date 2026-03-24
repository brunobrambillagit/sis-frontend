import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { crearAgenda, generarTurnosAgenda, obtenerAgendas } from "../../../api/consultoriosApi";

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
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);

  const [formAgenda, setFormAgenda] = useState({
    nombre: "",
    especialidad: "",
    diasAtencion: [
      {
        diaSemana: "MONDAY",
        horaInicio: "08:00",
        horaFin: "12:00",
        duracionTurnoMinutos: 60,
      },
    ],
  });

  const [formGeneracion, setFormGeneracion] = useState({
    agendaId: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const cargarAgendas = async () => {
    try {
      setLoading(true);
      const data = await obtenerAgendas();
      setAgendas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAgendas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAgendas();
  }, []);

  const handleDiaChange = (index, field, value) => {
    setFormAgenda((prev) => {
      const copia = [...prev.diasAtencion];
      copia[index] = {
        ...copia[index],
        [field]: field === "duracionTurnoMinutos" ? Number(value) : value,
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
          duracionTurnoMinutos: 60,
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

  const handleCrearAgenda = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);
      await crearAgenda(formAgenda);
      alert("La agenda se creó correctamente.");
      setFormAgenda({
        nombre: "",
        especialidad: "",
        diasAtencion: [
          {
            diaSemana: "MONDAY",
            horaInicio: "08:00",
            horaFin: "12:00",
            duracionTurnoMinutos: 60,
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

    if (!formGeneracion.agendaId) {
      alert("Seleccioná una agenda.");
      return;
    }

    try {
      setGenerando(true);
      await generarTurnosAgenda(formGeneracion.agendaId, {
        fechaDesde: formGeneracion.fechaDesde,
        fechaHasta: formGeneracion.fechaHasta,
      });
      alert("Los turnos se generaron correctamente para el rango indicado.");
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
            <p className="sis-page-subtitle">
              Creá agendas y luego generá turnos por rango de fechas.
            </p>
          </div>

          <div className="sis-page-actions">
            <button className="sis-btn sis-btn-outline" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button className="sis-btn sis-btn-outline" onClick={cargarAgendas}>
              Actualizar
            </button>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <h3 className="sis-section-title">Crear agenda</h3>
            <form onSubmit={handleCrearAgenda}>
              <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div className="sis-form-field">
                  <label className="sis-label">Nombre</label>
                  <input
                    className="sis-input"
                    value={formAgenda.nombre}
                    onChange={(e) => setFormAgenda((prev) => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Consultorio Dr. Pérez mañana"
                  />
                </div>

                <div className="sis-form-field">
                  <label className="sis-label">Especialidad</label>
                  <input
                    className="sis-input"
                    value={formAgenda.especialidad}
                    onChange={(e) => setFormAgenda((prev) => ({ ...prev, especialidad: e.target.value }))}
                    placeholder="Ej: Clínica médica"
                  />
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <h4 className="sis-section-subtitle">Días y horarios de atención</h4>
                {formAgenda.diasAtencion.map((dia, index) => (
                  <div
                    key={index}
                    className="sis-form-grid"
                    style={{
                      gridTemplateColumns: "1.3fr 1fr 1fr 1fr auto",
                      marginBottom: 12,
                      alignItems: "end",
                    }}
                  >
                    <div className="sis-form-field">
                      <label className="sis-label">Día</label>
                      <select
                        className="sis-input"
                        value={dia.diaSemana}
                        onChange={(e) => handleDiaChange(index, "diaSemana", e.target.value)}
                      >
                        {DIAS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sis-form-field">
                      <label className="sis-label">Hora inicio</label>
                      <input
                        className="sis-input"
                        type="time"
                        value={dia.horaInicio}
                        onChange={(e) => handleDiaChange(index, "horaInicio", e.target.value)}
                      />
                    </div>

                    <div className="sis-form-field">
                      <label className="sis-label">Hora fin</label>
                      <input
                        className="sis-input"
                        type="time"
                        value={dia.horaFin}
                        onChange={(e) => handleDiaChange(index, "horaFin", e.target.value)}
                      />
                    </div>

                    <div className="sis-form-field">
                      <label className="sis-label">Duración turno (min)</label>
                      <input
                        className="sis-input"
                        type="number"
                        min="5"
                        step="5"
                        value={dia.duracionTurnoMinutos}
                        onChange={(e) => handleDiaChange(index, "duracionTurnoMinutos", e.target.value)}
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
                  <button type="button" className="sis-btn sis-btn-outline" onClick={agregarDia}>
                    Agregar día
                  </button>
                  <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                    {guardando ? "Guardando..." : "Crear agenda"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <h3 className="sis-section-title">Generar turnos por rango</h3>
            <form onSubmit={handleGenerarTurnos}>
              <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <div className="sis-form-field">
                  <label className="sis-label">Agenda</label>
                  <select
                    className="sis-input"
                    value={formGeneracion.agendaId}
                    onChange={(e) => setFormGeneracion((prev) => ({ ...prev, agendaId: e.target.value }))}
                  >
                    <option value="">Seleccionar agenda</option>
                    {agendas.map((agenda) => (
                      <option key={agenda.agendaId} value={agenda.agendaId}>
                        {agenda.nombre} - {agenda.especialidad}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sis-form-field">
                  <label className="sis-label">Fecha desde</label>
                  <input
                    className="sis-input"
                    type="date"
                    value={formGeneracion.fechaDesde}
                    onChange={(e) => setFormGeneracion((prev) => ({ ...prev, fechaDesde: e.target.value }))}
                  />
                </div>

                <div className="sis-form-field">
                  <label className="sis-label">Fecha hasta</label>
                  <input
                    className="sis-input"
                    type="date"
                    value={formGeneracion.fechaHasta}
                    onChange={(e) => setFormGeneracion((prev) => ({ ...prev, fechaHasta: e.target.value }))}
                  />
                </div>
              </div>

              <div className="sis-page-actions" style={{ marginTop: 16 }}>
                <button type="submit" className="sis-btn sis-btn-primary" disabled={generando}>
                  {generando ? "Generando..." : "Generar turnos"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card">
          <div className="sis-card-body">
            <h3 className="sis-section-title">Agendas creadas</h3>

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
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agendas.map((agenda) => (
                      <tr key={agenda.agendaId}>
                        <td className="sis-cell-strong">{agenda.agendaId}</td>
                        <td>{agenda.nombre}</td>
                        <td>{agenda.especialidad}</td>
                        <td>{agenda.activa ? "Activa" : "Inactiva"}</td>
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