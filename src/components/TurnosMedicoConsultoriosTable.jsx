import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cambiarEstadoTurno, obtenerAgendasMedico, obtenerTurnosMedico } from "../api/consultoriosApi";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

const ITEMS_POR_PAGINA = 10;

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatearHora(valor) {
  if (!valor) return "-";
  return String(valor).slice(0, 5);
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
    case "CITADO":
      return "Citado";
    case "EN_ESPERA":
      return "En espera";
    case "EN_ATENCION":
      return "En atención";
    case "FINALIZADO":
      return "Finalizado";
    case "ALTA":
      return "Cita finalizada";
    default:
      return estado || "-";
  }
}

export default function TurnosMedicoConsultoriosTable() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [turnos, setTurnos] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtros, setFiltros] = useState({
    fecha: hoyISO(),
    agendaId: "",
  });
  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    turnoId: null,
    nombrePaciente: "",
  });

  const abrirConfirmacionFinalizar = (turno) => {
    setModalConfirmacion({
      abierto: true,
      turnoId: turno.turnoId,
      nombrePaciente: `${turno.pacienteNombre || ""} ${turno.pacienteApellido || ""}`.trim(),
    });
  };

  const cargarAgendas = async () => {
    if (!usuario?.id) return;
    try {
      const data = await obtenerAgendasMedico(usuario.id);
      setAgendas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmarFinalizacion = async () => {
    if (!modalConfirmacion.turnoId) return;

    await handleCambioEstado({ turnoId: modalConfirmacion.turnoId }, "FINALIZADO");
    cerrarConfirmacionFinalizar();
  };

  const cerrarConfirmacionFinalizar = () => {
    if (procesandoId) return;

    setModalConfirmacion({
      abierto: false,
      turnoId: null,
      nombrePaciente: "",
    });
  };

  const cargarTurnos = async () => {
    if (!usuario?.id) return;
    try {
      setLoading(true);
      setError("");
      const data = await obtenerTurnosMedico(usuario.id, {
        fecha: filtros.fecha || undefined,
        agendaId: filtros.agendaId || undefined,
      });
      setTurnos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista médica de consultorios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAgendas();
  }, [usuario?.id]);

  useEffect(() => {
    cargarTurnos();
  }, [usuario?.id, filtros.fecha, filtros.agendaId]);

  const handleCambioEstado = async (turno, nuevoEstado) => {
    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    try {
      setProcesandoId(turno.turnoId);
      const data = await cambiarEstadoTurno(turno.turnoId, {
        nuevoEstado,
        usuarioId: usuario.id,
      });

      await cargarTurnos();

      if (nuevoEstado === "EN_ATENCION") {
        const episodioId = data?.episodioId ?? turno?.episodioId;
        if (episodioId) {
          navigate(`/medico/episodios/${episodioId}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo cambiar el estado del turno."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const resumen = useMemo(() => {
    return {
      enEspera: turnos.filter((t) => t.estadoTurno === "EN_ESPERA").length,
      enAtencion: turnos.filter((t) => t.estadoTurno === "EN_ATENCION").length,
      finalizados: turnos.filter((t) => t.estadoTurno === "FINALIZADO").length,
    };
  }, [turnos]);

  useEffect(() => {
    setPaginaActual(1);
  }, [filtros.fecha, filtros.agendaId]);

  const totalPaginas = Math.max(1, Math.ceil(turnos.length / ITEMS_POR_PAGINA));

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const turnosPaginados = turnos.slice(indiceInicio, indiceFin);

  const renderAcciones = (turno) => {
    if (turno.estadoTurno === "EN_ESPERA") {
      return (
        <button
          className="sis-btn sis-btn-primary sis-btn-sm"
          disabled={procesandoId === turno.turnoId}
          onClick={() => handleCambioEstado(turno, "EN_ATENCION")}
        >
          {procesandoId === turno.turnoId ? "Procesando..." : "Atender"}
        </button>
      );
    }

    if (turno.estadoTurno === "EN_ATENCION") {
      return (
        <div className="sis-actions-group">
          {turno.episodioId && (
            <button
              className="sis-btn sis-btn-outline sis-btn-sm"
              onClick={() => navigate(`/medico/episodios/${turno.episodioId}`)}
            >
              Abrir episodio
            </button>
          )}
          <button
            className="sis-btn sis-btn-warning sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => abrirConfirmacionFinalizar(turno)}
          >
            {procesandoId === turno.turnoId ? "Procesando..." : "Finalizar atención"}
          </button>
        </div>
      );
    }

    if (turno.estadoTurno === "FINALIZADO") {
      return (
        <div className="sis-actions-group">
          {turno.episodioId && (
            <button
              className="sis-btn sis-btn-outline sis-btn-sm"
              onClick={() => navigate(`/medico/episodios/${turno.episodioId}`)}
            >
              Ver episodio
            </button>
          )}
          <button
            className="sis-btn sis-btn-secondary sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => handleCambioEstado(turno, "EN_ATENCION")}
          >
            {procesandoId === turno.turnoId ? "Procesando..." : "Evolucionar"}
          </button>
        </div>
      );
    }

    return <span className="sis-text-muted">Sin acciones</span>;
  };

  return (
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">Listado de pacientes en Consultorios externos</h2>
          <p className="sis-page-subtitle">
            Aca podra observar los pacientes de las agendas que tiene permiso.
          </p>
        </div>

        <div className="sis-page-actions">
          <button className="sis-btn sis-btn-outline" onClick={cargarTurnos}>
            Actualizar listado
          </button>
        </div>
      </div>

      <div className="sis-card" style={{ marginBottom: 16 }}>
        <div className="sis-card-body">
          <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <div className="sis-form-group">
              <label className="sis-form-label">Fecha</label>
              <input
                className="sis-form-control"
                type="date"
                value={filtros.fecha}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, fecha: e.target.value }))
                }
              />
            </div>

            <div className="sis-form-group">
              <label className="sis-form-label">Agenda</label>
              <select
                className="sis-form-control"
                value={filtros.agendaId}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, agendaId: e.target.value }))
                }
              >
                <option value="">Todas mis agendas</option>
                {agendas.map((agenda) => (
                  <option key={agenda.agendaId} value={agenda.agendaId}>
                    {agenda.nombre} - {agenda.especialidad}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="sis-form-field">
              <label className="sis-label">Resumen</label>
              <div className="sis-text-muted" style={{ paddingTop: 10 }}>
                En espera: {resumen.enEspera} · En atención: {resumen.enAtencion} · Finalizados: {resumen.finalizados}
              </div>
            </div> */}
          </div>
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

          {!loading && !error && turnos.length === 0 && (
            <div className="sis-alert sis-alert-info" role="alert">
              No hay pacientes cargados para las agendas habilitadas.
            </div>
          )}

          {!loading && !error && turnos.length > 0 && (
            <>
              <div className="sis-table-wrapper">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>Turno</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>DNI</th>
                      <th>Agenda</th>
                      <th>Estado</th>
                      <th>Acciones clínicas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {turnosPaginados.map((turno) => (
                      <tr key={turno.turnoId}>
                        <td className="sis-cell-strong">{turno.turnoId}</td>
                        <td>{turno.fecha || "-"}</td>
                        <td>{formatearHora(turno.horaDesde)} - {formatearHora(turno.horaHasta)}</td>
                        <td>
                          {turno.pacienteNombre && turno.pacienteApellido
                            ? `${turno.pacienteNombre} ${turno.pacienteApellido}`
                            : ""}
                        </td>
                        <td>{turno.pacienteDni || "-"}</td>
                        <td>{turno.agendaNombre || "-"}</td>
                        <td>
                          <span className={obtenerClaseEstado(turno.estadoTurno)}>
                            {formatearEstado(turno.estadoTurno)}
                          </span>
                        </td>
                        <td className="sis-actions-cell">{renderAcciones(turno)}</td>
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
        title="Confirmar finalizacion"
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
