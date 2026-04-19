import { useState } from "react";
import { buscarPacientePorRostro } from "../api/reconocimientoApi";
import BiometriaRostroModal from "./BiometriaRostroModal";
import AlertDialog from "./AlertDialog";

function parseBackendMessage(err) {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || data?.mensaje || "";
}

export default function BusquedaPacientePorRostro({
  onPacienteEncontrado,
  onPacienteNoEncontrado,
  disabled = false,
  titulo = "Búsqueda por rostro",
  descripcion = "Podés seleccionar una imagen o tomar una foto para buscar al paciente.",
  embedded = false,
  showOwnDialogs = true,
}) {
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [openCameraModal, setOpenCameraModal] = useState(false);

  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "info",
  });

  const showDialog = (title, message, type = "info") => {
    if (!showOwnDialogs) return;
    setDialog({ open: true, title, message, type });
  };

  const cargarArchivo = (file) => {
    if (!file) {
      setArchivo(null);
      setVistaPrevia("");
      return;
    }

    setArchivo(file);
    setVistaPrevia(
      file.type?.startsWith("image/") ? URL.createObjectURL(file) : ""
    );
  };

  const limpiar = () => {
    setArchivo(null);
    setVistaPrevia("");
  };

  const buscar = async () => {
    if (!archivo) {
      const mensaje = "Primero debés seleccionar una imagen o tomar una foto.";

      showDialog("Error", mensaje, "error");
      onPacienteNoEncontrado?.(mensaje, { validation: true });

      return;
    }

    try {
      setBuscando(true);

      const paciente = await buscarPacientePorRostro(archivo);

      showDialog(
        "Paciente encontrado",
        `Paciente encontrado por rostro: ${paciente.apellido || "-"} ${paciente.nombre || "-"}`,
        "success"
      );

      onPacienteEncontrado?.(paciente);
    } catch (err) {
      const mensaje =
        parseBackendMessage(err) ||
        "No se pudo buscar el paciente por rostro.";

      showDialog("Resultado de búsqueda", mensaje, "warning");
      onPacienteNoEncontrado?.(mensaje, err);
    } finally {
      setBuscando(false);
    }
  };

  const contenido = (
    <>
      {!embedded && (
        <p
          className="sis-text-muted"
          style={{ marginTop: 0, marginBottom: 16 }}
        >
          {descripcion}
        </p>
      )}

      {embedded && descripcion && (
        <p
          className="sis-text-muted"
          style={{ marginTop: 0, marginBottom: 16 }}
        >
          {descripcion}
        </p>
      )}

      <div className="sis-form-group">
        <label className="sis-form-label">Imagen del rostro</label>
        <input
          className="sis-form-control"
          type="file"
          accept="image/*"
          disabled={disabled || buscando}
          onChange={(e) => cargarArchivo(e.target.files?.[0] || null)}
        />
      </div>

      <div className="sis-page-actions" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="sis-btn sis-btn-primary sis-btn-sm"
          disabled={disabled || buscando}
          onClick={() => setOpenCameraModal(true)}
        >
          Tomar foto
        </button>

        <button
          type="button"
          className="sis-btn sis-btn-outline sis-btn-sm"
          disabled={disabled || buscando}
          onClick={limpiar}
        >
          Limpiar
        </button>
      </div>

      {vistaPrevia && (
        <div
          className="sis-biometria-preview-wrap"
          style={{ marginTop: 16 }}
        >
          <img
            src={vistaPrevia}
            alt="Vista previa del rostro"
            className="sis-biometria-preview"
          />
        </div>
      )}

      <div className="sis-page-actions" style={{ marginTop: 16 }}>
        <button
          type="button"
          className="sis-btn sis-btn-primary"
          disabled={disabled || buscando || !archivo}
          onClick={buscar}
        >
          {buscando ? "Buscando..." : "Buscar por rostro"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {embedded ? (
        <div>{contenido}</div>
      ) : (
        <section
          className="sis-card sis-section-card"
          style={{ marginTop: "16px" }}
        >
          <div className="sis-section-header">
            <div>
              <h3 className="sis-section-title">{titulo}</h3>
            </div>
          </div>

          <div className="sis-card-body">{contenido}</div>
        </section>
      )}

      <BiometriaRostroModal
        open={openCameraModal}
        onClose={() => setOpenCameraModal(false)}
        onConfirm={(file) => {
          cargarArchivo(file);
          setOpenCameraModal(false);
        }}
      />

      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={() =>
          setDialog((prev) => ({ ...prev, open: false }))
        }
      />
    </>
  );
}