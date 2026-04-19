import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AlertDialog from "../../../components/AlertDialog";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {
  obtenerHuellasAdmin,
  eliminarHuellaAdmin,
} from "../../../api/huellaApi";
import HuellaPreview from "../../../components/HuellaPreview";

const ITEMS_POR_PAGINA = 10;

function formatearFecha(fecha) {
  if (!fecha) return "-";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HuellaAdmin() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: "Aviso",
    message: "",
    type: "info",
    buttonText: "Aceptar",
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    registro: null,
  });

  useEffect(() => {
    cargarRegistros();
  }, []);

  const openAlertDialog = ({
    title = "Aviso",
    message = "",
    type = "info",
    buttonText = "Aceptar",
  }) => {
    setAlertDialog({ open: true, title, message, type, buttonText });
  };

  const closeAlertDialog = () => {
    setAlertDialog({
      open: false,
      title: "Aviso",
      message: "",
      type: "info",
      buttonText: "Aceptar",
    });
  };

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      const data = await obtenerHuellasAdmin();
      setRegistros(Array.isArray(data) ? data : []);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
      openAlertDialog({
        title: "Error",
        message:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "No se pudieron cargar las huellas registradas.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const registrosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return registros;
    return registros.filter((item) => {
      const paciente = (item.pacienteNombreCompleto || "").toLowerCase();
      const dni = String(item.pacienteDni || "").toLowerCase();
      const dedo = (item.dedo || "").toLowerCase();
      const calidad = (item.quality || "").toLowerCase();
      const proveedor = (item.proveedor || "").toLowerCase();
      return (
        paciente.includes(q) ||
        dni.includes(q) ||
        dedo.includes(q) ||
        calidad.includes(q) ||
        proveedor.includes(q)
      );
    });
  }, [registros, busqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(registrosFiltrados.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const registrosPaginados = registrosFiltrados.slice(
    indiceInicio,
    indiceInicio + ITEMS_POR_PAGINA
  );

  const pedirConfirmacionEliminar = (registro) => {
    setConfirmDialog({ open: true, registro });
  };

  const cerrarConfirmDialog = () => {
    setConfirmDialog({ open: false, registro: null });
  };

  const confirmarEliminar = async () => {
    const registro = confirmDialog.registro;
    if (!registro) return;
    try {
      setEliminandoId(registro.id);
      await eliminarHuellaAdmin(registro.id);
      cerrarConfirmDialog();
      openAlertDialog({
        title: "Huella desactivada",
        message: "La huella fue desactivada correctamente.",
        type: "success",
      });
      await cargarRegistros();
    } catch (err) {
      console.error(err);
      cerrarConfirmDialog();
      openAlertDialog({
        title: "Error",
        message:
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "No se pudo desactivar la huella.",
        type: "error",
      });
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <>
      <Header />
      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Huellas U4500</h2>
          </div>
          <div className="sis-page-actions">
            <button className="sis-btn sis-btn-outline" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button className="sis-btn sis-btn-outline" onClick={cargarRegistros} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <div className="sis-card">
          <div className="sis-card-body">
            <div className="sis-page-header" style={{ marginBottom: 16 }}>
              <div className="sis-page-title-wrap">
                <h3 className="sis-page-title">Huellas registradas</h3>
              </div>
              <div style={{ minWidth: 320 }}>
                <input
                  className="sis-form-control"
                  placeholder="Buscar por paciente, DNI, dedo, calidad o proveedor"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading && <div className="sis-loading-state">Cargando huellas...</div>}

            {!loading && registrosFiltrados.length === 0 && (
              <div className="sis-alert sis-alert-info" role="alert">
                No hay huellas registradas para mostrar.
              </div>
            )}

            {!loading && registrosFiltrados.length > 0 && (
              <>
                <div className="sis-table-wrapper">
                  <table className="sis-table">
                    <thead>
                      <tr>
                        <th>Paciente</th>
                        <th>Huella</th>
                        <th>DNI</th>
                        <th>Dedo</th>
                        <th>Calidad</th>
                        <th>Resolución</th>
                        <th>DPI</th>
                        <th>Proveedor</th>
                        <th>Estado</th>
                        <th>Fecha captura</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrosPaginados.map((item) => (
                        <tr key={item.id}>
                          <td>{item.pacienteNombreCompleto}</td>
                          <td>
                            {item.imagenPreviewBase64 ? (
                              <HuellaPreview
                                base64={item.imagenPreviewBase64}
                                width={item.width}
                                height={item.height}
                                canvasWidth={72}
                                canvasHeight={72}
                              />
                            ) : (
                              <span className="sis-muted-text">Sin preview</span>
                            )}
                          </td>
                          <td>{item.pacienteDni}</td>
                          <td>{item.dedo}</td>
                          <td>{item.quality || "-"}</td>
                          <td>{item.width} x {item.height}</td>
                          <td>{item.dpi}</td>
                          <td>{item.proveedor}</td>
                          <td>{item.activo ? "ACTIVA" : "INACTIVA"}</td>
                          <td>{formatearFecha(item.fechaCaptura)}</td>
                          <td>
                            <button
                              className="sis-btn sis-btn-outline"
                              type="button"
                              onClick={() => pedirConfirmacionEliminar(item)}
                              disabled={eliminandoId === item.id || !item.activo}
                            >
                              {eliminandoId === item.id
                                ? "Desactivando..."
                                : item.activo
                                ? "Desactivar"
                                : "Inactiva"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                  <div className="sis-text-muted">
                    Página {paginaActual} de {totalPaginas}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <button type="button" className="sis-btn sis-btn-outline" onClick={() => setPaginaActual(1)} disabled={paginaActual === 1}>
                      Primera
                    </button>
                    <button type="button" className="sis-btn sis-btn-outline" onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))} disabled={paginaActual === 1}>
                      Anterior
                    </button>
                    <button type="button" className="sis-btn sis-btn-outline" onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))} disabled={paginaActual === totalPaginas}>
                      Siguiente
                    </button>
                    <button type="button" className="sis-btn sis-btn-outline" onClick={() => setPaginaActual(totalPaginas)} disabled={paginaActual === totalPaginas}>
                      Última
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title="Desactivar huella"
        message={confirmDialog.registro ? `¿Querés desactivar la huella del paciente ${confirmDialog.registro.pacienteNombreCompleto}?` : ""}
        onConfirm={confirmarEliminar}
        onCancel={cerrarConfirmDialog}
        confirmText="Desactivar"
        cancelText="Cancelar"
        loading={Boolean(eliminandoId)}
      />

      <AlertDialog
        open={alertDialog.open}
        title={alertDialog.title}
        message={alertDialog.message}
        onClose={closeAlertDialog}
        buttonText={alertDialog.buttonText}
        type={alertDialog.type}
      />
    </>
  );
}
