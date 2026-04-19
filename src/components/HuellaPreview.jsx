import { useEffect, useRef } from "react";

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export default function HuellaPreview({
  base64,
  width,
  height,
  canvasWidth = 72,
  canvasHeight = 72,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !base64 || !width || !height) return;

    const ctx = canvas.getContext("2d");
    const raw = base64ToBytes(base64);

    if (raw.length !== width * height) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const imageData = ctx.createImageData(width, height);

    for (let i = 0; i < raw.length; i += 1) {
      const value = raw[i];
      const pixelIndex = i * 4;

      imageData.data[pixelIndex] = value;
      imageData.data[pixelIndex + 1] = value;
      imageData.data[pixelIndex + 2] = value;
      imageData.data[pixelIndex + 3] = 255;
    }

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;

    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.putImageData(imageData, 0, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
  }, [base64, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        border: "1px solid #d1d5db",
        borderRadius: 8,
        background: "#fff",
        objectFit: "contain",
      }}
    />
  );
}