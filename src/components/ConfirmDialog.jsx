export default function ConfirmDialog({
  open,
  title = "Confirmar acción",
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  loading = false,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        className="sis-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
        }}
      >
        <div className="sis-card-body">
          <h3 className="sis-page-title" style={{ fontSize: "1.2rem" }}>
            {title}
          </h3>

          <p className="sis-text-muted" style={{ margin: "1rem 0" }}>
            {message}
          </p>

          <div
            className="sis-page-actions"
            style={{ justifyContent: "flex-end", gap: "0.75rem" }}
          >
            <button
              className="sis-btn sis-btn-outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              className="sis-btn sis-btn-primary"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}