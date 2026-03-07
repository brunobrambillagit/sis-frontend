import { useEffect, useState } from "react";
import { cambiarEstadoEpisodio, obtenerEpisodiosActivos } from "../api/episodiosApi";
import { useAuth } from "../context/AuthContext";

export default function EpisodiosActivosTable({ servicio, titulo, mostrarBotonAdmision = false, onAdmision }) {
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

  const obtenerUsuarioIdDesdeStorage = () => {
    const userStr = localStorage.getItem("usuario");
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch {
      return null;
    }
  };

  const handleAlta = async (episodioId) => {
    try {
      const usuarioId = obtenerUsuarioIdDesdeStorage();

      if (!usuarioId) {
        alert("No se encontró el id del usuario logueado. Revisemos luego el login para guardarlo en AuthContext.");
        return;
      }

      setProcesandoId(episodioId);
      await cambiarEstadoEpisodio(episodioId, "ALTA", usuarioId);
      await cargarDatos();
    } catch (err) {
      console.error(err);
      const mensaje = err?.response?.data?.message || err?.response?.data || "No se pudo dar el alta.";
      alert(mensaje);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">{titulo}</h2>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={cargarDatos}>
            Actualizar
          </button>

          {mostrarBotonAdmision && (
            <button className="btn btn-primary" onClick={onAdmision}>
              Admisionar paciente
            </button>
          )}
        </div>
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
                  <td>
                    {usuario?.rol === "administrativo" && ep.estadoAtencion === "FINALIZADO" ? (
                      <button
                        className="btn btn-success btn-sm"
                        disabled={procesandoId === ep.episodioId}
                        onClick={() => handleAlta(ep.episodioId)}
                      >
                        {procesandoId === ep.episodioId ? "Procesando..." : "Dar alta"}
                      </button>
                    ) : (
                      <span className="text-muted">Sin acciones</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}