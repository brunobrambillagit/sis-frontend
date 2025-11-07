import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="header-container">
      <div className="header-left">
        <h3>Sistema Integral Sanitario Biometrico</h3>
      </div>

      <div className="header-center">
        <span>👤 {usuario?.nombre}</span>
      </div>

      <div className="header-right">
        <button
          className="btn-menu"
          onClick={() => navigate(`/${usuario?.rol}`)}
        >
          🏠 Menú principal
        </button>
        <button className="btn-logout" onClick={logout}>
          🔒 Cerrar sesión
        </button>
      </div>
    </header>
  );
}
