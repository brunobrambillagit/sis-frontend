import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerCamasDisponiblesHospitalizacion } from "../../../api/camasApi";
import { cambiarCamaEpisodio, obtenerEpisodiosActivos } from "../../../api/episodiosApi";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import ConfirmDialog from "../../../components/ConfirmDialog";
import AlertDialog from "../../../components/AlertDialog";

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

  const [modalConfirmacion, setModalConfirmacion] = useState({
    abierto: false,
  });

  const [alerta, setAlerta] = useState({
    abierta: false,
    titulo: "",
    mensaje: "",
    tipo: "info",
    redirect: false,
  });

  const rutaVolver = useMemo(() => obtenerRutaVolver(usuario?.rol), [usuario?.rol]);

  const mostrarAlerta = ({ titulo, mensaje, tipo = "info", redirect = false }) => {
    setAlerta({
      abierta: true,
      titulo,
      mensaje,
      tipo,
      redirect,
    });
  };

  const cerrarAlerta = () => {
    const debeRedirigir = alerta.redirect;

    setAlerta({
      abierta: false,
      titulo: "",
      mensaje: "",
      tipo: "info",
      redirect: false,
    });

    if (debeRedirigir) {
      navigate(rutaVolver);
    }
  };

  const abrirConfirmacionCambioCama = (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      mostrarAlerta({
        titulo: "Usuario no encontrado",
        mensaje: "No se encontró el usuario logueado. Cerrá sesión e iniciá nuevamente.",
        tipo: "error",
      });
      return;
    }

    if (!nuevaCamaId) {
      mostrarAlerta({
        titulo: "Dato obligatorio",
        mensaje: "Debés seleccionar una nueva cama.",
        tipo: "warning",
      });
      return;
    }

    setModalConfirmacion({ abierto: true });
  };

  const cerrarConfirmacionCambioCama = () => {
    if (guardando) return;
    setModalConfirmacion({ abierto: false });
  };

  const confirmarCambioCama = async () => {
    if (!usuario?.id) {
      mostrarAlerta({
        titulo: "Usuario no encontrado",
        mensaje: "No se encontró el usuario logueado. Cerrá sesión e iniciá nuevamente.",
        tipo: "error",
      });
      return;
    }

    if (!nuevaCamaId) {
      mostrarAlerta({
        titulo: "Dato obligatorio",
        mensaje: "Debés seleccionar una nueva cama.",
        tipo: "warning",
      });
      return;
    }

    try {
      setGuardando(true);
      await cambiarCamaEpisodio(episodioId, Number(nuevaCamaId), usuario.id);
      cerrarConfirmacionCambioCama();

      mostrarAlerta({
        titulo: "Traslado realizado",
        mensaje: "La cama del paciente se actualizó correctamente.",
        tipo: "success",
        redirect: true,
      });
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo realizar el cambio de cama.";

      mostrarAlerta({
        titulo: "Error",
        mensaje,
        tipo: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = (e) => {
    abrirConfirmacionCambioCama(e);
  };

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

  return (
    <>
      <Header />

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
                  <input
                    className="sis-form-control"
                    value={episodio.camaCodigo || "Sin cama asignada"}
                    disabled
                  />
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
                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={() => navigate(rutaVolver)}
                  >
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

        <ConfirmDialog
          open={modalConfirmacion.abierto}
          title="Confirmar cambio de cama"
          message={`¿Realmente querés cambiar la cama${
            episodio?.apellido || episodio?.nombre
              ? ` de ${`${episodio?.apellido || ""} ${episodio?.nombre || ""}`.trim()}`
              : ""
          }?`}
          onConfirm={confirmarCambioCama}
          onCancel={cerrarConfirmacionCambioCama}
          confirmText="Sí, cambiar cama"
          cancelText="No"
          loading={guardando}
        />

        <AlertDialog
          open={alerta.abierta}
          title={alerta.titulo}
          message={alerta.mensaje}
          type={alerta.tipo}
          onClose={cerrarAlerta}
          buttonText="Aceptar"
        />
      </div>
    </>
  );
}
