import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cambiarEstadoTurno,
  obtenerAgendas,
  obtenerComprobanteTurno,
  obtenerTurnosAdministrativo,
  reprogramarTurno,
} from "../api/consultoriosApi";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatearFechaHora(valor) {
  if (!valor) return "-";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatearHora(valor) {
  if (!valor) return "-";
  return String(valor).slice(0, 5);
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case "CITADO":
      return "sis-status sis-status-default";
    case "EN_ESPERA":
      return "sis-status sis-status-espera";
    case "EN_ATENCION":
      return "sis-status sis-status-atencion";
    case "FINALIZADO":
      return "sis-status sis-status-finalizado";
    case "ALTA":
      return "sis-status sis-status-alta";
    case "AUSENTE":
    case "DISPONIBLE":
    case "CANCELADO":
    case "REPROGRAMADO":
      return "sis-status sis-status-default";
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
    case "AUSENTE":
      return "Ausente";
    case "CANCELADO":
      return "Cancelado";
    case "REPROGRAMADO":
      return "DISPONIBLE";
    case "Disponible":
      return "Reprogramado";
    default:
      return estado || "-";
  }
}

function imprimirComprobanteSimple(comprobante) {
  const ventana = window.open("", "_blank", "width=760,height=680");
  if (!ventana) {
    alert("No se pudo abrir la ventana de impresión.");
    return;
  }

  ventana.document.write(`
    <html>
      <head>
        <title>Comprobante de turno</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1 { font-size: 22px; margin-bottom: 16px; }
          .bloque { margin-bottom: 14px; }
          .fila { margin-bottom: 8px; }
          .label { font-weight: bold; }
          .caja { border: 1px solid #bbb; border-radius: 8px; padding: 16px; }
        </style>
      </head>
      <body>
        <h1>Comprobante de turno</h1>
        <div class="caja">
          <div class="fila"><span class="label">Paciente:</span> ${comprobante.pacienteNombreCompleto || "-"}</div>
          <div class="fila"><span class="label">DNI:</span> ${comprobante.pacienteDni || "-"}</div>
          <div class="fila"><span class="label">Agenda:</span> ${comprobante.agendaNombre || "-"}</div>
          <div class="fila"><span class="label">Especialidad:</span> ${comprobante.especialidad || "-"}</div>
          <div class="fila"><span class="label">Fecha:</span> ${comprobante.fecha || "-"}</div>
          <div class="fila"><span class="label">Hora turno:</span> ${formatearHora(comprobante.horaDesde)} - ${formatearHora(comprobante.horaHasta)}</div>
          <div class="fila"><span class="label">Médico:</span> ${comprobante.medicosAgenda || "-"}</div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);
  ventana.document.close();
}

export default function TurnosAdminConsultoriosTable() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [turnos, setTurnos] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha: hoyISO(),
    agendaId: "",
    estado: "",
  });

  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
    turnoId: null,
    nombrePaciente: "",
  });

  const abrirConfirmacionAlta = (turno) => {
    setModalConfirmacion({
      abierto: true,
      turnoId: turno.turnoId,
      nombrePaciente: `${turno.pacienteNombre || ""} ${turno.pacienteApellido || ""}`.trim(),
    });
  };

  const cerrarConfirmacionAlta = () => {
    if (procesandoId) return;

    setModalConfirmacion({
      abierto: false,
      turnoId: null,
      nombrePaciente: "",
    });
  };

  const confirmarAlta = async () => {
    if (!modalConfirmacion.turnoId) return;

    await handleCambiarEstado(modalConfirmacion.turnoId, "ALTA");
    cerrarConfirmacionAlta();
  };

  const cargarAgendas = async () => {
    try {
      const data = await obtenerAgendas();
      setAgendas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const cargarTurnos = async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        fecha: filtros.fecha || undefined,
        agendaId: filtros.agendaId || undefined,
        estado: filtros.estado || undefined,
      };
      const data = await obtenerTurnosAdministrativo(params);
      setTurnos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el listado de turnos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAgendas();
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [filtros.fecha, filtros.agendaId, filtros.estado]);

  const resumen = useMemo(() => {
    return {
      citados: turnos.filter((t) => t.estadoTurno === "CITADO").length,
      enEspera: turnos.filter((t) => t.estadoTurno === "EN_ESPERA").length,
      finalizados: turnos.filter((t) => t.estadoTurno === "ALTA").length,
    };
  }, [turnos]);

  const handleCambiarEstado = async (turnoId, nuevoEstado) => {
    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    try {
      setProcesandoId(turnoId);
      await cambiarEstadoTurno(turnoId, {
        nuevoEstado,
        usuarioId: usuario.id,
      });
      await cargarTurnos();
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

  const handleReprogramar = async (turno) => {
    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    const nuevoTurnoId = window.prompt("Ingresá el ID del nuevo turno libre al que querés reprogramar:");
    if (!nuevoTurnoId) return;

    try {
      setProcesandoId(turno.turnoId);
      await reprogramarTurno(turno.turnoId, {
        nuevoTurnoId: Number(nuevoTurnoId),
        usuarioId: usuario.id,
      });
      await cargarTurnos();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo reprogramar el turno."
      );
    } finally {
      setProcesandoId(null);
    }
  };

  const handleImprimir = async (turnoId) => {
    try {
      const comprobante = await obtenerComprobanteTurno(turnoId);
      imprimirComprobanteSimple(comprobante);
    } catch (err) {
      console.error(err);
      alert("No se pudo obtener el comprobante del turno.");
    }
  };

  const renderAcciones = (turno) => {
    if (turno.estadoTurno === "CITADO") {
      return (
        <div className="sis-actions-group">
          <button
            className="sis-btn sis-btn-primary sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => handleCambiarEstado(turno.turnoId, "EN_ESPERA")}
          >
            {procesandoId === turno.turnoId ? "Procesando..." : "Registrar llegada"}
          </button>

          <button
            className="sis-btn sis-btn-outline sis-btn-sm"
            onClick={() => handleImprimir(turno.turnoId)}
          >
            Comprobante
          </button>

          <button
            className="sis-btn sis-btn-outline sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => handleReprogramar(turno)}
          >
            Reprogramar
          </button>

          <button
            className="sis-btn sis-btn-outline sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => handleCambiarEstado(turno.turnoId, "AUSENTE")}
          >
            Ausente
          </button>

          <button
            className="sis-btn sis-btn-outline sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => handleCambiarEstado(turno.turnoId, "CANCELADO")}
          >
            Cancelar
          </button>
        </div>
      );
    }

    if (turno.estadoTurno === "FINALIZADO") {
      return (
        <div className="sis-actions-group">
          <button
            className="sis-btn sis-btn-success sis-btn-sm"
            disabled={procesandoId === turno.turnoId}
            onClick={() => abrirConfirmacionAlta(turno)}
          >
            {procesandoId === turno.turnoId ? "Procesando..." : "Finalizar cita"}
          </button>
        </div>
      );
    }

    if (turno.estadoTurno === "EN_ESPERA" || turno.estadoTurno === "EN_ATENCION") {
      return <span className="sis-text-muted">En proceso clínico</span>;
    }

    return <span className="sis-text-muted">Sin acciones</span>;
  };

  return (
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">Lista de pacientes en Consultorios externos</h2>
        </div>

        <div className="sis-page-actions">
          <button className="sis-btn sis-btn-outline" onClick={cargarTurnos}>
            Actualizar listado
          </button>

          <button
          className="sis-btn sis-btn-outline"
          onClick={() => navigate("/administrativo/guardia/crear-paciente")}
        >
          Crear paciente
        </button>

          <button
            className="sis-btn sis-btn-primary"
            onClick={() => navigate("/administrativo/consultorios/admision")}
          >
            Agenda turno
          </button>
        </div>
      </div>

      <div className="sis-card" style={{ marginBottom: 16 }}>
        <div className="sis-card-body">
          <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
            <div className="sis-form-group">
              <label className="sis-form-label">Fecha</label>
              <input
                className="sis-form-control"
                type="date"
                value={filtros.fecha}
                onChange={(e) => setFiltros((prev) => ({ ...prev, fecha: e.target.value }))}
              />
            </div>

            <div className="sis-form-group">
              <label className="sis-form-label">Agenda</label>
              <select
                className="sis-form-control"
                value={filtros.agendaId}
                onChange={(e) => setFiltros((prev) => ({ ...prev, agendaId: e.target.value }))}
              >
                <option value="">Todas</option>
                {agendas.map((agenda) => (
                  <option key={agenda.id} value={agenda.id}>
                    {agenda.nombre} - {agenda.especialidad}
                  </option>
                ))}
              </select>
            </div>

            <div className="sis-form-group">
              <label className="sis-form-label">Estado</label>
              <select
                className="sis-form-control"
                value={filtros.estado}
                onChange={(e) => setFiltros((prev) => ({ ...prev, estado: e.target.value }))}
              >
                <option value="">Todos</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="CITADO">Citado</option>
                <option value="EN_ESPERA">En espera</option>
                <option value="EN_ATENCION">En atención</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="ALTA">Cita finalizada</option>
                <option value="AUSENTE">Ausente</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="REPROGRAMADO">Reprogramado</option>
              </select>
            </div>

            {/* <div className="sis-form-field">
              <label className="sis-form-label">Resumen</label>
              <div className="sis-text-muted" style={{ paddingTop: 10 }}>
                Citados: {resumen.citados} · En espera: {resumen.enEspera} · Citas finalizadas: {resumen.finalizados}
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="sis-card">
        <div className="sis-card-body">
          {loading && <div className="sis-loading-state">Cargando turnos...</div>}

          {!loading && error && (
            <div className="sis-alert sis-alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && turnos.length === 0 && (
            <div className="sis-alert sis-alert-info" role="alert">
              No hay turnos para los filtros seleccionados.
            </div>
          )}

          {!loading && !error && turnos.length > 0 && (
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
                    <th>Médico</th>
                    <th>Estado</th>
                    <th>Acciones administrativas</th>
                  </tr>
                </thead>
                <tbody>
                  {turnos.map((turno) => (
                    <tr key={turno.turnoId}>
                      <td className="sis-cell-strong">{turno.turnoId}</td>
                      <td>{turno.fecha || "-"}</td>
                      <td>{formatearHora(turno.horaDesde)} - {formatearHora(turno.horaHasta)}</td>
                      <td>{turno.pacienteNombre && turno.pacienteApellido ? `${turno.pacienteNombre} ${turno.pacienteApellido}` : ""}</td>
                      <td>{turno.pacienteDni || ""}</td>
                      <td>{turno.agendaNombre || "-"}</td>
                      <td>{turno.medicosAgenda || "-"}</td>
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
          )}
        </div>
      </div>

      <ConfirmDialog
        open={modalConfirmacion.abierto}
        title="Confirmar finalización de cita"
        message={`¿Realmente querés finalizar la cita${modalConfirmacion.nombrePaciente ? ` de ${modalConfirmacion.nombrePaciente}` : ""}?`}
        onConfirm={confirmarAlta}
        onCancel={cerrarConfirmacionAlta}
        confirmText="Sí, finalizar"
        cancelText="No"
        loading={procesandoId === modalConfirmacion.turnoId}
      />
    </div>
  );
}