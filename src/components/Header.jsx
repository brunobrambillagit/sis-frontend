import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { cambiarPassword } from "../api/authApi";
import AlertDialog from "./AlertDialog";
import "./Header.css";

export default function Header({ titulo = "Sistema Integral Sanitario Biometrico" }) {
  const navigate = useNavigate();
  const {
    usuario,
    logout,
    alertOpen: sessionAlertOpen,
    setAlertOpen: setSessionAlertOpen,
    alertMessage: sessionAlertMessage,
    alertType: sessionAlertType,
  } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("info");

  const volverAlMenu = () => {
    if (!usuario?.rol) return;

    if (usuario.rol === "administrativo") {
      navigate("/administrativo");
      return;
    }

    if (usuario.rol === "medico") {
      navigate("/medico");
      return;
    }

    navigate("/");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCambiarPassword = async () => {
    try {
      await cambiarPassword({
        passwordActual,
        passwordNueva,
      });

      setAlertMessage("Contraseña actualizada correctamente");
      setAlertType("success");
      setAlertOpen(true);

      setShowPasswordModal(false);
      setPasswordActual("");
      setPasswordNueva("");
    } catch (e) {
      setAlertMessage(e.response?.data || "Error al cambiar contraseña");
      setAlertType("error");
      setAlertOpen(true);
    }
  };

  const nombreMostrado =
    usuario?.nombre && usuario?.apellido
      ? `${usuario.nombre} ${usuario.apellido}`
      : usuario?.email || "Usuario";

  const rolMostrado = usuario?.rol
    ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)
    : "Sin rol";

  return (
    <>
      <header className="sis-header">
        <div className="sis-header__container">
          <div className="sis-header__left">
            <button
              type="button"
              className="sis-header__brand"
              onClick={volverAlMenu}
              title="Volver al menú principal"
            >
              <span className="sis-header__brand-mark">SIS</span>
              <div className="sis-header__brand-text">
                <span className="sis-header__brand-title">
                  Sistema Integral Sanitario Biometrico
                </span>
              </div>
            </button>
          </div>

          <div className="sis-header__right">
            <div className="sis-header__user-card">
              <div className="sis-header__user-info">
                <span className="sis-header__user-name">{nombreMostrado}</span>
                <span className="sis-header__user-role">{rolMostrado}</span>
              </div>
            </div>

            <div className="sis-header__actions">
              <button
                type="button"
                className="sis-btn sis-btn-outline sis-btn-sm"
                onClick={() => setShowPasswordModal(true)}
              >
                Cambiar contraseña
              </button>

              <button
                type="button"
                className="sis-btn sis-btn-secondary sis-btn-sm"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPasswordModal && (
        <div className="sis-modal-backdrop">
          <div className="sis-modal-card sis-modal-card-password">
            <div className="sis-modal-header">
              <div>
                <h3 className="sis-page-title2">Cambiar contraseña</h3>
              </div>
            </div>

            <div className="sis-modal-body">
              <div className="sis-form">
                <div className="sis-form-group">
                  <label className="sis-form-label">Contraseña actual</label>
                  <input
                    type="password"
                    placeholder="Ingresá tu contraseña actual"
                    className="sis-form-control"
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="Ingresá tu nueva contraseña"
                    className="sis-form-control"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                  />
                </div>
              </div>

              <div className="sis-page-actions sis-modal-actions">
                <button
                  className="sis-btn sis-btn-primary"
                  onClick={handleCambiarPassword}
                >
                  Guardar
                </button>

                <button
                  className="sis-btn sis-btn-outline"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordActual("");
                    setPasswordNueva("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={alertOpen}
        title="Aviso"
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertOpen(false)}
      />

      <AlertDialog
        open={sessionAlertOpen}
        title="Sesión"
        message={sessionAlertMessage}
        type={sessionAlertType}
        onClose={() => setSessionAlertOpen(false)}
      />
    </>
  );
}