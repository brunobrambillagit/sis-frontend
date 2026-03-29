import { useState } from "react";
import BiometriaRostroModal from "./BiometriaRostroModal";

function EstadoBiometrico({ estado }) {
  const className =
    estado === "cargado"
      ? "sis-badge sis-badge-success"
      : estado === "error"
      ? "sis-badge sis-badge-danger"
      : "sis-badge sis-badge-pending";

  const texto =
    estado === "cargado"
      ? "Cargado"
      : estado === "error"
      ? "Error"
      : "Pendiente";

  return <span className={className}>{texto}</span>;
}

function CardBiometrica({
  tipo,
  titulo,
  descripcion,
  data,
  disabled,
  onArchivoChange,
  onObservacionChange,
  onLimpiar,
}) {
  const [openCameraModal, setOpenCameraModal] = useState(false);

  const esRostro = tipo === "rostro";

  return (
    <>
      <div className="sis-biometria-card">
        <div className="sis-biometria-card-head">
          <div>
            <h4 className="sis-biometria-title">{titulo}</h4>
            <p className="sis-biometria-description">{descripcion}</p>
          </div>

          <EstadoBiometrico estado={data.estado} />
        </div>

        <div className="sis-form-group">
          <label className="sis-form-label">
            {esRostro ? "Archivo de rostro" : "Archivo de huella"}
          </label>

          <input
            className="sis-form-control"
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={(e) => onArchivoChange(tipo, e.target.files?.[0] || null)}
          />
        </div>

        {esRostro && (
          <div className="sis-page-actions">
            <button
              type="button"
              className="sis-btn sis-btn-primary sis-btn-sm"
              disabled={disabled}
              onClick={() => setOpenCameraModal(true)}
            >
              Tomar foto
            </button>
          </div>
        )}

        {data.vistaPrevia && (
          <div className="sis-biometria-preview-wrap">
            <img
              src={data.vistaPrevia}
              alt={`Vista previa de ${tipo}`}
              className="sis-biometria-preview"
            />
          </div>
        )}

        <div className="sis-form-group">
          <label className="sis-form-label">Observación</label>
          <textarea
            className="sis-form-control sis-textarea"
            value={data.observacion}
            disabled={disabled}
            placeholder="Observación opcional para esta captura..."
            onChange={(e) =>
              onObservacionChange(tipo, { observacion: e.target.value })
            }
          />
        </div>

        <div className="sis-page-actions">
          <button
            type="button"
            className="sis-btn sis-btn-outline sis-btn-sm"
            disabled={disabled}
            onClick={() => onLimpiar(tipo)}
          >
            Limpiar
          </button>
        </div>
      </div>

      {esRostro && (
        <BiometriaRostroModal
          open={openCameraModal}
          onClose={() => setOpenCameraModal(false)}
          onConfirm={(file) => onArchivoChange(tipo, file)}
        />
      )}
    </>
  );
}

export default function BloqueBiometriaPaciente({
  biometria,
  disabled,
  onArchivoChange,
  onObservacionChange,
  onLimpiar,
}) {
  return (
    <div className="sis-biometria-grid">
      <CardBiometrica
        tipo="rostro"
        titulo="Registro de rostro"
        descripcion="Podés seleccionar una imagen existente o tomar una foto desde la cámara."
        data={biometria.rostro}
        disabled={disabled}
        onArchivoChange={onArchivoChange}
        onObservacionChange={onObservacionChange}
        onLimpiar={onLimpiar}
      />

      <CardBiometrica
        tipo="huella"
        titulo="Registro de huella dactilar"
        descripcion="En esta primera etapa se deja preparada la UI para integrar luego el lector o la carga de imagen."
        data={biometria.huella}
        disabled={disabled}
        onArchivoChange={onArchivoChange}
        onObservacionChange={onObservacionChange}
        onLimpiar={onLimpiar}
      />
    </div>
  );
}
