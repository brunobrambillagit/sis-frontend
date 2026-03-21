import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export default function Header({ titulo = "Sistema Integral Sanitario Biometrico" }) {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

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

  const nombreMostrado =
    usuario?.nombre && usuario?.apellido
      ? `${usuario.nombre} ${usuario.apellido}`
      : usuario?.username || "Usuario";

  const rolMostrado = usuario?.rol
    ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)
    : "Sin rol";

  return (
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
              <span className="sis-header__brand-title">Sistema Integral Sanitario Biometrico</span>
              {/* <span className="sis-header__brand-subtitle">{titulo}</span> */}
            </div>
          </button>
        </div>

        <div className="sis-header__center">
          <div className="sis-header__title-wrap">
            {/* <h1 className="sis-header__title">{titulo}</h1> */}
            {/* <p className="sis-header__subtitle">Gestión integral de atención clínica</p> */}
          </div>
        </div>

        <div className="sis-header__right">
          <div className="sis-header__user-card">
            {/* <div className="sis-header__avatar">
              {nombreMostrado.charAt(0).toUpperCase()}
            </div> */}

            <div className="sis-header__user-info">
              <span className="sis-header__user-name">{nombreMostrado}</span>
              <span className="sis-header__user-role">{rolMostrado}</span>
            </div>
          </div>

          <div className="sis-header__actions">
            {/* <button
              type="button"
              className="sis-btn sis-btn-outline sis-btn-sm"
              onClick={volverAlMenu}
            >
              Menú principal
            </button> */}

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
  );
}