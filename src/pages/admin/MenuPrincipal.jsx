import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import "./MenuPrincipal.css";

export default function MenuPrincipalAdmin() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <div className="menu-container-admin">
        <h2>Panel Root</h2>

        <div className="menu-options-admin">
          <div className="menu-box-admin usuarios" onClick={() => navigate("/admin/usuarios")}>
            👤
            <h3>Usuarios</h3>
            <p>Crear usuarios, editar datos, cambiar contraseñas y reiniciar acceso.</p>
          </div>

          <div className="menu-box-admin agendas" onClick={() => navigate("/admin/agendas")}>
            📅
            <h3>Agendas</h3>
            <p>Crear agendas, asignar médicos y generar turnos por rango.</p>
          </div>

          <div className="menu-box-admin camas" onClick={() => navigate("/admin/camas")}>
            🛏️
            <h3>Camas</h3>
            <p>Alta y modificación de camas por código, descripción y tipo de servicio.</p>
          </div>

          <div className="menu-box-admin aws" onClick={() => navigate("/admin/aws-rekognition")}>
            ☁️
            <h3>AWS Rekognition</h3>
            <p>Visualización y eliminación conjunta de rostros en Rekognition y S3.</p>
          </div>

          <div className="menu-box-admin huella" onClick={() => navigate("/admin/huellas")}>
            🖐️
            <h3>Huellas U4500</h3>
            <p>Visualización y desactivación de huellas registradas.</p>
          </div>
        </div>
      </div>
    </>
  );
}
