export default function AlertDialog({
  open,
  title = "Aviso",
  message = "",
  onClose,
  buttonText = "Aceptar",
  type = "info",
}) {
  if (!open) return null;

  const buttonClass =
    type === "success"
      ? "sis-btn sis-btn-success"
      : type === "error"
      ? "sis-btn sis-btn-danger"
      : type === "warning"
      ? "sis-btn sis-btn-warning"
      : "sis-btn sis-btn-primary";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
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
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div className="sis-card-body">
          <h3
            className="sis-page-title"
            style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}
          >
            {title}
          </h3>

          <p className="sis-text-muted" style={{ marginBottom: "1.25rem" }}>
            {message}
          </p>

          <div
            className="sis-page-actions"
            style={{ justifyContent: "flex-end", gap: "0.75rem" }}
          >
            <button
              type="button"
              className={buttonClass}
              onClick={onClose}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
