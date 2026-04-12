import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertDialog from "../../components/AlertDialog";
import {
  actualizarObservacionesHistoriaClinica,
  agregarEvolucionEpisodio,
  agregarObservacionEpisodio,
  agregarObservacionHistoriaClinica,
  obtenerDetalleEpisodio,
} from "../../api/episodiosDetalleApi";

const ITEMS_POR_PAGINA = 2;

function formatearFecha(fecha) {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
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

function obtenerTotalPaginas(items = [], itemsPorPagina = ITEMS_POR_PAGINA) {
  return Math.max(1, Math.ceil((items?.length || 0) / itemsPorPagina));
}

function obtenerItemsPaginados(paginaActual, items = [], itemsPorPagina = ITEMS_POR_PAGINA) {
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  return items.slice(inicio, fin);
}

function PaginacionHistorial({
  paginaActual,
  totalItems,
  itemsPorPagina = ITEMS_POR_PAGINA,
  onCambiarPagina,
}) {
  const totalPaginas = obtenerTotalPaginas(
    Array.from({ length: totalItems }),
    itemsPorPagina
  );

  if (totalItems <= itemsPorPagina) {
    return null;
  }

  const paginaInicial = Math.max(1, paginaActual - 2);
  const paginaFinal = Math.min(totalPaginas, paginaInicial + 4);

  const paginas = [];
  for (let pagina = paginaInicial; pagina <= paginaFinal; pagina += 1) {
    paginas.push(pagina);
  }

  return (
    <div
      className="sis-pagination"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "1rem",
      }}
    >
      <div className="sis-text-muted" style={{ fontSize: "0.95rem" }}>
        Página {paginaActual} de {totalPaginas} · {totalItems} registro{totalItems === 1 ? "" : "s"}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="sis-btn sis-btn-outline"
          onClick={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>

        {paginas.map((pagina) => (
          <button
            key={pagina}
            type="button"
            className={`sis-btn ${
              pagina === paginaActual ? "sis-btn-primary" : "sis-btn-outline"
            }`}
            onClick={() => onCambiarPagina(pagina)}
          >
            {pagina}
          </button>
        ))}

        <button
          type="button"
          className="sis-btn sis-btn-outline"
          onClick={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

const initialAlertDialog = {
  open: false,
  title: "Aviso",
  message: "",
  type: "info",
  buttonText: "Aceptar",
};

export default function EpisodioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const location = useLocation();

  const soloLectura = location.state?.soloLectura === true;
  const volverAListaPaciente = location.state?.volverAListaPaciente === true;
  const pacienteBuscado = location.state?.pacienteBuscado || null;
  const episodiosPaciente = location.state?.episodiosPaciente || [];

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [observacion, setObservacion] = useState("");
  const [guardandoObservacion, setGuardandoObservacion] = useState(false);

  const [observacionesHistoriaClinica, setObservacionesHistoriaClinica] =
    useState("");
  const [guardandoObservacionesHC, setGuardandoObservacionesHC] =
    useState(false);

  const [observacionHistoriaClinica, setObservacionHistoriaClinica] =
    useState("");
  const [
    guardandoObservacionHistoriaClinica,
    setGuardandoObservacionHistoriaClinica,
  ] = useState(false);

  const [formEvolucion, setFormEvolucion] = useState({
    diagnosticos: "",
    evolucion: "",
    medicacionIndicaciones: "",
    estudiosSolicitados: "",
  });
  const [guardandoEvolucion, setGuardandoEvolucion] = useState(false);

  const [evolucionesAbiertas, setEvolucionesAbiertas] = useState({});
  const [paginaObservacionesHC, setPaginaObservacionesHC] = useState(1);
  const [paginaObservacionesEpisodio, setPaginaObservacionesEpisodio] = useState(1);
  const [paginaEvoluciones, setPaginaEvoluciones] = useState(1);

  const [modalConfirmacionObservacion, setModalConfirmacionObservacion] =
    useState({
      abierto: false,
    });
  const [modalConfirmacionObservacionesHC, setModalConfirmacionObservacionesHC] =
    useState({
      abierto: false,
    });
  const [
    modalConfirmacionObservacionHistoriaClinica,
    setModalConfirmacionObservacionHistoriaClinica,
  ] = useState({
    abierto: false,
  });
  const [modalConfirmacionEvolucion, setModalConfirmacionEvolucion] = useState({
    abierto: false,
  });
  const [dialog, setDialog] = useState(initialAlertDialog);

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
    setDialog(initialAlertDialog);
  };

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerDetalleEpisodio(id);
      setDetalle(data);
      setObservacionesHistoriaClinica(data?.observacionesHistoriaClinica || "");
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

  useEffect(() => {
    const totalPaginasHC = obtenerTotalPaginas(
      detalle?.historialObservacionesHistoriaClinica || []
    );
    if (paginaObservacionesHC > totalPaginasHC) {
      setPaginaObservacionesHC(totalPaginasHC);
    }

    const totalPaginasObsEpisodio = obtenerTotalPaginas(detalle?.observaciones || []);
    if (paginaObservacionesEpisodio > totalPaginasObsEpisodio) {
      setPaginaObservacionesEpisodio(totalPaginasObsEpisodio);
    }

    const totalPaginasEvol = obtenerTotalPaginas(detalle?.evoluciones || []);
    if (paginaEvoluciones > totalPaginasEvol) {
      setPaginaEvoluciones(totalPaginasEvol);
    }
  }, [detalle, paginaObservacionesHC, paginaObservacionesEpisodio, paginaEvoluciones]);

  const observacionesHistoriaClinicaPaginadas = useMemo(
    () =>
      obtenerItemsPaginados(
        paginaObservacionesHC,
        detalle?.historialObservacionesHistoriaClinica || []
      ),
    [paginaObservacionesHC, detalle?.historialObservacionesHistoriaClinica]
  );

  const observacionesEpisodioPaginadas = useMemo(
    () => obtenerItemsPaginados(paginaObservacionesEpisodio, detalle?.observaciones || []),
    [paginaObservacionesEpisodio, detalle?.observaciones]
  );

  const evolucionesPaginadas = useMemo(
    () => obtenerItemsPaginados(paginaEvoluciones, detalle?.evoluciones || []),
    [paginaEvoluciones, detalle?.evoluciones]
  );

  const abrirConfirmacionGuardarObservacionesHC = (e) => {
    e.preventDefault();

    if (soloLectura) return;

    const valorActual = detalle?.observacionesHistoriaClinica || "";
    const valorNuevo = observacionesHistoriaClinica || "";

    if (valorActual.trim() === valorNuevo.trim()) {
      mostrarDialogo({
        title: "Atención",
        message:
          "No hay cambios para guardar en las observaciones de la historia clínica.",
        type: "warning",
      });
      return;
    }

    setModalConfirmacionObservacionesHC({ abierto: true });
  };

  const cerrarConfirmacionGuardarObservacionesHC = () => {
    if (guardandoObservacionesHC) return;
    setModalConfirmacionObservacionesHC({ abierto: false });
  };

  const confirmarGuardarObservacionesHC = async () => {
    try {
      setGuardandoObservacionesHC(true);

      await actualizarObservacionesHistoriaClinica(id, {
        observaciones: observacionesHistoriaClinica,
      });

      cerrarConfirmacionGuardarObservacionesHC();
      await cargarDetalle();

      mostrarDialogo({
        title: "Observaciones actualizadas",
        message:
          "Las observaciones de la historia clínica se guardaron correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudieron guardar las observaciones de la historia clínica.";

      mostrarDialogo({
        title: "Error al guardar observaciones",
        message: mensaje,
        type: "error",
      });
    } finally {
      setGuardandoObservacionesHC(false);
    }
  };

  const abrirConfirmacionGuardarObservacionHistoriaClinica = (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      mostrarDialogo({
        title: "Error",
        message: "No se encontró el usuario logueado.",
        type: "error",
      });
      return;
    }

    if (!observacionHistoriaClinica.trim()) {
      mostrarDialogo({
        title: "Atención",
        message:
          "Ingresá una observación para el historial de la historia clínica.",
        type: "warning",
      });
      return;
    }

    setModalConfirmacionObservacionHistoriaClinica({ abierto: true });
  };

  const cerrarConfirmacionGuardarObservacionHistoriaClinica = () => {
    if (guardandoObservacionHistoriaClinica) return;
    setModalConfirmacionObservacionHistoriaClinica({ abierto: false });
  };

  const confirmarGuardarObservacionHistoriaClinica = async () => {
    if (!usuario?.id) {
      mostrarDialogo({
        title: "Error",
        message: "No se encontró el usuario logueado.",
        type: "error",
      });
      return;
    }

    try {
      setGuardandoObservacionHistoriaClinica(true);

      await agregarObservacionHistoriaClinica(id, {
        usuarioId: usuario.id,
        observacion: observacionHistoriaClinica.trim(),
      });

      setObservacionHistoriaClinica("");
      cerrarConfirmacionGuardarObservacionHistoriaClinica();
      await cargarDetalle();
      setPaginaObservacionesHC(1);

      mostrarDialogo({
        title: "Observación guardada",
        message:
          "La observación del historial de historia clínica se guardó correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la observación de historia clínica.";

      mostrarDialogo({
        title: "Error al guardar observación",
        message: mensaje,
        type: "error",
      });
    } finally {
      setGuardandoObservacionHistoriaClinica(false);
    }
  };

  const abrirConfirmacionGuardarObservacion = (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      mostrarDialogo({
        title: "Error",
        message: "No se encontró el usuario logueado.",
        type: "error",
      });
      return;
    }

    if (!observacion.trim()) {
      mostrarDialogo({
        title: "Atención",
        message: "Ingresá una observación.",
        type: "warning",
      });
      return;
    }

    setModalConfirmacionObservacion({ abierto: true });
  };

  const cerrarConfirmacionGuardarObservacion = () => {
    if (guardandoObservacion) return;
    setModalConfirmacionObservacion({ abierto: false });
  };

  const confirmarGuardarObservacion = async () => {
    if (!usuario?.id) {
      mostrarDialogo({
        title: "Error",
        message: "No se encontró el usuario logueado.",
        type: "error",
      });
      return;
    }

    try {
      setGuardandoObservacion(true);

      await agregarObservacionEpisodio(id, {
        usuarioId: usuario.id,
        observacion: observacion.trim(),
      });

      setObservacion("");
      cerrarConfirmacionGuardarObservacion();
      await cargarDetalle();
      setPaginaObservacionesEpisodio(1);

      mostrarDialogo({
        title: "Observación guardada",
        message: "La observación se guardó correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la observación.";

      mostrarDialogo({
        title: "Error al guardar observación",
        message: mensaje,
        type: "error",
      });
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
      mostrarDialogo({
        title: "Error",
        message: "No se encontró el usuario logueado.",
        type: "error",
      });
      return;
    }

    if (
      !formEvolucion.diagnosticos.trim() &&
      !formEvolucion.evolucion.trim() &&
      !formEvolucion.medicacionIndicaciones.trim() &&
      !formEvolucion.estudiosSolicitados.trim()
    ) {
      mostrarDialogo({
        title: "Atención",
        message: "Completá al menos un campo de la evolución.",
        type: "warning",
      });
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
      mostrarDialogo({
        title: "Error",
        message: "No se encontró el usuario logueado.",
        type: "error",
      });
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
      setPaginaEvoluciones(1);

      mostrarDialogo({
        title: "Evolución guardada",
        message: "La evolución se guardó correctamente.",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la evolución.";

      mostrarDialogo({
        title: "Error al guardar evolución",
        message: mensaje,
        type: "error",
      });
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

          <button
            className="sis-btn sis-btn-outline"
            onClick={() => {
              if (volverAListaPaciente) {
                navigate("/medico/pacientes", {
                  state: {
                    restaurarBusqueda: true,
                    pacienteBuscado,
                    episodiosPaciente,
                  },
                });
                return;
              }

              navigate(-1);
            }}
          >
            Volver
          </button>
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

            {/* <section className="sis-card sis-section-card">
              <div className="sis-section-header">
                <h3 className="sis-section-title">
                  Observaciones de la historia clínica
                </h3>
              </div>

              <div className="sis-card-body">
                <form
                  onSubmit={abrirConfirmacionGuardarObservacionesHC}
                  className="sis-form"
                >
                  <div className="sis-form-group">
                    <label className="sis-form-label">
                      Observaciones generales de la historia clínica
                    </label>
                    <textarea
                      className="sis-form-control sis-textarea"
                      rows="5"
                      value={observacionesHistoriaClinica}
                      onChange={(e) =>
                        setObservacionesHistoriaClinica(e.target.value)
                      }
                      placeholder="Ingresá observaciones generales relevantes para la historia clínica..."
                      disabled={soloLectura}
                    />
                  </div>

                  <button
                    type="submit"
                    className="sis-btn sis-btn-primary"
                    disabled={guardandoObservacionesHC || soloLectura}
                  >
                    {guardandoObservacionesHC
                      ? "Guardando..."
                      : "Guardar observaciones HC"}
                  </button>
                </form>
              </div>
            </section> */}

            <div className="sis-detail-columns">
              <section className="sis-card sis-section-card">
                <div className="sis-section-header">
                  <h3 className="sis-section-title">
                    Nueva observación de la Historia Clinica
                  </h3>
                </div>

                <div className="sis-card-body">
                  <form
                    onSubmit={abrirConfirmacionGuardarObservacionHistoriaClinica}
                    className="sis-form"
                  >
                    <div className="sis-form-group">
                      <label className="sis-form-label">Observación</label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="4"
                        value={observacionHistoriaClinica}
                        onChange={(e) =>
                          setObservacionHistoriaClinica(e.target.value)
                        }
                        placeholder="Ingresá una observación para el historial clínico..."
                        disabled={soloLectura}
                      />
                    </div>

                    <button
                      type="submit"
                      className="sis-btn sis-btn-primary"
                      disabled={
                        guardandoObservacionHistoriaClinica || soloLectura
                      }
                    >
                      {guardandoObservacionHistoriaClinica
                        ? "Guardando..."
                        : "Guardar observación HC"}
                    </button>
                  </form>
                </div>
              </section>

              <section className="sis-card sis-section-card">
                <div className="sis-section-header">
                  <h3 className="sis-section-title">
                    Historial de observaciones de la Historia Clínica
                  </h3>
                </div>

                <div className="sis-card-body">
                  {!detalle.historialObservacionesHistoriaClinica ||
                  detalle.historialObservacionesHistoriaClinica.length === 0 ? (
                    <p className="sis-text-muted mb-0">
                      No hay observaciones históricas registradas en la historia clínica.
                    </p>
                  ) : (
                    <>
                      <div className="sis-timeline">
                        {observacionesHistoriaClinicaPaginadas.map((obs) => (
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

                      <PaginacionHistorial
                        paginaActual={paginaObservacionesHC}
                        totalItems={
                          detalle.historialObservacionesHistoriaClinica.length
                        }
                        onCambiarPagina={setPaginaObservacionesHC}
                      />
                    </>
                  )}
                </div>
              </section>
            </div>

            <div className="sis-detail-columns">
              <section className="sis-card sis-section-card">
                <div className="sis-section-header">
                  <h3 className="sis-section-title">Nueva observación del episodio</h3>
                </div>

                <div className="sis-card-body">
                  <form
                    onSubmit={abrirConfirmacionGuardarObservacion}
                    className="sis-form"
                  >
                    <div className="sis-form-group">
                      <label className="sis-form-label">Observación</label>
                      <textarea
                        className="sis-form-control sis-textarea"
                        rows="4"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        placeholder="Ingresá una observación clínica o administrativa relevante..."
                        disabled={soloLectura}
                      />
                    </div>

                    <button
                      type="submit"
                      className="sis-btn sis-btn-primary"
                      disabled={guardandoObservacion || soloLectura}
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
                    <>
                      <div className="sis-timeline">
                        {observacionesEpisodioPaginadas.map((obs) => (
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

                      <PaginacionHistorial
                        paginaActual={paginaObservacionesEpisodio}
                        totalItems={detalle.observaciones.length}
                        onCambiarPagina={setPaginaObservacionesEpisodio}
                      />
                    </>
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
                        disabled={soloLectura}
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
                        disabled={soloLectura}
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
                        disabled={soloLectura}
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
                        disabled={soloLectura}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="sis-btn sis-btn-success"
                    disabled={guardandoEvolucion || soloLectura}
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
                  <>
                    <div className="sis-timeline">
                      {evolucionesPaginadas.map((ev) => {
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

                    <PaginacionHistorial
                      paginaActual={paginaEvoluciones}
                      totalItems={detalle.evoluciones.length}
                      onCambiarPagina={setPaginaEvoluciones}
                    />
                  </>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={modalConfirmacionObservacionesHC.abierto}
        title="Confirmar guardado de observaciones HC"
        message="¿Estás seguro de querer guardar las observaciones en la historia clínica?"
        onConfirm={confirmarGuardarObservacionesHC}
        onCancel={cerrarConfirmacionGuardarObservacionesHC}
        confirmText="Sí, guardar"
        cancelText="No"
        loading={guardandoObservacionesHC}
      />

      <ConfirmDialog
        open={modalConfirmacionObservacionHistoriaClinica.abierto}
        title="Confirmar guardado de observación de historia clínica"
        message="¿Estás seguro de querer guardar esta observación en el historial de la historia clínica?"
        onConfirm={confirmarGuardarObservacionHistoriaClinica}
        onCancel={cerrarConfirmacionGuardarObservacionHistoriaClinica}
        confirmText="Sí, guardar"
        cancelText="No"
        loading={guardandoObservacionHistoriaClinica}
      />

      <ConfirmDialog
        open={modalConfirmacionObservacion.abierto}
        title="Confirmar guardado de observación"
        message="¿Estas seguro de querer guardar esta observación?"
        onConfirm={confirmarGuardarObservacion}
        onCancel={cerrarConfirmacionGuardarObservacion}
        confirmText="Sí, guardar"
        cancelText="No"
        loading={guardandoObservacion}
      />

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
