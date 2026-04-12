import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
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

export default function CamasAdmin() {
  const navigate = useNavigate();

  const [camas, setCamas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [formCrear, setFormCrear] = useState(EMPTY_FORM);
  const [camaSeleccionada, setCamaSeleccionada] = useState(null);
  const [formEditar, setFormEditar] = useState(EMPTY_FORM);

  useEffect(() => {
    cargarCamas();
  }, []);

  const cargarCamas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerCamasAdmin();
      setCamas(Array.isArray(data) ? data : []);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.response?.data || "No se pudieron cargar las camas.");
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
      return codigo.includes(q) || descripcion.includes(q) || tipo.includes(q) || estado.includes(q);
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

  const handleCrear = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      setMensaje("");
      setError("");
      await crearCamaAdmin(formCrear);
      setMensaje("Cama creada correctamente.");
      setFormCrear(EMPTY_FORM);
      await cargarCamas();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.response?.data || "No se pudo crear la cama.");
    } finally {
      setGuardando(false);
    }
  };

  const seleccionarCama = (cama) => {
    setCamaSeleccionada(cama);
    setFormEditar({
      codigo: cama.codigo || "",
      descripcion: cama.descripcion || "",
      tipoServicio: cama.tipoServicio || "HOSPITALIZACION",
    });
    setMensaje("");
    setError("");
  };

  const handleActualizar = async (e) => {
    e.preventDefault();
    if (!camaSeleccionada?.id) return;

    try {
      setGuardando(true);
      setMensaje("");
      setError("");
      await actualizarCamaAdmin(camaSeleccionada.id, formEditar);
      setMensaje("Cama actualizada correctamente.");
      await cargarCamas();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.response?.data || "No se pudo actualizar la cama.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Administración de camas</h2>
          </div>

          <div className="sis-page-actions">
            <button className="sis-btn sis-btn-outline" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button className="sis-btn sis-btn-outline" onClick={cargarCamas} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {mensaje && (
          <div className="sis-alert sis-alert-success" role="alert" style={{ marginBottom: 16 }}>
            {mensaje}
          </div>
        )}

        {error && (
          <div className="sis-alert sis-alert-danger" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <h3 className="sis-page-title">Crear cama</h3>

            <form onSubmit={handleCrear}>
              <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <div className="sis-form-group">
                  <label className="sis-form-label">Código</label>
                  <input
                    className="sis-form-control"
                    value={formCrear.codigo}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, codigo: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Descripción</label>
                  <input
                    className="sis-form-control"
                    value={formCrear.descripcion}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, descripcion: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Tipo servicio</label>
                  <select
                    className="sis-form-control"
                    value={formCrear.tipoServicio}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, tipoServicio: e.target.value }))}
                    required
                  >
                    <option value="HOSPITALIZACION">HOSPITALIZACIÓN</option>
                    <option value="GUARDIA">GUARDIA</option>
                    <option value="CONSULTORIOS">CONSULTORIOS</option>
                  </select>
                </div>
              </div>

              <div className="sis-page-actions" style={{ marginTop: 16 }}>
                <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Crear cama"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <div className="sis-page-header" style={{ marginBottom: 16 }}>
              <div className="sis-page-title-wrap">
                <h3 className="sis-page-title">Camas registradas</h3>
              </div>
              <div style={{ minWidth: 280 }}>
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
                No hay camas cargadas.
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
                      {camasPaginadas.map((cama) => (
                        <tr key={cama.id}>
                          <td className="sis-cell-strong">{cama.id}</td>
                          <td>{cama.codigo}</td>
                          <td>{cama.descripcion}</td>
                          <td>{cama.tipoServicio}</td>
                          <td>{cama.estado}</td>
                          <td>
                            <button
                              className="sis-btn sis-btn-outline"
                              type="button"
                              onClick={() => seleccionarCama(cama)}
                            >
                              Editar
                            </button>
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

        {camaSeleccionada && (
          <div className="sis-card">
            <div className="sis-card-body">
              <h3 className="sis-page-title">Editar cama #{camaSeleccionada.id}</h3>

              <form onSubmit={handleActualizar}>
                <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                  <div className="sis-form-group">
                    <label className="sis-form-label">Código</label>
                    <input
                      className="sis-form-control"
                      value={formEditar.codigo}
                      onChange={(e) => setFormEditar((prev) => ({ ...prev, codigo: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="sis-form-group">
                    <label className="sis-form-label">Descripción</label>
                    <input
                      className="sis-form-control"
                      value={formEditar.descripcion}
                      onChange={(e) => setFormEditar((prev) => ({ ...prev, descripcion: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="sis-form-group">
                    <label className="sis-form-label">Tipo servicio</label>
                    <select
                      className="sis-form-control"
                      value={formEditar.tipoServicio}
                      onChange={(e) => setFormEditar((prev) => ({ ...prev, tipoServicio: e.target.value }))}
                      required
                    >
                      <option value="HOSPITALIZACION">HOSPITALIZACIÓN</option>
                      <option value="GUARDIA">GUARDIA</option>
                      <option value="CONSULTORIOS">CONSULTORIOS</option>
                    </select>
                  </div>
                </div>

                <div className="sis-page-actions" style={{ marginTop: 16 }}>
                  <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
