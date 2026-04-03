import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Login.css";

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (usuario?.rol === "administrativo") navigate("/administrativo");
    if (usuario?.rol === "medico") navigate("/medico");
    if (usuario?.rol === "admin") navigate("/admin");
  }, [usuario, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const user = await login(email, password);

      if (user?.rol === "administrativo") navigate("/administrativo");
      else if (user?.rol === "medico") navigate("/medico");
      else if (user?.rol === "admin") navigate("/admin");
      else navigate("/login");
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.error ||
        data?.mensaje ||
        "Credenciales inválidas";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <div className="login-content text-center">
        <h1 className="titulo-sistema mb-4 text-white">
          Sistema Integral Sanitario Biometrico
        </h1>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <div className="login-card shadow-lg p-4 rounded">
          <h2 className="text-center mb-4">Login</h2>

          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <span className="input-group-text">
                <i className="bi bi-envelope-fill"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group mb-4">
              <span className="input-group-text">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}