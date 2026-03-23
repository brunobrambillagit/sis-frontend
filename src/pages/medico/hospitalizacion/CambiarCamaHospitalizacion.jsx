import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerCamasDisponiblesHospitalizacion } from "../../../api/camasApi";
import { cambiarCamaEpisodio, obtenerEpisodiosActivos } from "../../../api/episodiosApi";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";


function obtenerRutaVolver(rol) {
  return rol === "medico" ? "/medico/hospitalizacion" : "/administrativo/hospitalizacion";
}

export default function CambiarCamaHospitalizacion() {
  const { episodioId } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [episodio, setEpisodio] = useState(null);
  const [camas, setCamas] = useState([]);
  const [nuevaCamaId, setNuevaCamaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const rutaVolver = useMemo(() => obtenerRutaVolver(usuario?.rol), [usuario?.rol]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const [episodiosActivos, camasDisponibles] = await Promise.all([
          obtenerEpisodiosActivos("HOSPITALIZACION"),
          obtenerCamasDisponiblesHospitalizacion(),
        ]);

        const episodioActual = (episodiosActivos || []).find(
          (item) => String(item.episodioId) === String(episodioId)
        );

        if (!episodioActual) {
          setError("No se encontró el episodio activo de hospitalización.");
          setEpisodio(null);
          setCamas([]);
          return;
        }

        setEpisodio(episodioActual);
        setCamas(Array.isArray(camasDisponibles) ? camasDisponibles : []);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos del traslado de cama.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [episodioId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("No se encontró el usuario logueado. Cerrá sesión e iniciá nuevamente.");
      return;
    }

    if (!nuevaCamaId) {
      alert("Debés seleccionar una nueva cama.");
      return;
    }

    try {
      setGuardando(true);
      await cambiarCamaEpisodio(episodioId, Number(nuevaCamaId), usuario.id);
      alert("La cama del paciente se actualizó correctamente.");
      navigate(rutaVolver);
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo realizar el cambio de cama.";
      alert(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <><Header /> 
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">Traslado / cambio de cama</h2>
          <p className="sis-page-subtitle">
            Seleccioná una nueva cama disponible para el paciente hospitalizado.
          </p>
        </div>

        <div className="sis-page-actions">
          <button className="sis-btn sis-btn-outline" onClick={() => navigate(rutaVolver)}>
            Volver
          </button>
        </div>
      </div>

      <div className="sis-card">
        <div className="sis-card-body">
          {loading && <div className="sis-loading-state">Cargando datos del episodio...</div>}

          {!loading && error && (
            <div className="sis-alert sis-alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && episodio && (
            <form className="sis-form-grid" onSubmit={handleSubmit}>
              <div className="sis-form-group">
                <label className="sis-form-label">Episodio</label>
                <input className="sis-form-control" value={episodio.episodioId || ""} disabled />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">DNI</label>
                <input className="sis-form-control" value={episodio.dni || ""} disabled />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Apellido</label>
                <input className="sis-form-control" value={episodio.apellido || ""} disabled />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Nombre</label>
                <input className="sis-form-control" value={episodio.nombre || ""} disabled />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Cama actual</label>
                <input className="sis-form-control" value={episodio.camaCodigo || "Sin cama asignada"} disabled />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Nueva cama</label>
                <select
                  className="sis-form-control"
                  value={nuevaCamaId}
                  onChange={(e) => setNuevaCamaId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar cama disponible</option>
                  {camas.map((cama) => (
                    <option key={cama.id} value={cama.id}>
                      {cama.codigo} {cama.descripcion ? `- ${cama.descripcion}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sis-form-actions" style={{ gridColumn: "1 / -1" }}>
                <button type="button" className="sis-btn sis-btn-outline" onClick={() => navigate(rutaVolver)}>
                  Cancelar
                </button>
                <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Confirmar cambio de cama"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
    </>
  );
}