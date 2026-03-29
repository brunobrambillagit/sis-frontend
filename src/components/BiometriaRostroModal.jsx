import { useEffect, useRef, useState } from "react";

export default function BiometriaRostroModal({
  open,
  onClose,
  onConfirm,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [capturaUrl, setCapturaUrl] = useState("");
  const [capturando, setCapturando] = useState(false);

  useEffect(() => {
    if (!open) {
      detenerCamara();
      setCapturaUrl("");
      setErrorMsg("");
      return;
    }

    iniciarCamara();

    return () => {
      detenerCamara();
    };
  }, [open]);

  const iniciarCamara = async () => {
    setErrorMsg("");
    setCapturando(true);

    try {
      if (streamRef.current) {
        reanudarPreview();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      reanudarPreview();
    } catch (error) {
      setErrorMsg(
        "No se pudo acceder a la cámara. Verificá permisos del navegador o dispositivo."
      );
    } finally {
      setCapturando(false);
    }
  };

  const reanudarPreview = async () => {
    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    try {
      await video.play();
    } catch (error) {
      // Algunos navegadores pueden rechazar play() momentáneamente.
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const tomarFoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCapturaUrl(dataUrl);
  };

  const volverATomar = () => {
    setCapturaUrl("");

    requestAnimationFrame(() => {
      reanudarPreview();
    });
  };

  const confirmarFoto = async () => {
    if (!capturaUrl) return;

    const blob = await (await fetch(capturaUrl)).blob();
    const file = new File(
      [blob],
      `rostro-${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    onConfirm(file);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="sis-modal-backdrop" role="dialog" aria-modal="true">
      <div className="sis-modal-card sis-modal-card-lg">
        <div className="sis-modal-header">
          <div>
            <h3 className="sis-page-title2">Captura de rostro</h3>
            <p className="sis-page-subtitle">
              Tomá la foto y confirmá si querés usarla para el registro biométrico.
            </p>
          </div>

          <button
            type="button"
            className="sis-btn sis-btn-outline sis-btn-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <div className="sis-modal-body">
          {errorMsg && (
            <div className="sis-alert sis-alert-danger" role="alert">
              {errorMsg}
            </div>
          )}

          {!capturaUrl ? (
            <div className="sis-camera-layout">
              <div className="sis-camera-preview-wrap">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="sis-camera-preview"
                />
              </div>

              <div className="sis-page-actions">
                <button
                  type="button"
                  className="sis-btn sis-btn-primary"
                  onClick={tomarFoto}
                  disabled={capturando || !!errorMsg}
                >
                  Tomar foto
                </button>
              </div>
            </div>
          ) : (
            <div className="sis-camera-layout">
              <div className="sis-camera-preview-wrap">
                <img
                  src={capturaUrl}
                  alt="Captura tomada"
                  className="sis-camera-preview"
                />
              </div>

              <div className="sis-page-actions">
                <button
                  type="button"
                  className="sis-btn sis-btn-outline"
                  onClick={volverATomar}
                >
                  Sacar otra foto
                </button>

                <button
                  type="button"
                  className="sis-btn sis-btn-success"
                  onClick={confirmarFoto}
                >
                  Usar esta foto
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}
