import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  crearPaciente,
  actualizarPacientePorDni,
} from "../../api/pacientesApi";
import AltaPacienteAccordion from "../../components/AltaPacienteAccordion";
import BloqueDatosPaciente from "../../components/BloqueDatosPaciente";
import BloqueBiometriaPaciente from "../../components/BloqueBiometriaPaciente";
import BloqueResumenAltaPaciente from "../../components/BloqueResumenAltaPaciente";
import AlertDialog from "../../components/AlertDialog";
import { registrarRostroPaciente } from "../../api/reconocimientoApi";
import BuscadorPacienteUniversal from "../../components/BuscadorPacienteUniversal";

const initialForm = {
  dni: "",
  nombre: "",
  apellido: "",
  fechaNacimiento: "",
  edad: "",
  sexo: "",
  estadoPersona: "VIVO",
};

const initialBiometria = {
  rostro: {
    estado: "pendiente",
    archivo: null,
    vistaPrevia: "",
    observacion: "",
    respuestaBackend: null,
  },
  huella: {
    estado: "pendiente",
    archivo: null,
    vistaPrevia: "",
    observacion: "",
  },
};

const initialAlertDialog = {
  open: false,
  title: "Aviso",
  message: "",
  type: "info",
  buttonText: "Aceptar",
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

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function formatearFechaInput(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function obtenerFechaMinNacimiento() {
  const hoy = new Date();
  const fechaMin = new Date(hoy);
  fechaMin.setFullYear(hoy.getFullYear() - 120);
  return formatearFechaInput(fechaMin);
}

function obtenerFechaMaxNacimiento() {
  return formatearFechaInput(new Date());
}

function parseBackendMessage(err) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || data?.mensaje || "";
}

export default function AltaPaciente({
  titulo = "Crear paciente",
  subtitulo = "Verificá si el paciente existe, completá los datos y registrá biometría si está disponible.",
  textoExitoCreacion = "Paciente creado correctamente.",
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [biometria, setBiometria] = useState(initialBiometria);

  const [modo, setModo] = useState("idle");
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [pacienteCreado, setPacienteCreado] = useState(null);

  const [loadingBuscar, setLoadingBuscar] = useState(false);
  const [loadingCrear, setLoadingCrear] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [nroHistoriaClinica, setNroHistoriaClinica] = useState(null);

  const [alertDialog, setAlertDialog] = useState(initialAlertDialog);

  const [openSections, setOpenSections] = useState({
    verificacion: true,
    datos: false,
    biometria: false,
    resumen: false,
  });

  const disabledGeneral = useMemo(
    () => loadingBuscar || loadingCrear,
    [loadingBuscar, loadingCrear]
  );

  const pacienteMostrado = pacienteCreado || pacienteEncontrado;

  const openAlertDialog = ({
    title = "Aviso",
    message = "",
    type = "info",
    buttonText = "Aceptar",
  }) => {
    setAlertDialog({
      open: true,
      title,
      message,
      type,
      buttonText,
    });
  };

  const closeAlertDialog = () => {
    setAlertDialog(initialAlertDialog);
  };

  const resetAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setWarningMsg("");
  };

  const resetTodo = () => {
    setForm(initialForm);
    setBiometria(initialBiometria);
    setModo("idle");
    setPacienteEncontrado(null);
    setPacienteCreado(null);
    setNroHistoriaClinica(null);
    setOpenSections({
      verificacion: true,
      datos: false,
      biometria: false,
      resumen: false,
    });
    resetAlerts();
    closeAlertDialog();
  };

  const cargarPacienteEnFormulario = (paciente) => {
    setForm({
      dni: paciente?.dni || "",
      nombre: paciente?.nombre || "",
      apellido: paciente?.apellido || "",
      fechaNacimiento: toDateInputValue(paciente?.fechaNacimiento),
      edad: paciente?.edad ?? "",
      sexo: paciente?.sexo || "",
      estadoPersona: paciente?.estadoPersona || "VIVO",
    });
  };

  const cargarPacienteEncontrado = (paciente, origen = "DNI") => {
  setPacienteEncontrado(paciente);
  setPacienteCreado(null);
  setModo("encontrado");
  setNroHistoriaClinica(paciente?.nroHistoriaClinica || null);
  cargarPacienteEnFormulario(paciente);
  setSuccessMsg(`El paciente ya existe en el sistema. Fue encontrado por ${origen}.`);
  setErrorMsg("");
  setWarningMsg("");

  setOpenSections({
    verificacion: true,
    datos: true,
    biometria: false,
    resumen: false,
  });

  let mensaje = `El paciente fue encontrado correctamente por ${origen}.`;

  if (paciente?.nombre || paciente?.apellido) {
    mensaje += ` Paciente: ${paciente?.apellido || ""}${
      paciente?.apellido && paciente?.nombre ? ", " : ""
    }${paciente?.nombre || ""}.`;
  }

  if (paciente?.dni) {
    mensaje += ` DNI: ${paciente.dni}.`;
  }

  if (paciente?.nroHistoriaClinica) {
    mensaje += ` N° Historia Clínica: ${paciente.nroHistoriaClinica}.`;
  }

  openAlertDialog({
    title: "Paciente encontrado",
    message: mensaje,
    type: "success",
    buttonText: "Aceptar",
  });
  };

  const manejarPacienteNoEncontrado = (dniLimpio, err) => {
  setLoadingBuscar(false);
  setNroHistoriaClinica(null);
  setPacienteEncontrado(null);
  setPacienteCreado(null);

  if (err?.validation) {
    setErrorMsg(err.message || "DNI inválido.");
    openAlertDialog({
      title: "Búsqueda inválida",
      message: err.message || "El DNI ingresado no es válido.",
      type: "warning",
      buttonText: "Aceptar",
    });
    return;
  }

  const status = err?.response?.status;
  const msg = parseBackendMessage(err);

  if (status === 400 && msg.includes("No existe paciente con DNI")) {
    setModo("nuevo");
    setForm((prev) => ({ ...prev, dni: dniLimpio }));
    setSuccessMsg("No existe el paciente. Completá los datos para crearlo.");
    setErrorMsg("");
    setWarningMsg("");
    expandirFlujoAlta();

    openAlertDialog({
      title: "Paciente no encontrado",
      message: `No se encontró ningún paciente con el DNI ${dniLimpio}. Podés completar los datos para darlo de alta.`,
      type: "info",
      buttonText: "Aceptar",
    });
    return;
  }

  setErrorMsg(msg || "Error al buscar paciente.");
  openAlertDialog({
    title: "Error en la búsqueda",
    message: msg || "Ocurrió un error al buscar paciente.",
    type: "error",
    buttonText: "Aceptar",
  });
};

  const setSectionOpen = (sectionKey, nextValue) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: typeof nextValue === "boolean" ? nextValue : !prev[sectionKey],
    }));
  };

  const expandirFlujoAlta = () => {
    setOpenSections({
      verificacion: true,
      datos: true,
      biometria: true,
      resumen: true,
    });
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setForm((prev) => ({ ...prev, dni: value }));
      setModo("idle");
      setPacienteEncontrado(null);
      setPacienteCreado(null);
      setNroHistoriaClinica(null);
      resetAlerts();
      return;
    }

    if (name === "fechaNacimiento") {
      const edadCalculada = calcularEdadDesdeFecha(value);
      setForm((prev) => ({
        ...prev,
        fechaNacimiento: value,
        edad: edadCalculada,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDniBusquedaChange = (value) => {
    setForm((prev) => ({ ...prev, dni: value }));
    setModo("idle");
    setPacienteEncontrado(null);
    setPacienteCreado(null);
    setNroHistoriaClinica(null);
    resetAlerts();
  };

  const actualizarEstadoBiometria = (tipo, cambios) => {
    setBiometria((prev) => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        ...cambios,
      },
    }));
  };

  const manejarArchivoBiometrico = (tipo, file) => {
    if (!file) {
      actualizarEstadoBiometria(tipo, {
        archivo: null,
        vistaPrevia: "",
        estado: "pendiente",
        respuestaBackend: null,
      });
      return;
    }

    const vistaPrevia = file.type?.startsWith("image/")
      ? URL.createObjectURL(file)
      : "";

    actualizarEstadoBiometria(tipo, {
      archivo: file,
      vistaPrevia,
      estado: "cargado",
      observacion: "",
      respuestaBackend: null,
    });
  };

  const limpiarBiometria = (tipo) => {
    actualizarEstadoBiometria(tipo, {
      archivo: null,
      vistaPrevia: "",
      estado: "pendiente",
      observacion: "",
      respuestaBackend: null,
    });
  };

  const crearNuevoPaciente = async () => {
    resetAlerts();
    setNroHistoriaClinica(null);
    setPacienteCreado(null);

    if (modo !== "nuevo") {
      setErrorMsg("Primero buscá por DNI. Si no existe, se habilita la creación.");
      return;
    }

    const dniLimpio = limpiarDni(form.dni);
    if (!dniLimpio) {
      setErrorMsg("DNI inválido.");
      return;
    }

    if (!form.nombre.trim() || !form.apellido.trim()) {
      setErrorMsg("Nombre y apellido son obligatorios.");
      return;
    }

    const edadNumero = form.edad === "" ? null : Number(form.edad);
    if (form.edad !== "" && Number.isNaN(edadNumero)) {
      setErrorMsg("La edad debe ser numérica.");
      return;
    }

    setLoadingCrear(true);

    try {
      const payloadCrear = {
        dni: dniLimpio,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
      };

      const creadoBase = await crearPaciente(payloadCrear);

      const payloadActualizacion = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        fechaNacimiento: form.fechaNacimiento || null,
        edad: form.edad === "" ? null : edadNumero,
        sexo: form.sexo || null,
        estadoPersona: form.estadoPersona || null,
      };

      let pacienteFinal = creadoBase;

      try {
        pacienteFinal = await actualizarPacientePorDni(
          dniLimpio,
          payloadActualizacion
        );
      } catch (errUpdate) {
        pacienteFinal = creadoBase;
        setWarningMsg(
          parseBackendMessage(errUpdate) ||
            "El paciente se creó correctamente, pero no se pudieron guardar todos los datos adicionales."
        );
      }

      const pacienteId = pacienteFinal?.id || creadoBase?.id;

      if (pacienteId && biometria.rostro.archivo) {
        try {
          const respuestaRostro = await registrarRostroPaciente(
            pacienteId,
            biometria.rostro.archivo
          );

          actualizarEstadoBiometria("rostro", {
            respuestaBackend: respuestaRostro,
          });
        } catch (errRostro) {
          setWarningMsg((prev) => {
            const base = prev ? `${prev} ` : "";
            return (
              base +
              (
                parseBackendMessage(errRostro) ||
                "El paciente se creó, pero no se pudo registrar el rostro."
              )
            );
          });
        }
      }

      setPacienteCreado(pacienteFinal);
      setModo("encontrado");
      setSuccessMsg(textoExitoCreacion);
      setNroHistoriaClinica(
        pacienteFinal?.nroHistoriaClinica || creadoBase?.nroHistoriaClinica || null
      );

      cargarPacienteEnFormulario({
        ...pacienteFinal,
        dni: pacienteFinal?.dni || dniLimpio,
      });

      setOpenSections({
        verificacion: true,
        datos: true,
        biometria: true,
        resumen: true,
      });

      let mensajeDialogo = textoExitoCreacion;

      if (pacienteFinal?.nroHistoriaClinica || creadoBase?.nroHistoriaClinica) {
        mensajeDialogo += ` N° Historia Clínica: ${
          pacienteFinal?.nroHistoriaClinica || creadoBase?.nroHistoriaClinica
        }.`;
      }

      if (biometria.rostro?.respuestaBackend?.referenciaBiometrica) {
        mensajeDialogo += ` Rostro registrado: ${biometria.rostro.respuestaBackend.referenciaBiometrica}.`;
      }

      openAlertDialog({
        title: "Paciente creado exitosamente",
        message: mensajeDialogo,
        type: "success",
        buttonText: "Aceptar",
      });
    } catch (err) {
      const status = err?.response?.status;
      const msg = parseBackendMessage(err);

      if (status === 400) {
        setErrorMsg(msg || "Datos inválidos.");
      } else if (status === 409) {
        setErrorMsg(msg || "Ya existe un paciente con ese DNI.");
      } else {
        setErrorMsg(msg || "Error inesperado al crear el paciente.");
      }
    } finally {
      setLoadingCrear(false);
    }
  };

  const puedeCrearPaciente =
    modo === "nuevo" &&
    !disabledGeneral &&
    limpiarDni(form.dni) &&
    form.nombre.trim() &&
    form.apellido.trim();

  return (
    <div className="sis-page">
      <div className="sis-page-header">
        <div className="sis-page-title-wrap">
          <h2 className="sis-page-title">{titulo}</h2>
          <p className="sis-page-subtitle">{subtitulo}</p>
        </div>

        <div className="sis-page-actions">
          <button
            className="sis-btn sis-btn-outline"
            onClick={() => navigate(-1)}
            type="button"
          >
            Volver
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="sis-alert sis-alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      {warningMsg && (
        <div className="sis-alert sis-alert-warning" role="alert">
          {warningMsg}
        </div>
      )}

      {successMsg && (
        <div className="sis-alert sis-alert-success" role="alert">
          <div>{successMsg}</div>

          {nroHistoriaClinica && (
            <div className="mt-2">
              <strong>N° Historia Clínica:</strong> {nroHistoriaClinica}
            </div>
          )}

          {biometria.rostro?.respuestaBackend?.referenciaBiometrica && (
            <div className="mt-2">
              <strong>Rostro registrado:</strong> {biometria.rostro.respuestaBackend.referenciaBiometrica}
            </div>
          )}
        </div>
      )}

      <div className="sis-detail-layout">
        <AltaPacienteAccordion
          title="1. Verificación de existencia"
          subtitle="Primero verificá si el paciente ya existe en el sistema."
          isOpen={openSections.verificacion}
          onToggle={() => setSectionOpen("verificacion")}
        >
          <BuscadorPacienteUniversal
            dniValue={form.dni}
            onDniChange={handleDniBusquedaChange}
            onPacienteEncontrado={cargarPacienteEncontrado}
            onPacienteNoEncontradoDni={manejarPacienteNoEncontrado}
            onReset={resetTodo}
            disabled={disabledGeneral}
          />
        </AltaPacienteAccordion>

        <AltaPacienteAccordion
          title="2. Datos del paciente"
          subtitle="Completá la información demográfica obligatoria para el alta."
          isOpen={openSections.datos}
          onToggle={() => setSectionOpen("datos")}
        >
          <BloqueDatosPaciente
            form={form}
            onChange={onChange}
            disabled={disabledGeneral || modo !== "nuevo"}
            modo={modo}
            minFechaNacimiento={obtenerFechaMinNacimiento()}
            maxFechaNacimiento={obtenerFechaMaxNacimiento()}
          />
        </AltaPacienteAccordion>

        <AltaPacienteAccordion
          title="3. Registro biométrico"
          subtitle="Podés adjuntar una imagen existente o tomar una foto desde la cámara para el rostro."
          isOpen={openSections.biometria}
          onToggle={() => setSectionOpen("biometria")}
        >
          <BloqueBiometriaPaciente
            biometria={biometria}
            disabled={disabledGeneral || modo !== "nuevo"}
            onArchivoChange={manejarArchivoBiometrico}
            onObservacionChange={actualizarEstadoBiometria}
            onLimpiar={limpiarBiometria}
          />
        </AltaPacienteAccordion>

        <AltaPacienteAccordion
          title="4. Confirmar alta"
          subtitle="Revisá el resumen final antes de crear el paciente."
          isOpen={openSections.resumen}
          onToggle={() => setSectionOpen("resumen")}
        >
          <BloqueResumenAltaPaciente
            form={form}
            biometria={biometria}
            modo={modo}
            loadingCrear={loadingCrear}
            puedeCrearPaciente={puedeCrearPaciente}
            onCrearPaciente={crearNuevoPaciente}
          />
        </AltaPacienteAccordion>
      </div>

      <AlertDialog
        open={alertDialog.open}
        title={alertDialog.title}
        message={alertDialog.message}
        onClose={closeAlertDialog}
        buttonText={alertDialog.buttonText}
        type={alertDialog.type}
      />
    </div>
  );
}