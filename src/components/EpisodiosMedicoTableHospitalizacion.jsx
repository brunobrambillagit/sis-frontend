import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarEstadoEpisodio, obtenerEpisodiosActivos } from "../api/episodiosApi";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

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

export default function EpisodiosMedicoTableHospitalizacion({
  servicio = "HOSPITALIZACION",
  titulo = "Listado de pacientes en Hospitalizacion",
}) {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [episodios, setEpisodios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    episodioId: null,
    nombrePaciente: "",
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerEpisodiosActivos(servicio);
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de pacientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [servicio]);

  const handleCambioEstado = async (episodioId, nuevoEstado) => {
    try {
      if (!usuario?.id) {
        alert("No se encontró el id del usuario logueado. Cerrá sesión e iniciá nuevamente.");
        return;
      }

      setProcesandoId(episodioId);
      await cambiarEstadoEpisodio(episodioId, nuevoEstado, usuario.id);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo cambiar el estado.";
      alert(mensaje);
    } finally {
      setProcesandoId(null);
    }
  };

  const abrirConfirmacionFinalizar = (ep) => {
    setModalConfirmacion({
      abierto: true,
      episodioId: ep.episodioId,
      nombrePaciente: `${ep.apellido || ""} ${ep.nombre || ""}`.trim(),
    });
  };

  const cerrarConfirmacionFinalizar = () => {
    if (procesandoId) return;

    setModalConfirmacion({
      abierto: false,
      episodioId: null,
      nombrePaciente: "",
    });
  };

  const confirmarFinalizacion = async () => {
    if (!modalConfirmacion.episodioId) return;

    await handleCambioEstado(modalConfirmacion.episodioId, "FINALIZADO");
    cerrarConfirmacionFinalizar();
  };

  const renderAccionesEstado = (ep) => {
    if (usuario?.rol !== "medico") {
      return <span className="sis-text-muted">Sin acciones</span>;
    }

    if (ep.estadoAtencion === "EN_ESPERA") {
      return (
        <button
          className="sis-btn sis-btn-primary sis-btn-sm"
          disabled={procesandoId === ep.episodioId}
          onClick={() => handleCambioEstado(ep.episodioId, "EN_ATENCION")}
        >
          {procesandoId === ep.episodioId ? "Procesando..." : "Habilitar evolucion"}
        </button>
      );
    }

    if (ep.estadoAtencion === "EN_ATENCION") {
      return (
        <button
          className="sis-btn sis-btn-warning sis-btn-sm"
          disabled={procesandoId === ep.episodioId}
          onClick={() => abrirConfirmacionFinalizar(ep)}
        >
          {procesandoId === ep.episodioId ? "Procesando..." : "Finalizar atención"}
        </button>
      );
    }

    if (ep.estadoAtencion === "FINALIZADO") {
      return (
        <button
          className="sis-btn sis-btn-secondary sis-btn-sm"
          disabled={procesandoId === ep.episodioId}
          onClick={() => handleCambioEstado(ep.episodioId, "EN_ATENCION")}
        >
          {procesandoId === ep.episodioId ? "Procesando..." : "Reabrir atención"}
        </button>
      );
    }

    return <span className="sis-text-muted">Sin acciones</span>;
  };

  const episodiosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return episodios.filter((ep) => {
      const cumpleEstado = !estadoFiltro || ep.estadoAtencion === estadoFiltro;

      if (!cumpleEstado) return false;

      if (!texto) return true;

      const dni = String(ep.dni || "").toLowerCase();
      const apellido = String(ep.apellido || "").toLowerCase();
      const nombre = String(ep.nombre || "").toLowerCase();
      const cama = String(ep.camaCodigo || "").toLowerCase();

      return (
        dni.includes(texto) ||
        apellido.includes(texto) ||
        nombre.includes(texto) ||
        cama.includes(texto)
      );
    });
  }, [episodios, busqueda, estadoFiltro]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("");
  };

  return (
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">{titulo}</h2>
          <p className="sis-page-subtitle"></p>
        </div>

        <div className="sis-page-actions">
          <button className="sis-btn sis-btn-outline" onClick={cargarDatos}>
            Actualizar
          </button>
        </div>
      </div>

      <div className="sis-card">
        <div className="sis-card-body">
          {loading && <div className="sis-loading-state">Cargando pacientes...</div>}

          {!loading && error && (
            <div className="sis-alert sis-alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div
                className="sis-form-grid"
                style={{ marginBottom: "1rem", alignItems: "end" }}
              >
                <div className="sis-form-group">
                  <label className="sis-form-label">Buscar paciente</label>
                  <input
                    className="sis-form-control"
                    type="text"
                    placeholder="Buscar por DNI, nombre, apellido o cama"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Estado</label>
                  <select
                    className="sis-form-control"
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="EN_ESPERA">En espera</option>
                    <option value="EN_ATENCION">En atención</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>

                <div className="sis-form-field">
                  <label className="sis-label">&nbsp;</label>
                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>

              <div className="sis-text-muted" style={{ marginBottom: "1rem" }}>
                Mostrando {episodiosFiltrados.length} de {episodios.length} pacientes
              </div>
            </>
          )}

          {!loading && !error && episodios.length === 0 && (
            <div className="sis-alert sis-alert-info" role="alert">
              No hay pacientes activos en este servicio.
            </div>
          )}

          {!loading && !error && episodios.length > 0 && episodiosFiltrados.length === 0 && (
            <div className="sis-alert sis-alert-info" role="alert">
              No se encontraron pacientes con los filtros aplicados.
            </div>
          )}

          {!loading && !error && episodiosFiltrados.length > 0 && (
            <div className="sis-table-wrapper">
              <table className="sis-table">
                <thead>
                  <tr>
                    <th>Episodio</th>
                    <th>DNI</th>
                    <th>Apellido</th>
                    <th>Nombre</th>
                    <th>Cama</th>
                    <th>Estado</th>
                    <th>Fecha ingreso</th>
                    <th>Acciones clínicas</th>
                    <th>Evolucion medica</th>
                  </tr>
                </thead>
                <tbody>
                  {episodiosFiltrados.map((ep) => (
                    <tr key={ep.episodioId}>
                      <td className="sis-cell-strong">{ep.episodioId}</td>
                      <td>{ep.dni || "-"}</td>
                      <td>{ep.apellido || "-"}</td>
                      <td>{ep.nombre || "-"}</td>
                      <td>{ep.camaCodigo || "-"}</td>
                      <td>
                        <span className={obtenerClaseEstado(ep.estadoAtencion)}>
                          {formatearEstado(ep.estadoAtencion)}
                        </span>
                      </td>
                      <td className="sis-cell-muted">{formatearFecha(ep.fechaIngreso)}</td>
                      <td className="sis-actions-cell">
                        <div className="sis-actions-group">
                          {renderAccionesEstado(ep)}

                          <button
                            className="sis-btn sis-btn-outline sis-btn-sm"
                            onClick={() => navigate(`/medico/hospitalizacion/historial-traslados/${ep.episodioId}`)}
                          >
                            Ver historial traslados
                          </button>

                          {ep.estadoAtencion !== "ALTA" && (
                            <button
                              className="sis-btn sis-btn-outline sis-btn-sm"
                              onClick={() => navigate(`/medico/hospitalizacion/traslado-cama/${ep.episodioId}`)}
                            >
                              Cambiar cama
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="sis-actions-cell">
                        <div className="sis-actions-group">
                          <button
                            className="sis-btn sis-btn-outline sis-btn-sm"
                            onClick={() => navigate(`/medico/episodios/${ep.episodioId}`)}
                          >
                            Evolucionar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

                  <ConfirmDialog
                    open={modalConfirmacion.abierto}
                    title="Confirmar finalizacion "
                    message={`¿Realmente querés finalizar la evolucion${modalConfirmacion.nombrePaciente ? ` de ${modalConfirmacion.nombrePaciente}` : ""}?`}
                    onConfirm={confirmarFinalizacion}
                    onCancel={cerrarConfirmacionFinalizar}
                    confirmText="Sí, finalizar"
                    cancelText="No"
                    loading={procesandoId === modalConfirmacion.turnoId}
                  />
    </div>
  );
}
