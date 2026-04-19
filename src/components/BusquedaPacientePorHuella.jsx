import { useState } from "react";
import {
  capturarHuellaLocal,
  buscarPacientePorHuella,
} from "../api/huellaApi";
import AlertDialog from "./AlertDialog";

export default function BusquedaPacientePorHuella({
  onPacienteEncontrado,
  disabled = false,
  showOwnDialogs = true,
}) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const abrirAlert = (data) => {
    if (!showOwnDialogs) return;
    setAlert({ open: true, ...data });
  };

  const cerrarAlert = () => setAlert((prev) => ({ ...prev, open: false }));

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

      abrirAlert({
        title: "Paciente encontrado",
        message: `Paciente: ${paciente.apellido}, ${paciente.nombre}`,
        type: "success",
      });

      onPacienteEncontrado?.(paciente);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "No se encontró paciente con esa huella.";

      abrirAlert({
        title: "Resultado de búsqueda",
        message: msg,
        type: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        type="button"
        className="sis-btn sis-btn-outline"
        onClick={handleBuscar}
        disabled={disabled || loading}
      >
        {loading ? "Capturando..." : "Buscar por huella"}
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