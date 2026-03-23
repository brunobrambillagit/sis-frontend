import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerEpisodiosActivos } from "../../../api/episodiosApi";
import { obtenerMovimientosCamaPorEpisodio } from "../../../api/movimientosCamaApi";
import Header from "../../../components/Header";

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

function formatearTipoMovimiento(tipo) {
  switch (tipo) {
    case "INGRESO":
      return "Ingreso";
    case "TRASLADO":
      return "Traslado";
    case "ALTA":
      return "Alta";
    default:
      return tipo || "-";
  }
}

function obtenerClaseMovimiento(tipo) {
  switch (tipo) {
    case "INGRESO":
      return "sis-status sis-status-atencion";
    case "TRASLADO":
      return "sis-status sis-status-espera";
    case "ALTA":
      return "sis-status sis-status-finalizado";
    default:
      return "sis-status sis-status-default";
  }
}

export default function HistorialTrasladosHospitalizacion({ basePath }) {
  const navigate = useNavigate();
  const { episodioId } = useParams();

  const [episodio, setEpisodio] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError("");

        const [episodiosData, movimientosData] = await Promise.all([
          obtenerEpisodiosActivos("HOSPITALIZACION"),
          obtenerMovimientosCamaPorEpisodio(episodioId),
        ]);

        const episodioEncontrado = Array.isArray(episodiosData)
          ? episodiosData.find((ep) => String(ep.episodioId) === String(episodioId))
          : null;

        setEpisodio(episodioEncontrado || null);
        setMovimientos(Array.isArray(movimientosData) ? movimientosData : []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el historial de traslados de cama.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [episodioId]);

  return (
    <><Header/> 
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">Historial de traslados de cama</h2>
          <p className="sis-page-subtitle">
            Episodio: <strong>{episodio?.episodioId || episodioId}</strong>
            {episodio ? (
              <>
                {" · "}
                Paciente: <strong>{`${episodio.apellido || ""} ${episodio.nombre || ""}`.trim() || "-"}</strong>
                {" · "}
                DNI: <strong>{episodio.dni || "-"}</strong>
              </>
            ) : null}
          </p>
        </div>

        <div className="sis-page-actions">
          <button className="sis-btn sis-btn-outline" onClick={() => navigate(-1)}>
            Volver
          </button>
          {/* <button className="sis-btn sis-btn-outline" onClick={() => navigate(basePath)}>
            Ir al listado
          </button> */}
        </div>
      </div>

      <div className="sis-card">
        <div className="sis-card-body">
          {loading && <div className="sis-loading-state">Cargando historial...</div>}

          {!loading && error && (
            <div className="sis-alert sis-alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && movimientos.length === 0 && (
            <div className="sis-alert sis-alert-info" role="alert">
              No hay movimientos de cama registrados para este episodio.
            </div>
          )}

          {!loading && !error && movimientos.length > 0 && (
            <div className="sis-table-wrapper">
              <table className="sis-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Cama origen</th>
                    <th>Cama destino</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => (
                    <tr key={mov.id}>
                      <td className="sis-cell-muted">{formatearFecha(mov.fechaMovimiento)}</td>
                      <td>
                        <span className={obtenerClaseMovimiento(mov.tipoMovimiento)}>
                          {formatearTipoMovimiento(mov.tipoMovimiento)}
                        </span>
                      </td>
                      <td>{mov.camaOrigenCodigo || "-"}</td>
                      <td>{mov.camaDestinoCodigo || "-"}</td>
                      <td>{mov.usuarioNombreCompleto || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}