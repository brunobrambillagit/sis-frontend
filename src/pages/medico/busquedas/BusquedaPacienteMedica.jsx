import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AlertDialog from "../../../components/AlertDialog";
import BusquedaPacientePorRostro from "../../../components/BusquedaPacientePorRostro";
import BusquedaPacientePorHuellaMock from "../../../components/BusquedaPacientePorHuellaMock";
import { obtenerPacientePorDni } from "../../../api/pacientesApi";
import { obtenerEpisodiosPorPacienteDni } from "../../../api/episodiosApi";

const initialForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  edad: "",
  sexo: "",
  estadoPersona: "",
  nroHistoriaClinica: "",
};

function limpiarDni(value) {
  return (value || "").replace(/\D/g, "");
}

function toDateInputValue(value) {
  if (!value) return "";

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  return "";
}

function calcularEdadDesdeFecha(fechaNacimiento) {
  if (!fechaNacimiento) return "";

  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad >= 0 ? String(edad) : "";
}

function formatearFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString("es-AR") : "-";
}

function formatearEstado(estado) {
  switch (estado) {
    case "EN_ESPERA":
      return "En espera";
    case "EN_ATENCION":
      return "En atención";
    case "FINALIZADO":
      return "Finalizado";
    case "ALTA":
      return "Alta";
    default:
      return estado || "-";
  }
}

function obtenerClaseEstado(estado) {
  switch (estado) {
    case "EN_ESPERA":
      return "sis-status sis-status-espera";
    case "EN_ATENCION":
      return "sis-status sis-status-atencion";
    case "FINALIZADO":
      return "sis-status sis-status-finalizado";
    case "ALTA":
      return "sis-status sis-status-alta";
    default:
      return "sis-status sis-status-default";
  }
}

export default function BusquedaPacienteMedica() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [paciente, setPaciente] = useState(null);
  const [episodios, setEpisodios] = useState([]);

  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingEpisodios, setLoadingEpisodios] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.restaurarBusqueda) {
      const pacienteRestaurado = location.state.pacienteBuscado || initialForm;
      const episodiosRestaurados = location.state.episodiosPaciente || [];

      setForm(pacienteRestaurado);
      setPaciente(
        pacienteRestaurado?.dni
          ? {
              dni: pacienteRestaurado.dni,
              nombre: pacienteRestaurado.nombre,
              apellido: pacienteRestaurado.apellido,
              fechaNacimiento: pacienteRestaurado.fechaNacimiento,
              edad: pacienteRestaurado.edad,
              sexo: pacienteRestaurado.sexo,
              estadoPersona: pacienteRestaurado.estadoPersona,
              nroHistoriaClinica: pacienteRestaurado.nroHistoriaClinica,
            }
          : null
      );
      setEpisodios(episodiosRestaurados);

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const [accordionOpen, setAccordionOpen] = useState({
    dni: false,
    rostro: false,
    huella: false,
    datos: false,
  });

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const showDialog = (title, message, type = "info") => {
    setDialog({ open: true, title, message, type });
  };

  const cerrarDialogo = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const resetFormulario = () => {
    setForm(initialForm);
    setPaciente(null);
    setEpisodios([]);
  };

  const cargarPaciente = async (p, origen = "DNI") => {
    const fechaFormateada = toDateInputValue(p.fechaNacimiento);
    const edadCalculada = calcularEdadDesdeFecha(fechaFormateada);

    setPaciente(p);

    setForm({
      dni: p.dni || "",
      nombre: p.nombre || "",
      apellido: p.apellido || "",
      fechaNacimiento: fechaFormateada,
      edad: edadCalculada,
      sexo: p.sexo || "",
      estadoPersona: p.estadoPersona || "",
      nroHistoriaClinica: p.nroHistoriaClinica || "",
    });

    try {
      setLoadingEpisodios(true);
      const lista = await obtenerEpisodiosPorPacienteDni(p.dni);
      setEpisodios(Array.isArray(lista) ? lista : []);
    } catch (err) {
      setEpisodios([]);
      showDialog(
        "Paciente encontrado",
        `Paciente encontrado por ${origen}, pero no se pudieron cargar sus episodios.`,
        "warning"
      );
      return;
    } finally {
      setLoadingEpisodios(false);
    }

    showDialog(
      "Paciente encontrado",
      `Paciente encontrado por ${origen}.`,
      "success"
    );
  };

  const buscarPaciente = async () => {
    const dni = limpiarDni(form.dni);

    if (!dni) {
      showDialog("Error", "DNI inválido.", "error");
      return;
    }

    try {
      setLoadingBuscar(true);
      setPaciente(null);
      setEpisodios([]);

      const data = await obtenerPacientePorDni(dni);
      await cargarPaciente(data, "DNI");
    } catch (err) {
      showDialog(
        "Paciente no encontrado",
        "No existe paciente con ese DNI.",
        "warning"
      );
    } finally {
      setLoadingBuscar(false);
    }
  };

  const abrirDetalleEpisodio = (episodioId) => {
    navigate(`/medico/episodios/${episodioId}`, {
      state: {
        soloLectura: true,
        volverAListaPaciente: true,
        pacienteBuscado: form,
        episodiosPaciente: episodios,
      },
    });
  };

  const disabledGeneral = loadingBuscar || loadingEpisodios;

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Búsqueda de pacientes</h2>
            <p className="sis-page-subtitle">
              Consulta de datos del paciente y acceso a sus episodios clínicos.
            </p>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate("/medico")}
            >
              Volver
            </button>
          </div>
        </div>

        <div className="sis-detail-layout">
          <section className="sis-card sis-section-card">
            <div className="sis-section-header">
              <h3 className="sis-section-title">Buscar paciente</h3>
            </div>

            <div className="sis-card-body">
              <div className="sis-accordion-item" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className="sis-btn sis-btn-outline"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  onClick={() => toggleAccordion("dni")}
                >
                  <span>Búsqueda por DNI</span>
                  <span>{accordionOpen.dni ? "▲" : "▼"}</span>
                </button>

                {accordionOpen.dni && (
                  <div style={{ marginTop: 12 }}>
                    <div className="sis-form-grid">
                      <div className="sis-form-group">
                        <label className="sis-form-label">DNI</label>
                        <input
                          className="sis-form-control"
                          name="dni"
                          value={form.dni}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, dni: e.target.value }))
                          }
                          placeholder="Ingresá el DNI..."
                          disabled={disabledGeneral}
                        />
                      </div>
                    </div>

                    <div className="sis-page-actions" style={{ marginTop: 16 }}>
                      <button
                        className="sis-btn sis-btn-primary"
                        onClick={buscarPaciente}
                        disabled={disabledGeneral}
                      >
                        {loadingBuscar ? "Buscando..." : "Buscar paciente"}
                      </button>

                      <button
                        className="sis-btn sis-btn-outline"
                        onClick={resetFormulario}
                        disabled={disabledGeneral}
                      >
                        Limpiar campos
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="sis-accordion-item" style={{ marginBottom: 16 }}>
                <button
                  type="button"
                  className="sis-btn sis-btn-outline"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  onClick={() => toggleAccordion("rostro")}
                >
                  <span>Búsqueda por rostro</span>
                  <span>{accordionOpen.rostro ? "▲" : "▼"}</span>
                </button>

                {accordionOpen.rostro && (
                  <div style={{ marginTop: 12 }}>
                    <BusquedaPacientePorRostro
                      disabled={disabledGeneral}
                      onPacienteEncontrado={(p) => cargarPaciente(p, "rostro")}
                    />
                  </div>
                )}
              </div>

              <div className="sis-accordion-item">
                <button
                  type="button"
                  className="sis-btn sis-btn-outline"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  onClick={() => toggleAccordion("huella")}
                >
                  <span>Búsqueda por huella</span>
                  <span>{accordionOpen.huella ? "▲" : "▼"}</span>
                </button>

                {accordionOpen.huella && (
                  <div style={{ marginTop: 12 }}>
                    <BusquedaPacientePorHuellaMock
                      disabled={disabledGeneral}
                      onPacienteEncontrado={(p) => cargarPaciente(p, "huella")}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="sis-card sis-section-card">
            <div className="sis-section-header">
              <h3 className="sis-section-title">Datos del paciente</h3>
            </div>

            <div className="sis-card-body">
              <div className="sis-accordion-item">
                <button
                  type="button"
                  className="sis-btn sis-btn-outline"
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                  onClick={() => toggleAccordion("datos")}
                >
                  <span>Datos del paciente</span>
                  <span>{accordionOpen.datos ? "▲" : "▼"}</span>
                </button>

                {accordionOpen.datos && (
                  <div style={{ marginTop: 12 }}>
                    <div className="sis-form-grid">
                      <div className="sis-form-group">
                        <label className="sis-form-label">DNI</label>
                        <input className="sis-form-control" value={form.dni} disabled />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">Nombre</label>
                        <input className="sis-form-control" value={form.nombre} disabled />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">Apellido</label>
                        <input className="sis-form-control" value={form.apellido} disabled />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">Fecha de nacimiento</label>
                        <input
                          type="date"
                          className="sis-form-control"
                          value={form.fechaNacimiento}
                          disabled
                        />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">Edad</label>
                        <input className="sis-form-control" value={form.edad} disabled />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">Sexo</label>
                        <input className="sis-form-control" value={form.sexo} disabled />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">Estado de la persona</label>
                        <input
                          className="sis-form-control"
                          value={form.estadoPersona}
                          disabled
                        />
                      </div>

                      <div className="sis-form-group">
                        <label className="sis-form-label">N° Historia clínica</label>
                        <input
                          className="sis-form-control"
                          value={form.nroHistoriaClinica}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="sis-card sis-section-card">
            <div className="sis-section-header">
              <h3 className="sis-section-title">Episodios del paciente</h3>
            </div>

            <div className="sis-card-body">
              {loadingEpisodios && (
                <div className="sis-loading-state">Cargando episodios...</div>
              )}

              {!loadingEpisodios && !paciente && (
                <p className="sis-text-muted mb-0">
                  Buscá un paciente para visualizar sus episodios.
                </p>
              )}

              {!loadingEpisodios && paciente && episodios.length === 0 && (
                <p className="sis-text-muted mb-0">
                  El paciente no posee episodios registrados.
                </p>
              )}

              {!loadingEpisodios && episodios.length > 0 && (
                <div className="sis-table-wrap">
                  <table className="sis-table">
                    <thead>
                      <tr>
                        <th>ID episodio</th>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Fecha ingreso</th>
                        <th>Cama</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {episodios.map((ep) => (
                        <tr key={ep.episodioId}>
                          <td>{ep.episodioId}</td>
                          <td>{ep.tipoServicio || "-"}</td>
                          <td>
                            <span className={obtenerClaseEstado(ep.estadoAtencion)}>
                              {formatearEstado(ep.estadoAtencion)}
                            </span>
                          </td>
                          <td>{formatearFecha(ep.fechaIngreso)}</td>
                          <td>{ep.camaCodigo || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="sis-btn sis-btn-primary sis-btn-sm"
                              onClick={() => abrirDetalleEpisodio(ep.episodioId)}
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

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
