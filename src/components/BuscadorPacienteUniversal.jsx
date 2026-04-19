import { useMemo, useState } from "react";
import { obtenerPacientePorDni } from "../api/pacientesApi";
import BusquedaPacientePorRostro from "./BusquedaPacientePorRostro";
import BusquedaPacientePorHuella from "./BusquedaPacientePorHuella";

function limpiarDni(value) {
  return (value || "").replace(/\D/g, "");
}

export default function BuscadorPacienteUniversal({
  dniValue,
  onDniChange,
  onPacienteEncontrado,
  onPacienteNoEncontradoDni,
  onReset,
  fetchPacientePorDni = obtenerPacientePorDni,
  disabled = false,
  permitirDni = true,
  permitirRostro = true,
  permitirHuella = true,
  mostrarBotonLimpiar = true,
  labels = {},
  defaultOpen = {
    dni: false,
    rostro: false,
    huella: false,
  },
  rostroProps = {},
  huellaProps = {},
}) {
  const [dniInterno, setDniInterno] = useState("");
  const [loadingBuscarDni, setLoadingBuscarDni] = useState(false);

  const [accordionOpen, setAccordionOpen] = useState({
    dni: Boolean(defaultOpen.dni),
    rostro: Boolean(defaultOpen.rostro),
    huella: Boolean(defaultOpen.huella),
  });

  const dni = typeof dniValue === "string" ? dniValue : dniInterno;
  const disabledGeneral = disabled || loadingBuscarDni;

  const textos = useMemo(
    () => ({
      dniTitulo: "Búsqueda por DNI",
      dniLabel: "DNI",
      dniPlaceholder: "Ingresá el DNI...",
      buscarDni: "Buscar paciente",
      buscandoDni: "Buscando...",
      limpiar: "Limpiar",
      rostroTitulo: "Búsqueda por rostro",
      huellaTitulo: "Búsqueda por huella",
      huellaButtonText: "Buscar por huella",
      ...labels,
    }),
    [labels]
  );

  const setDni = (value) => {
    if (typeof onDniChange === "function") {
      onDniChange(value);
      return;
    }

    setDniInterno(value);
  };

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBuscarPorDni = async () => {
    const dniLimpio = limpiarDni(dni);

    if (!dniLimpio) {
      onPacienteNoEncontradoDni?.(dniLimpio, {
        validation: true,
        message: "DNI inválido.",
      });
      return;
    }

    try {
      setLoadingBuscarDni(true);
      const paciente = await fetchPacientePorDni(dniLimpio);
      onPacienteEncontrado?.(paciente, "DNI");
    } catch (err) {
      onPacienteNoEncontradoDni?.(dniLimpio, err);
    } finally {
      setLoadingBuscarDni(false);
    }
  };

  const handleReset = () => {
    setDni("");
    onReset?.();
  };

  return (
    <div className="sis-buscador-paciente-universal">
      {permitirDni && (
        <div className="sis-accordion-item" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="sis-btn sis-btn-outline"
            style={{
              width: "100%",
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => toggleAccordion("dni")}
            disabled={disabled}
          >
            <span>{textos.dniTitulo}</span>
            <span>{accordionOpen.dni ? "▲" : "▼"}</span>
          </button>

          {accordionOpen.dni && (
            <div style={{ marginTop: 12 }}>
              <div className="sis-form-grid">
                <div className="sis-form-group">
                  <label className="sis-form-label">{textos.dniLabel}</label>
                  <input
                    className="sis-form-control"
                    name="dniBusquedaUniversal"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder={textos.dniPlaceholder}
                    disabled={disabledGeneral}
                  />
                </div>
              </div>

              <div className="sis-page-actions" style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="sis-btn sis-btn-primary"
                  onClick={handleBuscarPorDni}
                  disabled={disabledGeneral}
                >
                  {loadingBuscarDni ? textos.buscandoDni : textos.buscarDni}
                </button>

                {mostrarBotonLimpiar && (
                  <button
                    type="button"
                    className="sis-btn sis-btn-outline"
                    onClick={handleReset}
                    disabled={disabledGeneral}
                  >
                    {textos.limpiar}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {permitirRostro && (
        <div className="sis-accordion-item" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="sis-btn sis-btn-outline"
            style={{
              width: "100%",
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => toggleAccordion("rostro")}
            disabled={disabled}
          >
            <span>{textos.rostroTitulo}</span>
            <span>{accordionOpen.rostro ? "▲" : "▼"}</span>
          </button>

          {accordionOpen.rostro && (
            <div style={{ marginTop: 12 }}>
              <BusquedaPacientePorRostro
                embedded
                showOwnDialogs={false}
                disabled={disabledGeneral}
                onPacienteEncontrado={(paciente) =>
                  onPacienteEncontrado?.(paciente, "rostro")
                }
                {...rostroProps}
              />
            </div>
          )}
        </div>
      )}

      {permitirHuella && (
        <div className="sis-accordion-item">
          <button
            type="button"
            className="sis-btn sis-btn-outline"
            style={{
              width: "100%",
              justifyContent: "space-between",
              display: "flex",
              alignItems: "center",
            }}
            onClick={() => toggleAccordion("huella")}
            disabled={disabled}
          >
            <span>{textos.huellaTitulo}</span>
            <span>{accordionOpen.huella ? "▲" : "▼"}</span>
          </button>

          {accordionOpen.huella && (
            <div style={{ marginTop: 12 }}>
                <BusquedaPacientePorHuella
                  disabled={disabledGeneral}
                  buttonText={textos.huellaButtonText}
                  showOwnDialogs={false}
                  onPacienteEncontrado={(paciente) =>
                    onPacienteEncontrado?.(paciente, "huella")
                  }
                  {...huellaProps}
                />
            </div>
          )}
        </div>
      )}
    </div>
  );
}