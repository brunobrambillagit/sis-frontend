import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarEstadoEpisodio, obtenerEpisodiosActivos } from "../api/episodiosApi";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

const ITEMS_POR_PAGINA = 10;

function formatearFecha(fecha) {
  if (!fecha) return "-";

  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
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

export default function EpisodiosActivosTableHospitalizacion() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [episodios, setEpisodios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    episodioId: null,
    nombrePaciente: "",
  });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerEpisodiosActivos("HOSPITALIZACION");
      setEpisodios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de pacientes Hospitalizados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAlta = async (episodioId) => {
    try {
      if (!usuario?.id) {
        alert("No se encontró el id del usuario logueado. Cerrá sesión e iniciá nuevamente.");
        return;
      }

      setProcesandoId(episodioId);
      await cambiarEstadoEpisodio(episodioId, "ALTA", usuario.id);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo dar el alta.";
      alert(mensaje);
    } finally {
      setProcesandoId(null);
    }
  };

  const abrirConfirmacionAlta = (ep) => {
    setModalConfirmacion({
      abierto: true,
      episodioId: ep.episodioId,
      nombrePaciente: `${ep.apellido || ""} ${ep.nombre || ""}`.trim(),
    });
  };

  const cerrarConfirmacionAlta = () => {
    if (procesandoId) return;

    setModalConfirmacion({
      abierto: false,
      episodioId: null,
      nombrePaciente: "",
    });
  };

  const confirmarAlta = async () => {
    if (!modalConfirmacion.episodioId) return;

    await handleAlta(modalConfirmacion.episodioId);
    cerrarConfirmacionAlta();
  };

  const handleCambiarCama = (episodioId) => {
    navigate(`/administrativo/hospitalizacion/traslado-cama/${episodioId}`);
  };

  const handleVerHistorial = (episodioId) => {
    navigate(`/administrativo/hospitalizacion/historial-traslados/${episodioId}`);
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

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(episodiosFiltrados.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const episodiosPaginados = episodiosFiltrados.slice(indiceInicio, indiceFin);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("");
    setPaginaActual(1);
  };

  return (
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">Lista de pacientes en Hospitalizacion</h2>
          <p className="sis-page-subtitle"></p>
        </div>

        <div className="sis-page-actions">
          <button className="sis-btn sis-btn-outline" onClick={cargarDatos}>
            Actualizar listado
          </button>

          <button
            className="sis-btn sis-btn-outline"
            onClick={() => navigate("/administrativo/hospitalizacion/crear-paciente")}
          >
            Crear paciente
          </button>

          <button
            className="sis-btn sis-btn-primary"
            onClick={() => navigate("/administrativo/hospitalizacion/admision")}
          >
            Admisionar paciente
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
                    placeholder="Buscar por DNI, apellido, nombre o cama"
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
              No hay pacientes activos en hospitalización.
            </div>
          )}

          {!loading && !error && episodios.length > 0 && episodiosFiltrados.length === 0 && (
            <div className="sis-alert sis-alert-info" role="alert">
              No se encontraron pacientes con los filtros aplicados.
            </div>
          )}

          {!loading && !error && episodiosFiltrados.length > 0 && (
            <>
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
                      <th>Acciones administrativas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {episodiosPaginados.map((ep) => (
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
                            <button
                              className="sis-btn sis-btn-outline sis-btn-sm"
                              onClick={() => handleVerHistorial(ep.episodioId)}
                            >
                              Ver historial traslados
                            </button>

                            {ep.estadoAtencion !== "ALTA" && (
                              <button
                                className="sis-btn sis-btn-outline sis-btn-sm"
                                onClick={() => handleCambiarCama(ep.episodioId)}
                              >
                                Cambiar cama
                              </button>
                            )}

                            {usuario?.rol === "administrativo" && ep.estadoAtencion === "FINALIZADO" && (
                              <button
                                className="sis-btn sis-btn-success sis-btn-sm"
                                disabled={procesandoId === ep.episodioId}
                                onClick={() => abrirConfirmacionAlta(ep)}
                              >
                                {procesandoId === ep.episodioId ? "Procesando..." : "Dar alta"}
                              </button>
                            )}

                            {ep.estadoAtencion !== "FINALIZADO" && (
                              <span className="sis-text-muted">Alta no disponible</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div className="sis-text-muted">
                  Página {paginaActual} de {totalPaginas}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                  >
                    Primera
                  </button>

                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                  >
                    Anterior
                  </button>

                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={() =>
                      setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                    }
                    disabled={paginaActual === totalPaginas}
                  >
                    Siguiente
                  </button>

                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                  >
                    Última
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={modalConfirmacion.abierto}
        title="Confirmar alta"
        message={`¿Realmente querés dar el alta${modalConfirmacion.nombrePaciente ? ` de ${modalConfirmacion.nombrePaciente}` : ""}?`}
        onConfirm={confirmarAlta}
        onCancel={cerrarConfirmacionAlta}
        confirmText="Sí, finalizar"
        cancelText="No"
        loading={procesandoId === modalConfirmacion.episodioId}
      />
    </div>
  );
}
