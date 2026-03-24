import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  agregarEvolucionEpisodio,
  agregarObservacionEpisodio,
  obtenerDetalleEpisodio,
} from "../../api/episodiosDetalleApi";

function formatearFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-AR") : "-";
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case "EN_ESPERA":
      return "sis-status sis-status-espera";
    case "EN_ATENCION":
      return "sis-status sis-status-atencion";
    case "FINALIZADO":
      return "sis-status sis-status-finalizado";
    case "ALTA":
      return "sis-status sis-status-alta";
    default:
      return "sis-status sis-status-default";
  }
}

function formatearEstado(estado) {
  switch (estado) {
    case "EN_ESPERA":
      return "En espera";
    case "EN_ATENCION":
      return "En atención";
    case "FINALIZADO":
      return "Finalizado";
    case "ALTA":
      return "Alta";
    default:
      return estado || "-";
  }
}

export default function EpisodioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [observacion, setObservacion] = useState("");
  const [guardandoObservacion, setGuardandoObservacion] = useState(false);

  const [formEvolucion, setFormEvolucion] = useState({
    diagnosticos: "",
    evolucion: "",
    medicacionIndicaciones: "",
    estudiosSolicitados: "",
  });
  const [guardandoEvolucion, setGuardandoEvolucion] = useState(false);

  const [evolucionesAbiertas, setEvolucionesAbiertas] = useState({});
  const [modalConfirmacionEvolucion, setModalConfirmacionEvolucion] = useState({
    abierto: false,
  });

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerDetalleEpisodio(id);
      setDetalle(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el detalle del episodio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const handleGuardarObservacion = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (!observacion.trim()) {
      alert("Ingresá una observación.");
      return;
    }

    try {
      setGuardandoObservacion(true);

      await agregarObservacionEpisodio(id, {
        usuarioId: usuario.id,
        observacion: observacion.trim(),
      });

      setObservacion("");
      await cargarDetalle();
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la observación.";
      alert(mensaje);
    } finally {
      setGuardandoObservacion(false);
    }
  };

  const handleChangeEvolucion = (e) => {
    const { name, value } = e.target;
    setFormEvolucion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const abrirConfirmacionGuardarEvolucion = (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (
      !formEvolucion.diagnosticos.trim() &&
      !formEvolucion.evolucion.trim() &&
      !formEvolucion.medicacionIndicaciones.trim() &&
      !formEvolucion.estudiosSolicitados.trim()
    ) {
      alert("Completá al menos un campo de la evolución.");
      return;
    }

    setModalConfirmacionEvolucion({ abierto: true });
  };

  const cerrarConfirmacionGuardarEvolucion = () => {
    if (guardandoEvolucion) return;
    setModalConfirmacionEvolucion({ abierto: false });
  };

  const confirmarGuardarEvolucion = async () => {
    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    try {
      setGuardandoEvolucion(true);

      await agregarEvolucionEpisodio(id, {
        usuarioId: usuario.id,
        diagnosticos: formEvolucion.diagnosticos.trim(),
        evolucion: formEvolucion.evolucion.trim(),
        medicacionIndicaciones: formEvolucion.medicacionIndicaciones.trim(),
        estudiosSolicitados: formEvolucion.estudiosSolicitados.trim(),
      });

      setFormEvolucion({
        diagnosticos: "",
        evolucion: "",
        medicacionIndicaciones: "",
        estudiosSolicitados: "",
      });

      cerrarConfirmacionGuardarEvolucion();
      await cargarDetalle();
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la evolución.";
      alert(mensaje);
    } finally {
      setGuardandoEvolucion(false);
    }
  };

  const toggleEvolucion = (evolucionId) => {
    setEvolucionesAbiertas((prev) => ({
      ...prev,
      [evolucionId]: !prev[evolucionId],
    }));
  };

  return (
    <>
      <Header titulo="Detalle del episodio" />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Detalle del episodio</h2>
            <p className="sis-page-subtitle">
              Consulta clínica, observaciones y evolución médica del paciente.
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

        {loading && <div className="sis-loading-state">Cargando detalle...</div>}

        {!loading && error && (
          <div className="sis-alert sis-alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && detalle && (
          <div className="sis-detail-layout">
            <section className="sis-card sis-section-card">
              <div className="sis-section-header">
                <h3 className="sis-section-title">Datos del paciente y episodio</h3>
              </div>

              <div className="sis-card-body">
                <div className="sis-detail-grid">
                  <div className="sis-detail-item sis-detail-item--highlight">
                    <span className="sis-detail-label">Paciente</span>
                    <div className="sis-detail-value">
                      {detalle.apellido || "-"}, {detalle.nombre || "-"}
                    </div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">DNI</span>
                    <div className="sis-detail-value">{detalle.dni || "-"}</div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Nro. historia clínica</span>
                    <div className="sis-detail-value">
                      {detalle.nroHistoriaClinica || "-"}
                    </div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Episodio</span>
                    <div className="sis-detail-value">{detalle.episodioId || "-"}</div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Servicio</span>
                    <div className="sis-detail-value">{detalle.tipoServicio || "-"}</div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Estado</span>
                    <div className="sis-detail-value">
                      <span className={obtenerClaseEstado(detalle.estadoAtencion)}>
                        {formatearEstado(detalle.estadoAtencion)}
                      </span>
                    </div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Fecha y hora de ingreso</span>
                    <div className="sis-detail-value">
                      {formatearFecha(detalle.fechaIngreso)}
                    </div>
                  </div>

                  <div className="sis-detail-item">
                    <span className="sis-detail-label">Fecha y hora de egreso</span>
                    <div className="sis-detail-value">
                      {formatearFecha(detalle.fechaEgreso)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="sis-card sis-section-card">
              <div className="sis-section-header">
                <h3 className="sis-section-title">
                  Observaciones de la historia clínica
                </h3>
              </div>

              <div className="sis-card-body">
                {detalle.observacionesHistoriaClinica ? (
                  <p className="sis-rich-text mb-0">
                    {detalle.observacionesHistoriaClinica}
                  </p>
                ) : (
                  <p className="sis-text-muted mb-0">
                    No hay observaciones en la historia clínica.
                  </p>
                )}
              </div>
            </section>

            <div className="sis-detail-columns">
              <section className="sis-card sis-section-card">
                <div className="sis-section-header">
                  <h3 className="sis-section-title">Nueva observación del episodio</h3>
                </div>

                <div className="sis-card-body">
                  <form onSubmit={handleGuardarObservacion} className="sis-form">
                    <div className="sis-form-group">
                      <label className="sis-form-label">Observación</label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="4"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        placeholder="Ingresá una observación clínica o administrativa relevante..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="sis-btn sis-btn-primary"
                      disabled={guardandoObservacion}
                    >
                      {guardandoObservacion ? "Guardando..." : "Guardar observación"}
                    </button>
                  </form>
                </div>
              </section>

              <section className="sis-card sis-section-card">
                <div className="sis-section-header">
                  <h3 className="sis-section-title">
                    Historial de observaciones del episodio
                  </h3>
                </div>

                <div className="sis-card-body">
                  {!detalle.observaciones || detalle.observaciones.length === 0 ? (
                    <p className="sis-text-muted mb-0">
                      No hay observaciones registradas.
                    </p>
                  ) : (
                    <div className="sis-timeline">
                      {detalle.observaciones.map((obs) => (
                        <article key={obs.id} className="sis-timeline-item">
                          <div className="sis-timeline-head">
                            <strong className="sis-timeline-user">
                              {obs.nombreUsuario || "Usuario"}
                            </strong>
                            <span className="sis-timeline-date">
                              {formatearFecha(obs.fechaRegistro)}
                            </span>
                          </div>
                          <div className="sis-timeline-body">
                            {obs.observacion || "-"}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="sis-card sis-section-card">
              <div className="sis-section-header">
                <h3 className="sis-section-title">Nueva evolución médica</h3>
              </div>

              <div className="sis-card-body">
                <form onSubmit={abrirConfirmacionGuardarEvolucion} className="sis-form">
                  <div className="sis-form-grid">
                    <div className="sis-form-group">
                      <label className="sis-form-label">Diagnóstico/s</label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="3"
                        name="diagnosticos"
                        value={formEvolucion.diagnosticos}
                        onChange={handleChangeEvolucion}
                        placeholder="Diagnóstico principal y diagnósticos asociados..."
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Evolución</label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="5"
                        name="evolucion"
                        value={formEvolucion.evolucion}
                        onChange={handleChangeEvolucion}
                        placeholder="Describí la evolución clínica del paciente..."
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Medicación / indicaciones</label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="4"
                        name="medicacionIndicaciones"
                        value={formEvolucion.medicacionIndicaciones}
                        onChange={handleChangeEvolucion}
                        placeholder="Indicaciones, tratamiento y medicación..."
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">
                        Estudios / solicitud de estudios
                      </label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="4"
                        name="estudiosSolicitados"
                        value={formEvolucion.estudiosSolicitados}
                        onChange={handleChangeEvolucion}
                        placeholder="Estudios solicitados o a evaluar..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="sis-btn sis-btn-success"
                    disabled={guardandoEvolucion}
                  >
                    {guardandoEvolucion ? "Guardando..." : "Firmar evolucion"}
                  </button>
                </form>
              </div>
            </section>

            <section className="sis-card sis-section-card">
              <div className="sis-section-header">
                <h3 className="sis-section-title">Historial de evoluciones</h3>
              </div>

              <div className="sis-card-body">
                {!detalle.evoluciones || detalle.evoluciones.length === 0 ? (
                  <p className="sis-text-muted mb-0">No hay evoluciones registradas.</p>
                ) : (
                  <div className="sis-timeline">
                    {detalle.evoluciones.map((ev) => {
                      const abierta = !!evolucionesAbiertas[ev.id];

                      return (
                        <article key={ev.id} className="sis-timeline-item">
                          <button
                            type="button"
                            className="sis-btn sis-btn-outline"
                            onClick={() => toggleEvolucion(ev.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              textAlign: "left",
                              marginBottom: abierta ? "1rem" : 0,
                            }}
                          >
                            <span>
                              {formatearFecha(ev.fechaRegistro)} - {ev.nombreUsuario || "Usuario"}
                            </span>
                            <span>{abierta ? "Ocultar" : "Ver detalle"}</span>
                          </button>

                          {abierta && (
                            <div className="sis-evolution-grid">
                              <div className="sis-evolution-block">
                                <span className="sis-detail-label">Diagnóstico/s</span>
                                <div className="sis-detail-value">
                                  {ev.diagnosticos || "-"}
                                </div>
                              </div>

                              <div className="sis-evolution-block">
                                <span className="sis-detail-label">Evolución</span>
                                <div className="sis-detail-value">
                                  {ev.evolucion || "-"}
                                </div>
                              </div>

                              <div className="sis-evolution-block">
                                <span className="sis-detail-label">
                                  Medicación / indicaciones
                                </span>
                                <div className="sis-detail-value">
                                  {ev.medicacionIndicaciones || "-"}
                                </div>
                              </div>

                              <div className="sis-evolution-block">
                                <span className="sis-detail-label">
                                  Estudios / solicitud de estudios
                                </span>
                                <div className="sis-detail-value">
                                  {ev.estudiosSolicitados || "-"}
                                </div>
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={modalConfirmacionEvolucion.abierto}
        title="Confirmar guardado de evolución"
        message="¿Realmente querés firmar y guardar esta evolucion?"
        onConfirm={confirmarGuardarEvolucion}
        onCancel={cerrarConfirmacionGuardarEvolucion}
        confirmText="Sí, guardar"
        cancelText="No"
        loading={guardandoEvolucion}
      />
    </>
  );
}