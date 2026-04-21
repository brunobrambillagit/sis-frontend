import { useState } from "react";
import {
  capturarHuellaLocal,
  buscarPacientePorHuella,
} from "../api/huellaApi";
import AlertDialog from "./AlertDialog";

function parseBackendMessage(err) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || data?.mensaje || "";
}

export default function BusquedaPacientePorHuella({
  onPacienteEncontrado,
  onPacienteNoEncontrado,
  disabled = false,
  showOwnDialogs = true,
  buttonText = "Buscar por huella",
}) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const abrirAlert = (title, message, type = "info") => {
    if (!showOwnDialogs) return;
    setAlert({
      open: true,
      title,
      message,
      type,
    });
  };

  const cerrarAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const handleBuscar = async () => {
    if (disabled) return;

    try {
      setLoading(true);

      const captura = await capturarHuellaLocal();

      const paciente = await buscarPacientePorHuella({
        rawImageBase64: captura.rawImageBase64,
        width: captura.width,
        height: captura.height,
        dpi: captura.dpi,
      });

      abrirAlert(
        "Paciente encontrado",
        `Paciente: ${paciente.apellido}, ${paciente.nombre}`,
        "success"
      );

      onPacienteEncontrado?.(paciente);
    } catch (err) {
      const msg =
        parseBackendMessage(err) ||
        err?.message ||
        "No se encontró paciente con esa huella.";

      abrirAlert("Resultado de búsqueda", msg, "warning");
      onPacienteNoEncontrado?.(msg, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        className="sis-btn sis-btn-primary"
        onClick={handleBuscar}
        disabled={disabled || loading}
      >
        {loading ? "Capturando..." : buttonText}
      </button>

      <AlertDialog
        open={alert.open}
        title={alert.title}
        message={alert.message}
        onClose={cerrarAlert}
        type={alert.type}
      />
    </div>
  );
}