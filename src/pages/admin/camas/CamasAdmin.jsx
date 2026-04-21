import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AlertDialog from "../../../components/AlertDialog";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {
  obtenerCamasAdmin,
  crearCamaAdmin,
  actualizarCamaAdmin,
} from "../../../api/camasApi";

const ITEMS_POR_PAGINA = 10;

const EMPTY_FORM = {
  codigo: "",
  descripcion: "",
  tipoServicio: "HOSPITALIZACION",
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

const formGridStyle = {
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const searchWrapStyle = {
  minWidth: 280,
  flex: "1 1 320px",
};

const sectionTitleStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const selectedRowStyle = {
  backgroundColor: "#eef6ff",
};

const resumeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 18,
};

function getTipoServicioLabel(tipo) {
  if (tipo === "HOSPITALIZACION") return "Hospitalización";
  if (tipo === "GUARDIA") return "Guardia";
  if (tipo === "CONSULTORIOS") return "Consultorios";
  return tipo || "-";
}

function getTipoServicioBadgeStyle(tipo) {
  if (tipo === "HOSPITALIZACION") {
    return {
      backgroundColor: "#eefbf3",
      color: "#157347",
      border: "1px solid #b8e3c8",
    };
  }

  if (tipo === "GUARDIA") {
    return {
      backgroundColor: "#fff7e6",
      color: "#9a6700",
      border: "1px solid #f5d48a",
    };
  }

  if (tipo === "CONSULTORIOS") {
    return {
      backgroundColor: "#e8f7fe",
      color: "#055160",
      border: "1px solid #b6effb",
    };
  }

  return {
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #dbe4ee",
  };
}

function getEstadoBadgeStyle(estado) {
  const value = (estado || "").toUpperCase();

  if (value.includes("DISPON")) {
    return {
      backgroundColor: "#eefbf3",
      color: "#157347",
      border: "1px solid #b8e3c8",
    };
  }

  if (value.includes("OCUP")) {
    return {
      backgroundColor: "#fbe9ec",
      color: "#842029",
      border: "1px solid #f5c2c7",
    };
  }

  if (value.includes("MANT") || value.includes("INACT")) {
    return {
      backgroundColor: "#f1f5f9",
      color: "#475569",
      border: "1px solid #d8e0e8",
    };
  }

  return {
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #dbe4ee",
  };
}

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

export default function CamasAdmin() {
  const navigate = useNavigate();

  const [camas, setCamas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [formCrear, setFormCrear] = useState(EMPTY_FORM);
  const [camaSeleccionada, setCamaSeleccionada] = useState(null);
  const [formEditar, setFormEditar] = useState(EMPTY_FORM);

  const [dialog, setDialog] = useState(EMPTY_DIALOG);
  const [confirmDialog, setConfirmDialog] = useState(EMPTY_CONFIRM);

  useEffect(() => {
    cargarCamas();
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
    if (guardando) return;
    setConfirmDialog(EMPTY_CONFIRM);
  };

  const cargarCamas = async () => {
    try {
      setLoading(true);
      const data = await obtenerCamasAdmin();
      setCamas(Array.isArray(data) ? data : []);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudieron cargar las camas.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const camasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return camas;

    return camas.filter((c) => {
      const codigo = (c.codigo || "").toLowerCase();
      const descripcion = (c.descripcion || "").toLowerCase();
      const tipo = (c.tipoServicio || "").toLowerCase();
      const estado = (c.estado || "").toLowerCase();

      return (
        codigo.includes(q) ||
        descripcion.includes(q) ||
        tipo.includes(q) ||
        estado.includes(q)
      );
    });
  }, [camas, busqueda]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(camasFiltradas.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const camasPaginadas = camasFiltradas.slice(indiceInicio, indiceFin);

  const totalCamas = camas.length;
  const totalDisponibles = camas.filter((c) =>
    String(c.estado || "").toUpperCase().includes("DISPON")
  ).length;
  const totalOcupadas = camas.filter((c) =>
    String(c.estado || "").toUpperCase().includes("OCUP")
  ).length;
  const totalHospitalizacion = camas.filter(
    (c) => c.tipoServicio === "HOSPITALIZACION"
  ).length;

  const seleccionarCama = (cama) => {
    setCamaSeleccionada(cama);
    setFormEditar({
      codigo: cama.codigo || "",
      descripcion: cama.descripcion || "",
      tipoServicio: cama.tipoServicio || "HOSPITALIZACION",
    });
    window.scrollTo({ top: 10000, behavior: "smooth" });
  };

  const limpiarSeleccion = () => {
    setCamaSeleccionada(null);
    setFormEditar(EMPTY_FORM);
  };

  const ejecutarCrear = async () => {
    try {
      setGuardando(true);
      await crearCamaAdmin(formCrear);
      setFormCrear(EMPTY_FORM);
      await cargarCamas();
      cerrarConfirmacion();
      showDialog("Cama creada", "Cama creada correctamente.", "success");
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo crear la cama.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarActualizar = async () => {
    if (!camaSeleccionada?.id) return;

    try {
      setGuardando(true);
      await actualizarCamaAdmin(camaSeleccionada.id, formEditar);
      await cargarCamas();
      cerrarConfirmacion();
      showDialog("Cama actualizada", "Cama actualizada correctamente.", "success");
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo actualizar la cama.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarAccion = async () => {
    switch (confirmDialog.action) {
      case "crear":
        await ejecutarCrear();
        break;
      case "actualizar":
        await ejecutarActualizar();
        break;
      default:
        cerrarConfirmacion();
        break;
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    abrirConfirmacion(
      "Confirmar creación",
      "¿Seguro que querés crear esta cama?",
      "crear"
    );
  };

  const handleActualizar = async (e) => {
    e.preventDefault();

    if (!camaSeleccionada?.id) return;

    abrirConfirmacion(
      "Confirmar actualización",
      `¿Seguro que querés guardar los cambios de la cama #${camaSeleccionada.id}?`,
      "actualizar"
    );
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Administración de camas</h2>
            <p className="sis-page-subtitle">
              Gestioná altas, edición y consulta de camas disponibles dentro del sistema.
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
              onClick={cargarCamas}
              disabled={loading}
              type="button"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <div style={statsGridStyle}>
          <StatCard
            titulo="Total"
            valor={totalCamas}
            descripcion="Camas registradas en el sistema"
          />
          <StatCard
            titulo="Disponibles"
            valor={totalDisponibles}
            descripcion="Camas actualmente disponibles"
          />
          <StatCard
            titulo="Ocupadas"
            valor={totalOcupadas}
            descripcion="Camas actualmente ocupadas"
          />
          <StatCard
            titulo="Hospitalización"
            valor={totalHospitalizacion}
            descripcion="Camas asociadas a hospitalización"
          />
        </div>

        <div className="sis-card" style={{ marginBottom: 24 }}>
          <div className="sis-card-body">
            <div style={sectionTitleStyle}>
              <h3 className="sis-page-title2">Crear cama</h3>
              <p className="sis-page-subtitle">
                Completá los datos para registrar una nueva cama dentro del sistema.
              </p>
            </div>

            <form onSubmit={handleCrear} className="sis-form" style={{ marginTop: 18 }}>
              <div className="sis-form-grid" style={formGridStyle}>
                <div className="sis-form-group">
                  <label className="sis-form-label">Código</label>
                  <input
                    className="sis-form-control"
                    placeholder="Ej: H-101"
                    value={formCrear.codigo}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, codigo: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Descripción</label>
                  <input
                    className="sis-form-control"
                    placeholder="Ej: Cama individual sala norte"
                    value={formCrear.descripcion}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, descripcion: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Tipo servicio</label>
                  <select
                    className="sis-form-control"
                    value={formCrear.tipoServicio}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, tipoServicio: e.target.value }))
                    }
                    required
                  >
                    <option value="HOSPITALIZACION">HOSPITALIZACIÓN</option>
                    <option value="GUARDIA">GUARDIA</option>
                    <option value="CONSULTORIOS">CONSULTORIOS</option>
                  </select>
                </div>
              </div>

              <div className="sis-page-actions">
                <button
                  type="submit"
                  className="sis-btn sis-btn-primary"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Crear cama"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 24 }}>
          <div className="sis-card-body">
            <div
              className="sis-page-header"
              style={{ marginBottom: 18, alignItems: "flex-end" }}
            >
              <div className="sis-page-title-wrap">
                <h3 className="sis-page-title2">Camas registradas</h3>
                <p className="sis-page-subtitle">
                  Buscá y seleccioná una cama para ver o editar sus datos principales.
                </p>
              </div>

              <div style={searchWrapStyle}>
                <label className="sis-form-label" style={{ marginBottom: 8, display: "block" }}>
                  Buscar cama
                </label>
                <input
                  className="sis-form-control"
                  placeholder="Buscar por código, descripción, tipo o estado"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading && <div className="sis-loading-state">Cargando camas...</div>}

            {!loading && camasFiltradas.length === 0 && (
              <div className="sis-alert sis-alert-info" role="alert">
                No hay camas cargadas con el filtro actual.
              </div>
            )}

            {!loading && camasFiltradas.length > 0 && (
              <>
                <div className="sis-table-wrapper">
                  <table className="sis-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Tipo servicio</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {camasPaginadas.map((cama) => {
                        const isSelected = camaSeleccionada?.id === cama.id;

                        return (
                          <tr key={cama.id}>
                            <td
                              className="sis-cell-strong"
                              style={isSelected ? selectedRowStyle : undefined}
                            >
                              {cama.id}
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <span className="sis-cell-strong">{cama.codigo}</span>
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              {cama.descripcion}
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <span
                                className="sis-badge"
                                style={getTipoServicioBadgeStyle(cama.tipoServicio)}
                              >
                                {getTipoServicioLabel(cama.tipoServicio)}
                              </span>
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <span
                                className="sis-badge"
                                style={getEstadoBadgeStyle(cama.estado)}
                              >
                                {cama.estado || "-"}
                              </span>
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <button
                                className="sis-btn sis-btn-primary sis-btn-sm"
                                type="button"
                                onClick={() => seleccionarCama(cama)}
                              >
                                {isSelected ? "Seleccionada" : "Editar"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
                    Mostrando {camasPaginadas.length} de {camasFiltradas.length} camas filtradas ·
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
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() => setPaginaActual(1)}
                      disabled={paginaActual === 1}
                    >
                      Primera
                    </button>

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                      disabled={paginaActual === 1}
                    >
                      Anterior
                    </button>

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() =>
                        setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                      }
                      disabled={paginaActual === totalPaginas}
                    >
                      Siguiente
                    </button>

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
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

        {camaSeleccionada && (
          <div className="sis-card">
            <div className="sis-card-body">
              <div className="sis-page-header" style={{ marginBottom: 18 }}>
                <div className="sis-page-title-wrap">
                  <h3 className="sis-page-title2">Editar cama #{camaSeleccionada.id}</h3>
                  <p className="sis-page-subtitle">
                    Modificá los datos principales de la cama seleccionada.
                  </p>
                </div>

                <div className="sis-page-actions">
                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={limpiarSeleccion}
                  >
                    Cerrar edición
                  </button>
                </div>
              </div>

              <div style={resumeGridStyle}>
                <DataResumeItem label="Código actual" value={camaSeleccionada.codigo} />
                <DataResumeItem label="Descripción actual" value={camaSeleccionada.descripcion} />
                <DataResumeItem
                  label="Tipo actual"
                  value={getTipoServicioLabel(camaSeleccionada.tipoServicio)}
                />
                <DataResumeItem label="Estado actual" value={camaSeleccionada.estado} />
              </div>

              <form onSubmit={handleActualizar} className="sis-form">
                <div className="sis-form-grid" style={formGridStyle}>
                  <div className="sis-form-group">
                    <label className="sis-form-label">Código</label>
                    <input
                      className="sis-form-control"
                      placeholder="Ej: H-101"
                      value={formEditar.codigo}
                      onChange={(e) =>
                        setFormEditar((prev) => ({ ...prev, codigo: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="sis-form-group">
                    <label className="sis-form-label">Descripción</label>
                    <input
                      className="sis-form-control"
                      placeholder="Ej: Cama individual sala norte"
                      value={formEditar.descripcion}
                      onChange={(e) =>
                        setFormEditar((prev) => ({ ...prev, descripcion: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="sis-form-group">
                    <label className="sis-form-label">Tipo servicio</label>
                    <select
                      className="sis-form-control"
                      value={formEditar.tipoServicio}
                      onChange={(e) =>
                        setFormEditar((prev) => ({ ...prev, tipoServicio: e.target.value }))
                      }
                      required
                    >
                      <option value="HOSPITALIZACION">HOSPITALIZACIÓN</option>
                      <option value="GUARDIA">GUARDIA</option>
                      <option value="CONSULTORIOS">CONSULTORIOS</option>
                    </select>
                  </div>
                </div>

                <div className="sis-page-actions">
                  <button
                    type="submit"
                    className="sis-btn sis-btn-primary"
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmarAccion}
        onCancel={cerrarConfirmacion}
        loading={guardando}
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
