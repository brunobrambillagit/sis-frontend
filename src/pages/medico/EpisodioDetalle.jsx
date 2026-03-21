import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import {
  agregarEvolucionEpisodio,
  agregarObservacionEpisodio,
  obtenerDetalleEpisodio,
} from "../../api/episodiosDetalleApi";

export default function EpisodioDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [observacion, setObservacion] = useState("");
  const [guardandoObservacion, setGuardandoObservacion] = useState(false);

  const [formEvolucion, setFormEvolucion] = useState({
    diagnosticos: "",
    evolucion: "",
    medicacionIndicaciones: "",
    estudiosSolicitados: "",
  });
  const [guardandoEvolucion, setGuardandoEvolucion] = useState(false);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerDetalleEpisodio(id);
      setDetalle(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el detalle del episodio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const handleGuardarObservacion = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (!observacion.trim()) {
      alert("Ingresá una observación.");
      return;
    }

    try {
      setGuardandoObservacion(true);

      await agregarObservacionEpisodio(id, {
        usuarioId: usuario.id,
        observacion: observacion.trim(),
      });

      setObservacion("");
      await cargarDetalle();
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la observación.";
      alert(mensaje);
    } finally {
      setGuardandoObservacion(false);
    }
  };

  const handleChangeEvolucion = (e) => {
    const { name, value } = e.target;
    setFormEvolucion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGuardarEvolucion = async (e) => {
    e.preventDefault();

    if (!usuario?.id) {
      alert("No se encontró el usuario logueado.");
      return;
    }

    if (
      !formEvolucion.diagnosticos.trim() &&
      !formEvolucion.evolucion.trim() &&
      !formEvolucion.medicacionIndicaciones.trim() &&
      !formEvolucion.estudiosSolicitados.trim()
    ) {
      alert("Completá al menos un campo de la evolución.");
      return;
    }

    try {
      setGuardandoEvolucion(true);

      await agregarEvolucionEpisodio(id, {
        usuarioId: usuario.id,
        diagnosticos: formEvolucion.diagnosticos.trim(),
        evolucion: formEvolucion.evolucion.trim(),
        medicacionIndicaciones: formEvolucion.medicacionIndicaciones.trim(),
        estudiosSolicitados: formEvolucion.estudiosSolicitados.trim(),
      });

      setFormEvolucion({
        diagnosticos: "",
        evolucion: "",
        medicacionIndicaciones: "",
        estudiosSolicitados: "",
      });

      await cargarDetalle();
    } catch (err) {
      console.error(err);
      const mensaje =
        err?.response?.data?.message ||
        err?.response?.data ||
        "No se pudo guardar la evolución.";
      alert(mensaje);
    } finally {
      setGuardandoEvolucion(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Detalle del episodio</h2>
          <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>

        {loading && <p>Cargando detalle...</p>}

        {!loading && error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {!loading && !error && detalle && (
          <>
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <strong>Datos del paciente y episodio</strong>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <strong>Paciente:</strong>
                    <div>{detalle.apellido}, {detalle.nombre}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>DNI:</strong>
                    <div>{detalle.dni || "-"}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Nro. historia clínica:</strong>
                    <div>{detalle.nroHistoriaClinica || "-"}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Episodio:</strong>
                    <div>{detalle.episodioId}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Servicio:</strong>
                    <div>{detalle.tipoServicio}</div>
                  </div>

                  <div className="col-md-4">
                    <strong>Estado:</strong>
                    <div>{detalle.estadoAtencion}</div>
                  </div>

                  <div className="col-md-6">
                    <strong>Fecha de ingreso:</strong>
                    <div>
                      {detalle.fechaIngreso
                        ? new Date(detalle.fechaIngreso).toLocaleString("es-AR")
                        : "-"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <strong>Fecha de egreso:</strong>
                    <div>
                      {detalle.fechaEgreso
                        ? new Date(detalle.fechaEgreso).toLocaleString("es-AR")
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <strong>Observaciones de la historia clínica</strong>
              </div>
              <div className="card-body">
                {detalle.observacionesHistoriaClinica ? (
                  <p className="mb-0">{detalle.observacionesHistoriaClinica}</p>
                ) : (
                  <p className="text-muted mb-0">No hay observaciones en la historia clínica.</p>
                )}
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <strong>Nueva observación del episodio</strong>
              </div>
              <div className="card-body">
                <form onSubmit={handleGuardarObservacion}>
                  <div className="mb-3">
                    <label className="form-label">Observación</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={guardandoObservacion}
                  >
                    {guardandoObservacion ? "Guardando..." : "Guardar observación"}
                  </button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <strong>Historial de observaciones del episodio</strong>
              </div>
              <div className="card-body">
                {!detalle.observaciones || detalle.observaciones.length === 0 ? (
                  <p className="text-muted mb-0">No hay observaciones registradas.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {detalle.observaciones.map((obs) => (
                      <div key={obs.id} className="border rounded p-3">
                        <div className="d-flex justify-content-between flex-wrap mb-2">
                          <strong>{obs.nombreUsuario}</strong>
                          <small className="text-muted">
                            {obs.fechaRegistro
                              ? new Date(obs.fechaRegistro).toLocaleString("es-AR")
                              : "-"}
                          </small>
                        </div>
                        <div>{obs.observacion}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <strong>Nueva evolución médica</strong>
              </div>
              <div className="card-body">
                <form onSubmit={handleGuardarEvolucion}>
                  <div className="mb-3">
                    <label className="form-label">Diagnóstico/s</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="diagnosticos"
                      value={formEvolucion.diagnosticos}
                      onChange={handleChangeEvolucion}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Evolución</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      name="evolucion"
                      value={formEvolucion.evolucion}
                      onChange={handleChangeEvolucion}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Medicación / indicaciones</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="medicacionIndicaciones"
                      value={formEvolucion.medicacionIndicaciones}
                      onChange={handleChangeEvolucion}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Estudios / solicitud de estudios</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      name="estudiosSolicitados"
                      value={formEvolucion.estudiosSolicitados}
                      onChange={handleChangeEvolucion}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={guardandoEvolucion}
                  >
                    {guardandoEvolucion ? "Guardando..." : "Guardar evolución"}
                  </button>
                </form>
              </div>
            </div>

            <div className="card shadow-sm mb-5">
              <div className="card-header">
                <strong>Historial de evoluciones</strong>
              </div>
              <div className="card-body">
                {!detalle.evoluciones || detalle.evoluciones.length === 0 ? (
                  <p className="text-muted mb-0">No hay evoluciones registradas.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {detalle.evoluciones.map((ev) => (
                      <div key={ev.id} className="border rounded p-3">
                        <div className="d-flex justify-content-between flex-wrap mb-3">
                          <strong>{ev.nombreUsuario}</strong>
                          <small className="text-muted">
                            {ev.fechaRegistro
                              ? new Date(ev.fechaRegistro).toLocaleString("es-AR")
                              : "-"}
                          </small>
                        </div>

                        <div className="mb-2">
                          <strong>Diagnóstico/s:</strong>
                          <div>{ev.diagnosticos || "-"}</div>
                        </div>

                        <div className="mb-2">
                          <strong>Evolución:</strong>
                          <div>{ev.evolucion || "-"}</div>
                        </div>

                        <div className="mb-2">
                          <strong>Medicación / indicaciones:</strong>
                          <div>{ev.medicacionIndicaciones || "-"}</div>
                        </div>

                        <div>
                          <strong>Estudios / solicitud de estudios:</strong>
                          <div>{ev.estudiosSolicitados || "-"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}