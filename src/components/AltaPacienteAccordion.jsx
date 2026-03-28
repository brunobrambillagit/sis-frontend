export default function AltaPacienteAccordion({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <section className="sis-card sis-section-card sis-accordion-card">
      <button
        type="button"
        className="sis-accordion-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="sis-accordion-header-main">
          <h3 className="sis-section-title">{title}</h3>
          {subtitle ? <p className="sis-accordion-subtitle">{subtitle}</p> : null}
        </div>

        <span className={`sis-accordion-chevron ${isOpen ? "open" : ""}`}>
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className={`sis-accordion-content ${isOpen ? "open" : ""}`}>
          <div className="sis-card-body">{children}</div>
        </div>
      )}
    </section>
  );
}
