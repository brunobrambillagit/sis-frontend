import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import {
  obtenerRostrosAdmin,
  eliminarRostroAdmin,
} from "../../../api/reconocimientoApi";

export default function RekognitionAdmin() {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarRegistros();
  }, []);

  const cargarRegistros = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerRostrosAdmin();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudieron cargar los registros biométricos."
      );
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
      const faceId = (item.faceId || "").toLowerCase();
      const externalImageId = (item.externalImageId || "").toLowerCase();
      const bucket = (item.s3Bucket || "").toLowerCase();
      const key = (item.s3Key || "").toLowerCase();

      return (
        paciente.includes(q) ||
        dni.includes(q) ||
        faceId.includes(q) ||
        externalImageId.includes(q) ||
        bucket.includes(q) ||
        key.includes(q)
      );
    });
  }, [registros, busqueda]);

  const handleEliminar = async (registro) => {
    const confirmado = window.confirm(
      `¿Querés eliminar el rostro del paciente ${registro.pacienteNombreCompleto}? Esta acción borra Rekognition y S3.`
    );

    if (!confirmado) return;

    try {
      setEliminandoId(registro.id);
      setMensaje("");
      setError("");

      await eliminarRostroAdmin(registro.id);
      setMensaje("Registro biométrico eliminado correctamente de Rekognition y S3.");
      await cargarRegistros();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudo eliminar el registro biométrico."
      );
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
            <h2 className="sis-page-title">AWS Rekognition</h2>
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

        <div className="sis-card">
          <div className="sis-card-body">
            <div className="sis-page-header" style={{ marginBottom: 16 }}>
              <div className="sis-page-title-wrap">
                <h3 className="sis-page-title">Rostros registrados</h3>
              </div>
              <div style={{ minWidth: 320 }}>
                <input
                  className="sis-form-control"
                  placeholder="Buscar por paciente, faceId, externalImageId, bucket o key"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading && <div className="sis-loading-state">Cargando registros...</div>}

            {!loading && registrosFiltrados.length === 0 && (
              <div className="sis-alert sis-alert-info" role="alert">
                No hay rostros registrados para mostrar.
              </div>
            )}

            {!loading && registrosFiltrados.length > 0 && (
              <div className="sis-table-wrapper">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Paciente</th>
                      <th>DNI</th>
                      <th>faceId</th>
                      <th>externalImageId</th>
                      <th>Bucket</th>
                      <th>Key</th>
                      <th>Collection</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosFiltrados.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.pacienteNombreCompleto || "rostro"}
                              style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }}
                            />
                          ) : (
                            <span className="sis-muted-text">Sin preview</span>
                          )}
                        </td>
                        <td>{item.pacienteNombreCompleto}</td>
                        <td>{item.pacienteDni}</td>
                        <td style={{ maxWidth: 180, wordBreak: "break-word" }}>{item.faceId}</td>
                        <td style={{ maxWidth: 180, wordBreak: "break-word" }}>{item.externalImageId}</td>
                        <td style={{ maxWidth: 180, wordBreak: "break-word" }}>{item.s3Bucket}</td>
                        <td style={{ maxWidth: 220, wordBreak: "break-word" }}>{item.s3Key}</td>
                        <td>{item.collectionId}</td>
                        <td>
                          <button
                            className="sis-btn sis-btn-outline"
                            type="button"
                            onClick={() => handleEliminar(item)}
                            disabled={eliminandoId === item.id}
                          >
                            {eliminandoId === item.id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </td>
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
