import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import {
  crearUsuarioAdmin,
  listarUsuariosAdmin,
  actualizarUsuarioAdmin,
  cambiarPasswordUsuarioAdmin,
  reiniciarPasswordUsuarioAdmin,
} from "../../../api/adminUsuariosApi";

const EMPTY_FORM = {
  nombre: "",
  apellido: "",
  cuit: "",
  email: "",
  password: "",
  rol: "MEDICO",
};

const EMPTY_EDIT_FORM = {
  nombre: "",
  apellido: "",
  cuit: "",
  email: "",
  rol: "MEDICO",
};

const EMPTY_PASSWORD_FORM = {
  passwordNueva: "",
};

export default function UsuariosAdmin() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [formCrear, setFormCrear] = useState(EMPTY_FORM);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formEditar, setFormEditar] = useState(EMPTY_EDIT_FORM);
  const [formPassword, setFormPassword] = useState(EMPTY_PASSWORD_FORM);
  const [passwordReseteada, setPasswordReseteada] = useState("");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listarUsuariosAdmin();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudieron cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return usuarios;

    return usuarios.filter((u) => {
      const nombreCompleto = `${u.nombre || ""} ${u.apellido || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      const cuit = (u.cuit || "").toLowerCase();
      const rol = (u.rol || "").toLowerCase();

      return (
        nombreCompleto.includes(q) ||
        email.includes(q) ||
        cuit.includes(q) ||
        rol.includes(q)
      );
    });
  }, [usuarios, busqueda]);

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setPasswordReseteada("");
    setFormPassword(EMPTY_PASSWORD_FORM);
    setFormEditar({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      cuit: usuario.cuit || "",
      email: usuario.email || "",
      rol: usuario.rol || "MEDICO",
    });
    setMensaje("");
    setError("");
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      await crearUsuarioAdmin(formCrear);

      setMensaje("Usuario creado correctamente.");
      setFormCrear(EMPTY_FORM);
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudo crear el usuario."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizarUsuario = async (e) => {
    e.preventDefault();

    if (!usuarioSeleccionado?.id) return;

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      const actualizado = await actualizarUsuarioAdmin(usuarioSeleccionado.id, formEditar);
      setMensaje("Usuario actualizado correctamente.");
      setUsuarioSeleccionado(actualizado);
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudo actualizar el usuario."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (!usuarioSeleccionado?.id) return;

    try {
      setGuardando(true);
      setMensaje("");
      setError("");
      setPasswordReseteada("");

      await cambiarPasswordUsuarioAdmin(usuarioSeleccionado.id, formPassword);
      setMensaje("La contraseña se actualizó correctamente.");
      setFormPassword(EMPTY_PASSWORD_FORM);
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudo actualizar la contraseña."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleReiniciarPassword = async () => {
    if (!usuarioSeleccionado?.id) return;

    const confirmado = window.confirm(
      `¿Seguro que querés reiniciar la contraseña de ${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}?`
    );

    if (!confirmado) return;

    try {
      setGuardando(true);
      setMensaje("");
      setError("");

      const data = await reiniciarPasswordUsuarioAdmin(usuarioSeleccionado.id);
      setPasswordReseteada(data.passwordTemporal || "");
      setMensaje("La contraseña fue reiniciada correctamente.");
      await cargarUsuarios();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err?.response?.data || "No se pudo reiniciar la contraseña."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Administración de usuarios</h2>
          </div>

          <div className="sis-page-actions">
            <button className="sis-btn sis-btn-outline" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button className="sis-btn sis-btn-outline" onClick={cargarUsuarios} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        {mensaje && (
          <div className="sis-alert sis-alert-success" role="alert" style={{ marginBottom: 16 }}>
            {mensaje}
          </div>
        )}

        {error && (
          <div className="sis-alert sis-alert-danger" role="alert" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <h3 className="sis-page-title">Crear usuario</h3>

            <form onSubmit={handleCrearUsuario}>
              <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                <div className="sis-form-group">
                  <label className="sis-form-label">Nombre</label>
                  <input
                    className="sis-form-control"
                    value={formCrear.nombre}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, nombre: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Apellido</label>
                  <input
                    className="sis-form-control"
                    value={formCrear.apellido}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, apellido: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">CUIT</label>
                  <input
                    className="sis-form-control"
                    value={formCrear.cuit}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, cuit: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Email</label>
                  <input
                    className="sis-form-control"
                    type="email"
                    value={formCrear.email}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Contraseña inicial</label>
                  <input
                    className="sis-form-control"
                    type="password"
                    value={formCrear.password}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Rol</label>
                  <select
                    className="sis-form-control"
                    value={formCrear.rol}
                    onChange={(e) => setFormCrear((prev) => ({ ...prev, rol: e.target.value }))}
                    required
                  >
                    <option value="MEDICO">MÉDICO</option>
                    <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                  </select>
                </div>
              </div>

              <div className="sis-page-actions" style={{ marginTop: 16 }}>
                <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 16 }}>
          <div className="sis-card-body">
            <div className="sis-page-header" style={{ marginBottom: 16 }}>
              <div className="sis-page-title-wrap">
                <h3 className="sis-page-title">Usuarios registrados</h3>
              </div>
              <div style={{ minWidth: 280 }}>
                <input
                  className="sis-form-control"
                  placeholder="Buscar por nombre, email, cuit o rol"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading && <div className="sis-loading-state">Cargando usuarios...</div>}

            {!loading && usuariosFiltrados.length === 0 && (
              <div className="sis-alert sis-alert-info" role="alert">
                No hay usuarios para mostrar.
              </div>
            )}

            {!loading && usuariosFiltrados.length > 0 && (
              <div className="sis-table-wrapper">
                <table className="sis-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>CUIT</th>
                      <th>Rol</th>
                      <th>Cambio obligatorio</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id}>
                        <td className="sis-cell-strong">{u.id}</td>
                        <td>{u.nombre} {u.apellido}</td>
                        <td>{u.email}</td>
                        <td>{u.cuit}</td>
                        <td>{u.rol}</td>
                        <td>{u.debeCambiarPassword ? "Sí" : "No"}</td>
                        <td>
                          <button
                            className="sis-btn sis-btn-outline"
                            type="button"
                            onClick={() => seleccionarUsuario(u)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {usuarioSeleccionado && (
          <>
            <div className="sis-card" style={{ marginBottom: 16 }}>
              <div className="sis-card-body">
                <h3 className="sis-page-title">Editar usuario #{usuarioSeleccionado.id}</h3>

                <form onSubmit={handleActualizarUsuario}>
                  <div className="sis-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
                    <div className="sis-form-group">
                      <label className="sis-form-label">Nombre</label>
                      <input
                        className="sis-form-control"
                        value={formEditar.nombre}
                        onChange={(e) => setFormEditar((prev) => ({ ...prev, nombre: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Apellido</label>
                      <input
                        className="sis-form-control"
                        value={formEditar.apellido}
                        onChange={(e) => setFormEditar((prev) => ({ ...prev, apellido: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">CUIT</label>
                      <input
                        className="sis-form-control"
                        value={formEditar.cuit}
                        onChange={(e) => setFormEditar((prev) => ({ ...prev, cuit: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Email</label>
                      <input
                        className="sis-form-control"
                        type="email"
                        value={formEditar.email}
                        onChange={(e) => setFormEditar((prev) => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Rol</label>
                      <select
                        className="sis-form-control"
                        value={formEditar.rol}
                        onChange={(e) => setFormEditar((prev) => ({ ...prev, rol: e.target.value }))}
                        required
                      >
                        <option value="MEDICO">MÉDICO</option>
                        <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                      </select>
                    </div>
                  </div>

                  <div className="sis-page-actions" style={{ marginTop: 16 }}>
                    <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                      {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="sis-card" style={{ marginBottom: 16 }}>
              <div className="sis-card-body">
                <h3 className="sis-page-title">Cambiar contraseña manualmente</h3>

                <form onSubmit={handleCambiarPassword}>
                  <div className="sis-form-grid" style={{ gridTemplateColumns: "minmax(280px, 420px)" }}>
                    <div className="sis-form-group">
                      <label className="sis-form-label">Nueva contraseña</label>
                      <input
                        className="sis-form-control"
                        type="password"
                        value={formPassword.passwordNueva}
                        onChange={(e) => setFormPassword({ passwordNueva: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="sis-page-actions" style={{ marginTop: 16 }}>
                    <button type="submit" className="sis-btn sis-btn-primary" disabled={guardando}>
                      {guardando ? "Guardando..." : "Actualizar contraseña"}
                    </button>
                    <button
                      type="button"
                      className="sis-btn sis-btn-outline"
                      onClick={handleReiniciarPassword}
                      disabled={guardando}
                    >
                      Reiniciar contraseña
                    </button>
                  </div>
                </form>

                {passwordReseteada && (
                  <div className="sis-alert sis-alert-warning" role="alert" style={{ marginTop: 16 }}>
                    Contraseña temporal generada: <strong>{passwordReseteada}</strong>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
