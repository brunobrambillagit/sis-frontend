import { useState } from "react";
import BiometriaRostroModal from "./BiometriaRostroModal";

function EstadoBiometrico({ estado }) {
  const className =
    estado === "registrada" || estado === "cargado" || estado === "capturada"
      ? "sis-badge sis-badge-success"
      : estado === "error"
      ? "sis-badge sis-badge-danger"
      : "sis-badge sis-badge-pending";

  const texto =
    estado === "registrada"
      ? "Registrada"
      : estado === "capturada"
      ? "Capturada"
      : estado === "cargado"
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
  dedoSeleccionado,
  onDedoSeleccionadoChange,
  huellaCapturada,
  onCapturarHuella,
  loadingCapturarHuella = false,
}) {
  const [openCameraModal, setOpenCameraModal] = useState(false);

  const esRostro = tipo === "rostro";
  const esHuella = tipo === "huella";

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

        {esRostro && (
          <>
            <div className="sis-form-group">
              <label className="sis-form-label">Archivo de rostro</label>

              <input
                className="sis-form-control"
                type="file"
                accept="image/*"
                disabled={disabled}
                onChange={(e) =>
                  onArchivoChange(tipo, e.target.files?.[0] || null)
                }
              />
            </div>

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

            {data.vistaPrevia && (
              <div className="sis-biometria-preview-wrap">
                <img
                  src={data.vistaPrevia}
                  alt="Vista previa de rostro"
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
          </>
        )}

        {esHuella && (
          <>
            <div className="sis-form-group">
              <label className="sis-form-label">Dedo</label>
              <select
                className="sis-form-control"
                value={dedoSeleccionado}
                onChange={(e) => onDedoSeleccionadoChange?.(e.target.value)}
                disabled={disabled}
              >
                <option value="">Seleccionar dedo...</option>
                <option value="PULGAR_DERECHO">Pulgar derecho</option>
                <option value="PULGAR_IZQUIERDO">Pulgar izquierdo</option>
              </select>
            </div>

            <div className="sis-page-actions">
              <button
                type="button"
                className="sis-btn sis-btn-primary sis-btn-sm"
                disabled={disabled || loadingCapturarHuella}
                onClick={onCapturarHuella}
              >
                {loadingCapturarHuella ? "Capturando..." : "Capturar huella"}
              </button>

              <button
                type="button"
                className="sis-btn sis-btn-outline sis-btn-sm"
                disabled={disabled}
                onClick={() => onLimpiar(tipo)}
              >
                Limpiar
              </button>
            </div>

            <div className="sis-form-group">
              <label className="sis-form-label">Observación</label>
              <textarea
                className="sis-form-control sis-textarea"
                value={data.observacion}
                disabled
                placeholder="La observación se completa automáticamente según el resultado de la captura."
                onChange={() => {}}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              {huellaCapturada ? (
                <div className="sis-alert sis-alert-success" role="alert">
                  <div>Huella capturada correctamente.</div>

                  <div className="mt-2">
                    <strong>Dedo:</strong> {dedoSeleccionado || "-"}
                  </div>

                  <div className="mt-2">
                    <strong>Calidad:</strong> {huellaCapturada?.quality || "-"}
                  </div>

                  <div className="mt-2">
                    <strong>Resolución:</strong> {huellaCapturada?.width} x{" "}
                    {huellaCapturada?.height} - {huellaCapturada?.dpi} DPI
                  </div>
                </div>
              ) : (
                <div className="sis-alert sis-alert-warning" role="alert">
                  Todavía no se capturó ninguna huella.
                </div>
              )}
            </div>
          </>
        )}
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
  dedoSeleccionado,
  onDedoSeleccionadoChange,
  huellaCapturada,
  onCapturarHuella,
  loadingCapturarHuella = false,
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
        descripcion="Seleccioná el dedo y capturá la huella directamente desde el lector local."
        data={biometria.huella}
        disabled={disabled}
        onArchivoChange={onArchivoChange}
        onObservacionChange={onObservacionChange}
        onLimpiar={onLimpiar}
        dedoSeleccionado={dedoSeleccionado}
        onDedoSeleccionadoChange={onDedoSeleccionadoChange}
        huellaCapturada={huellaCapturada}
        onCapturarHuella={onCapturarHuella}
        loadingCapturarHuella={loadingCapturarHuella}
      />
    </div>
  );
}
