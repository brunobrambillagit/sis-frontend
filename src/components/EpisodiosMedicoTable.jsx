    import { useEffect, useState } from "react";
import { cambiarEstadoEpisodio, obtenerEpisodiosActivos } from "../api/episodiosApi";
import { useAuth } from "../context/AuthContext";

export default function EpisodiosMedicoTable({ servicio, titulo }) {
  const { usuario } = useAuth();

  const [episodios, setEpisodios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerEpisodiosActivos(servicio);
      setEpisodios(data);
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
      const mensaje = err?.response?.data?.message || err?.response?.data || "No se pudo cambiar el estado.";
      alert(mensaje);
    } finally {
      setProcesandoId(null);
    }
  };

  const renderAcciones = (ep) => {
    if (usuario?.rol !== "medico") {
      return <span className="text-muted">Sin acciones</span>;
    }

    if (ep.estadoAtencion === "EN_ESPERA") {
      return (
        <button
          className="btn btn-primary btn-sm"
          disabled={procesandoId === ep.episodioId}
          onClick={() => handleCambioEstado(ep.episodioId, "EN_ATENCION")}
        >
          {procesandoId === ep.episodioId ? "Procesando..." : "Tomar paciente"}
        </button>
      );
    }

    if (ep.estadoAtencion === "EN_ATENCION") {
      return (
        <button
          className="btn btn-warning btn-sm"
          disabled={procesandoId === ep.episodioId}
          onClick={() => handleCambioEstado(ep.episodioId, "FINALIZADO")}
        >
          {procesandoId === ep.episodioId ? "Procesando..." : "Finalizar atención"}
        </button>
      );
    }

    if (ep.estadoAtencion === "FINALIZADO") {
      return (
        <button
          className="btn btn-secondary btn-sm"
          disabled={procesandoId === ep.episodioId}
          onClick={() => handleCambioEstado(ep.episodioId, "EN_ATENCION")}
        >
          {procesandoId === ep.episodioId ? "Procesando..." : "Reabrir atención"}
        </button>
      );
    }

    return <span className="text-muted">Sin acciones</span>;
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{titulo}</h2>

        <button className="btn btn-outline-secondary" onClick={cargarDatos}>
          Actualizar
        </button>
      </div>

      {loading && <p>Cargando pacientes...</p>}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && episodios.length === 0 && (
        <div className="alert alert-info" role="alert">
          No hay pacientes activos en este servicio.
        </div>
      )}

      {!loading && !error && episodios.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Episodio</th>
                <th>DNI</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Fecha ingreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {episodios.map((ep) => (
                <tr key={ep.episodioId}>
                  <td>{ep.episodioId}</td>
                  <td>{ep.dni}</td>
                  <td>{ep.apellido}</td>
                  <td>{ep.nombre}</td>
                  <td>{ep.estadoAtencion}</td>
                  <td>{ep.fechaIngreso ? new Date(ep.fechaIngreso).toLocaleString("es-AR") : "-"}</td>
                  <td>{renderAcciones(ep)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
    