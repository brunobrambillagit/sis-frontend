import { useState } from "react";
import {
  obtenerPacientePorDni,
  actualizarPacientePorDni,
} from "../../../api/pacientesApi";

import BusquedaPacientePorRostro from "../../../components/BusquedaPacientePorRostro";
import BusquedaPacientePorHuellaMock from "../../../components/BusquedaPacientePorHuellaMock";

import AlertDialog from "../../../components/AlertDialog";
import ConfirmDialog from "../../../components/ConfirmDialog";
import Header from "../../../components/Header";

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

export default function BusquedaPacienteAdministrativa() {
  const [form, setForm] = useState(initialForm);
  const [paciente, setPaciente] = useState(null);

  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [accordionOpen, setAccordionOpen] = useState({
    dni: false,
    rostro: false,
    huella: false,
  });

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const resetFormulario = () => {
    setForm(initialForm);
    setPaciente(null);
    setConfirmOpen(false);
  };

  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const showDialog = (title, message, type = "info") => {
    setDialog({ open: true, title, message, type });
  };

  const cerrarDialogo = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const limpiarDni = (value) => (value || "").replace(/\D/g, "");

  const cargarPaciente = (p, origen = "DNI") => {
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

    showDialog(
      "Paciente encontrado",
      `Paciente encontrado por ${origen}`,
      "success"
    );
  };

  const buscarPaciente = async () => {
    const dni = limpiarDni(form.dni);

    if (!dni) {
      showDialog("Error", "DNI inválido", "error");
      return;
    }

    try {
      setLoadingBuscar(true);
      const data = await obtenerPacientePorDni(dni);
      cargarPaciente(data);
    } catch (err) {
      showDialog(
        "Paciente no encontrado",
        "No existe paciente con ese DNI",
        "warning"
      );
    } finally {
      setLoadingBuscar(false);
    }
  };

  const guardar = async () => {
    try {
      setLoadingGuardar(true);

      await actualizarPacientePorDni(form.dni, {
        nombre: form.nombre,
        apellido: form.apellido,
        fechaNacimiento: form.fechaNacimiento || null,
        edad: form.edad === "" ? null : Number(form.edad),
        sexo: form.sexo || null,
        estadoPersona: form.estadoPersona || null,
      });

      showDialog("Éxito", "Paciente actualizado correctamente", "success");

      resetFormulario();
    } catch (err) {
      showDialog("Error", "No se pudo actualizar el paciente", "error");
    } finally {
      setLoadingGuardar(false);
      setConfirmOpen(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "fechaNacimiento") {
      const edadCalculada = calcularEdadDesdeFecha(value);
      setForm((prev) => ({
        ...prev,
        fechaNacimiento: value,
        edad: edadCalculada,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Header />

      <div className="sis-detail-layout">
        <section className="sis-card sis-section-card">
          <div className="sis-section-header">
            <h3 className="sis-page-title">Buscar paciente</h3>
          </div>

          <div className="sis-card-body">
            {/* ACORDEÓN DNI */}
            <div className="sis-accordion-item" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className="sis-btn sis-btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  display: "flex",
                  alignItems: "center",
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
                        onChange={onChange}
                        placeholder="DNI..."
                      />
                    </div>
                  </div>

                  <div className="sis-page-actions" style={{ marginTop: 10 }}>
                    <button
                      className="sis-btn sis-btn-primary"
                      onClick={buscarPaciente}
                    >
                      {loadingBuscar ? "Buscando..." : "Buscar"}
                    </button>

                    <button
                      className="sis-btn sis-btn-outline"
                      onClick={resetFormulario}
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACORDEÓN ROSTRO */}
            <div className="sis-accordion-item" style={{ marginBottom: 16 }}>
              <button
                type="button"
                className="sis-btn sis-btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => toggleAccordion("rostro")}
              >
                <span>Búsqueda por rostro</span>
                <span>{accordionOpen.rostro ? "▲" : "▼"}</span>
              </button>

              {accordionOpen.rostro && (
                <div style={{ marginTop: 12 }}>
                  <BusquedaPacientePorRostro
                    onPacienteEncontrado={(p) => cargarPaciente(p, "rostro")}
                  />
                </div>
              )}
            </div>

            {/* ACORDEÓN HUELLA */}
            <div className="sis-accordion-item">
              <button
                type="button"
                className="sis-btn sis-btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "space-between",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => toggleAccordion("huella")}
              >
                <span>Búsqueda por huella</span>
                <span>{accordionOpen.huella ? "▲" : "▼"}</span>
              </button>

              {accordionOpen.huella && (
                <div style={{ marginTop: 12 }}>
                  <BusquedaPacientePorHuellaMock
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
            <div className="sis-form-grid">
              <div className="sis-form-group">
                <label className="sis-form-label">DNI</label>
                <input
                  className="sis-form-control"
                  name="dni"
                  value={form.dni}
                  disabled
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Nombre</label>
                <input
                  className="sis-form-control"
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  disabled={!paciente}
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Apellido</label>
                <input
                  className="sis-form-control"
                  name="apellido"
                  value={form.apellido}
                  onChange={onChange}
                  disabled={!paciente}
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Fecha de nacimiento</label>
                <input
                  type="date"
                  className="sis-form-control"
                  name="fechaNacimiento"
                  value={form.fechaNacimiento}
                  onChange={onChange}
                  disabled={!paciente}
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Edad</label>
                <input
                  className="sis-form-control"
                  name="edad"
                  value={form.edad}
                  disabled
                />
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Sexo</label>
                <select
                  className="sis-form-control"
                  name="sexo"
                  value={form.sexo}
                  onChange={onChange}
                  disabled={!paciente}
                >
                  <option value="">Seleccionar</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                </select>
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">Estado de la persona</label>
                <select
                  className="sis-form-control"
                  name="estadoPersona"
                  value={form.estadoPersona}
                  onChange={onChange}
                  disabled={!paciente}
                >
                  <option value="">Seleccionar</option>
                  <option value="VIVO">Vivo</option>
                  <option value="FALLECIDO">Fallecido</option>
                </select>
              </div>

              <div className="sis-form-group">
                <label className="sis-form-label">N° Historia clínica</label>
                <input
                  className="sis-form-control"
                  name="nroHistoriaClinica"
                  value={form.nroHistoriaClinica}
                  disabled
                />
              </div>
            </div>

            <div className="sis-page-actions" style={{ marginTop: 20 }}>
              <button
                className="sis-btn sis-btn-primary"
                onClick={() => setConfirmOpen(true)}
                disabled={!paciente}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar actualización"
        message="¿Seguro que querés actualizar los datos del paciente?"
        onConfirm={guardar}
        onCancel={() => setConfirmOpen(false)}
        loading={loadingGuardar}
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