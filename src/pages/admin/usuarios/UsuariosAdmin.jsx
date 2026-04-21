import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import AlertDialog from "../../../components/AlertDialog";
import ConfirmDialog from "../../../components/ConfirmDialog";
import {
  crearUsuarioAdmin,
  listarUsuariosAdmin,
  actualizarUsuarioAdmin,
  cambiarPasswordUsuarioAdmin,
  reiniciarPasswordUsuarioAdmin,
} from "../../../api/adminUsuariosApi";

const ITEMS_POR_PAGINA = 10;

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

const EMPTY_DIALOG = {
  open: false,
  title: "",
  message: "",
  type: "info",
};

const EMPTY_CONFIRM = {
  open: false,
  title: "",
  message: "",
  action: null,
};

const formGridStyle = {
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  marginBottom: 16,
};

const searchWrapStyle = {
  minWidth: 280,
  flex: "1 1 320px",
};

const sectionTitleStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const selectedRowStyle = {
  backgroundColor: "#eef6ff",
};

const userResumeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 18,
};

function getRolLabel(rol) {
  if (rol === "MEDICO") return "Médico";
  if (rol === "ADMINISTRATIVO") return "Administrativo";
  return rol || "-";
}

function getRolBadgeStyle(rol) {
  if (rol === "MEDICO") {
    return {
      backgroundColor: "#eefbf3",
      color: "#157347",
      border: "1px solid #b8e3c8",
    };
  }

  if (rol === "ADMINISTRATIVO") {
    return {
      backgroundColor: "#e8f7fe",
      color: "#055160",
      border: "1px solid #b6effb",
    };
  }

  return {
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #dbe4ee",
  };
}

function getCambioPasswordBadgeStyle(value) {
  if (value) {
    return {
      backgroundColor: "#fff7e6",
      color: "#9a6700",
      border: "1px solid #f5d48a",
    };
  }

  return {
    backgroundColor: "#eefbf3",
    color: "#157347",
    border: "1px solid #b8e3c8",
  };
}

function StatCard({ titulo, valor, descripcion }) {
  return (
    <div className="sis-detail-item sis-detail-item--highlight">
      <span className="sis-detail-label">{titulo}</span>
      <div className="sis-detail-value" style={{ fontSize: "1.25rem" }}>
        {valor}
      </div>
      <div className="sis-text-muted" style={{ fontSize: "0.9rem", marginTop: 6 }}>
        {descripcion}
      </div>
    </div>
  );
}

function DataResumeItem({ label, value }) {
  return (
    <div className="sis-detail-item">
      <span className="sis-detail-label">{label}</span>
      <div className="sis-detail-value">{value || "-"}</div>
    </div>
  );
}

export default function UsuariosAdmin() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [formCrear, setFormCrear] = useState(EMPTY_FORM);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [formEditar, setFormEditar] = useState(EMPTY_EDIT_FORM);
  const [formPassword, setFormPassword] = useState(EMPTY_PASSWORD_FORM);
  const [passwordReseteada, setPasswordReseteada] = useState("");

  const [dialog, setDialog] = useState(EMPTY_DIALOG);
  const [confirmDialog, setConfirmDialog] = useState(EMPTY_CONFIRM);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const showDialog = (title, message, type = "info") => {
    setDialog({
      open: true,
      title,
      message,
      type,
    });
  };

  const cerrarDialogo = () => {
    setDialog(EMPTY_DIALOG);
  };

  const abrirConfirmacion = (title, message, action) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      action,
    });
  };

  const cerrarConfirmacion = () => {
    if (guardando) return;
    setConfirmDialog(EMPTY_CONFIRM);
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await listarUsuariosAdmin();
      setUsuarios(Array.isArray(data) ? data : []);
      setPaginaActual(1);
    } catch (err) {
      console.error(err);
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudieron cargar los usuarios.",
        "error"
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

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / ITEMS_POR_PAGINA)
  );

  useEffect(() => {
    if (paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicio, indiceFin);

  const totalUsuarios = usuarios.length;
  const totalMedicos = usuarios.filter((u) => u.rol === "MEDICO").length;
  const totalAdministrativos = usuarios.filter((u) => u.rol === "ADMINISTRATIVO").length;

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
    window.scrollTo({ top: 1000, behavior: "smooth" });
  };

  const limpiarSeleccion = () => {
    setUsuarioSeleccionado(null);
    setFormEditar(EMPTY_EDIT_FORM);
    setFormPassword(EMPTY_PASSWORD_FORM);
    setPasswordReseteada("");
  };

  const ejecutarCrearUsuario = async () => {
    try {
      setGuardando(true);
      await crearUsuarioAdmin(formCrear);
      setFormCrear(EMPTY_FORM);
      await cargarUsuarios();
      cerrarConfirmacion();
      showDialog("Usuario creado", "Usuario creado correctamente.", "success");
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo crear el usuario.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarActualizarUsuario = async () => {
    if (!usuarioSeleccionado?.id) return;

    try {
      setGuardando(true);

      const actualizado = await actualizarUsuarioAdmin(
        usuarioSeleccionado.id,
        formEditar
      );

      setUsuarioSeleccionado(actualizado);
      await cargarUsuarios();
      cerrarConfirmacion();
      showDialog("Usuario actualizado", "Usuario actualizado correctamente.", "success");
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo actualizar el usuario.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarCambiarPassword = async () => {
    if (!usuarioSeleccionado?.id) return;

    try {
      setGuardando(true);
      setPasswordReseteada("");

      await cambiarPasswordUsuarioAdmin(usuarioSeleccionado.id, formPassword);
      setFormPassword(EMPTY_PASSWORD_FORM);
      await cargarUsuarios();
      cerrarConfirmacion();
      showDialog(
        "Contraseña actualizada",
        "La contraseña se actualizó correctamente.",
        "success"
      );
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo actualizar la contraseña.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const ejecutarReiniciarPassword = async () => {
    if (!usuarioSeleccionado?.id) return;

    try {
      setGuardando(true);

      const data = await reiniciarPasswordUsuarioAdmin(usuarioSeleccionado.id);
      setPasswordReseteada(data.passwordTemporal || "");
      await cargarUsuarios();
      cerrarConfirmacion();

      const temporal = data?.passwordTemporal
        ? `\n\nContraseña temporal generada: ${data.passwordTemporal}`
        : "";

      showDialog(
        "Contraseña reiniciada",
        `La contraseña fue reiniciada correctamente.${temporal}`,
        "success"
      );
    } catch (err) {
      console.error(err);
      cerrarConfirmacion();
      showDialog(
        "Error",
        err?.response?.data?.message ||
          err?.response?.data ||
          "No se pudo reiniciar la contraseña.",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  const confirmarAccion = async () => {
    switch (confirmDialog.action) {
      case "crear":
        await ejecutarCrearUsuario();
        break;
      case "actualizar":
        await ejecutarActualizarUsuario();
        break;
      case "cambiarPassword":
        await ejecutarCambiarPassword();
        break;
      case "reiniciarPassword":
        await ejecutarReiniciarPassword();
        break;
      default:
        cerrarConfirmacion();
        break;
    }
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();

    abrirConfirmacion(
      "Confirmar creación",
      "¿Seguro que querés crear este usuario?",
      "crear"
    );
  };

  const handleActualizarUsuario = async (e) => {
    e.preventDefault();

    if (!usuarioSeleccionado?.id) return;

    abrirConfirmacion(
      "Confirmar actualización",
      `¿Seguro que querés guardar los cambios del usuario #${usuarioSeleccionado.id}?`,
      "actualizar"
    );
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();

    if (!usuarioSeleccionado?.id) return;

    abrirConfirmacion(
      "Confirmar cambio de contraseña",
      "¿Seguro que querés actualizar manualmente la contraseña de este usuario?",
      "cambiarPassword"
    );
  };

  const handleReiniciarPassword = async () => {
    if (!usuarioSeleccionado?.id) return;

    abrirConfirmacion(
      "Confirmar reinicio de contraseña",
      `¿Seguro que querés reiniciar la contraseña de ${usuarioSeleccionado.nombre} ${usuarioSeleccionado.apellido}?`,
      "reiniciarPassword"
    );
  };

  return (
    <>
      <Header />

      <div className="sis-page">
        <div className="sis-page-header">
          <div className="sis-page-title-wrap">
            <h2 className="sis-page-title">Administración de usuarios</h2>
            <p className="sis-page-subtitle">
              Gestioná altas, modificacion de datos y contraseñas
            </p>
          </div>

          <div className="sis-page-actions">
            <button
              className="sis-btn sis-btn-outline"
              onClick={() => navigate(-1)}
              type="button"
            >
              Volver
            </button>

            <button
              className="sis-btn sis-btn-outline"
              onClick={cargarUsuarios}
              disabled={loading}
              type="button"
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>

        <div style={statsGridStyle}>
          <StatCard
            titulo="Total"
            valor={totalUsuarios}
            descripcion="Usuarios registrados en el sistema"
          />
          <StatCard
            titulo="Médicos"
            valor={totalMedicos}
            descripcion="Usuarios con rol médico"
          />
          <StatCard
            titulo="Administrativos"
            valor={totalAdministrativos}
            descripcion="Usuarios con rol administrativo"
          />
        </div>

        <div className="sis-card" style={{ marginBottom: 24 }}>
          <div className="sis-card-body">
            <div style={sectionTitleStyle}>
              <h3 className="sis-page-title2">Crear usuario</h3>
              <p className="sis-page-subtitle">
                Completá los datos para registrar un nuevo usuario en el sistema.
              </p>
            </div>

            <form onSubmit={handleCrearUsuario} className="sis-form" style={{ marginTop: 18 }}>
              <div className="sis-form-grid" style={formGridStyle}>
                <div className="sis-form-group">
                  <label className="sis-form-label">Nombre</label>
                  <input
                    className="sis-form-control"
                    placeholder="Ej: Juan"
                    value={formCrear.nombre}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Apellido</label>
                  <input
                    className="sis-form-control"
                    placeholder="Ej: Pérez"
                    value={formCrear.apellido}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, apellido: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">CUIT</label>
                  <input
                    className="sis-form-control"
                    placeholder="Ej: 20-12345678-3"
                    value={formCrear.cuit}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, cuit: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Email</label>
                  <input
                    className="sis-form-control"
                    type="email"
                    placeholder="usuario@correo.com"
                    value={formCrear.email}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Contraseña inicial</label>
                  <input
                    className="sis-form-control"
                    type="password"
                    placeholder="Ingresá una contraseña inicial"
                    value={formCrear.password}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, password: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="sis-form-group">
                  <label className="sis-form-label">Rol</label>
                  <select
                    className="sis-form-control"
                    value={formCrear.rol}
                    onChange={(e) =>
                      setFormCrear((prev) => ({ ...prev, rol: e.target.value }))
                    }
                    required
                  >
                    <option value="MEDICO">MÉDICO</option>
                    <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                  </select>
                </div>
              </div>

              <div className="sis-page-actions">
                <button
                  type="submit"
                  className="sis-btn sis-btn-primary"
                  disabled={guardando}
                >
                  {guardando ? "Guardando..." : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="sis-card" style={{ marginBottom: 24 }}>
          <div className="sis-card-body">
            <div
              className="sis-page-header"
              style={{ marginBottom: 18, alignItems: "flex-end" }}
            >
              <div className="sis-page-title-wrap">
                <h3 className="sis-page-title">Usuarios registrados</h3>
                <p className="sis-page-subtitle">
                  Seleccioná un usuario para editar sus datos o administrar su contraseña.
                </p>
              </div>

              <div style={searchWrapStyle}>
                <label className="sis-form-label" style={{ marginBottom: 8, display: "block" }}>
                </label>
                <input
                  className="sis-form-control"
                  placeholder="Buscar por nombre, email, CUIT o rol"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>

            {loading && <div className="sis-loading-state">Cargando usuarios...</div>}

            {!loading && usuariosFiltrados.length === 0 && (
              <div className="sis-alert sis-alert-info" role="alert">
                No hay usuarios para mostrar con el filtro actual.
              </div>
            )}

            {!loading && usuariosFiltrados.length > 0 && (
              <>
                <div className="sis-table-wrapper">
                  <table className="sis-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre completo</th>
                        <th>Email</th>
                        <th>CUIT</th>
                        <th>Rol</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosPaginados.map((u) => {
                        const isSelected = usuarioSeleccionado?.id === u.id;

                        return (
                          <tr key={u.id}>
                            <td
                              className="sis-cell-strong"
                              style={isSelected ? selectedRowStyle : undefined}
                            >
                              {u.id}
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <div className="sis-cell-strong">
                                {u.nombre} {u.apellido}
                              </div>
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>{u.email}</td>
                            <td style={isSelected ? selectedRowStyle : undefined}>{u.cuit}</td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <span className="sis-badge" style={getRolBadgeStyle(u.rol)}>
                                {getRolLabel(u.rol)}
                              </span>
                            </td>
                            <td style={isSelected ? selectedRowStyle : undefined}>
                              <button
                                className="sis-btn sis-btn-primary sis-btn-sm"
                                type="button"
                                onClick={() => seleccionarUsuario(u)}
                              >
                                {isSelected ? "Seleccionado" : "Editar"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="sis-text-muted">
                    Mostrando {usuariosPaginados.length} de {usuariosFiltrados.length} usuarios
                    filtrados · Página {paginaActual} de {totalPaginas}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() => setPaginaActual(1)}
                      disabled={paginaActual === 1}
                    >
                      Primera
                    </button>

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                      disabled={paginaActual === 1}
                    >
                      Anterior
                    </button>

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() =>
                        setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                      }
                      disabled={paginaActual === totalPaginas}
                    >
                      Siguiente
                    </button>

                    <button
                      type="button"
                      className="sis-btn sis-btn-outline sis-btn-sm"
                      onClick={() => setPaginaActual(totalPaginas)}
                      disabled={paginaActual === totalPaginas}
                    >
                      Última
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {usuarioSeleccionado && (
          <>
            <div className="sis-card" style={{ marginBottom: 24 }}>
              <div className="sis-card-body">
                <div className="sis-page-header" style={{ marginBottom: 18 }}>
                  <div className="sis-page-title-wrap">
                    <h3 className="sis-page-title2">
                      Editar usuario #{usuarioSeleccionado.id}
                    </h3>
                    <p className="sis-page-subtitle">
                      Modificá los datos generales del usuario seleccionado.
                    </p>
                  </div>

                  <div className="sis-page-actions">
                    <button
                      type="button"
                      className="sis-btn sis-btn-outline"
                      onClick={limpiarSeleccion}
                    >
                      Cerrar edición
                    </button>
                  </div>
                </div>

                <div style={userResumeGridStyle}>
                  <DataResumeItem
                    label="Usuario seleccionado"
                    value={`${usuarioSeleccionado.nombre || ""} ${usuarioSeleccionado.apellido || ""}`.trim()}
                  />
                  <DataResumeItem
                    label="Email actual"
                    value={usuarioSeleccionado.email}
                  />
                  <DataResumeItem
                    label="Rol actual"
                    value={getRolLabel(usuarioSeleccionado.rol)}
                  />
                </div>

                <form onSubmit={handleActualizarUsuario} className="sis-form">
                  <div className="sis-form-grid" style={formGridStyle}>
                    <div className="sis-form-group">
                      <label className="sis-form-label">Nombre</label>
                      <input
                        className="sis-form-control"
                        placeholder="Ej: Juan"
                        value={formEditar.nombre}
                        onChange={(e) =>
                          setFormEditar((prev) => ({ ...prev, nombre: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Apellido</label>
                      <input
                        className="sis-form-control"
                        placeholder="Ej: Pérez"
                        value={formEditar.apellido}
                        onChange={(e) =>
                          setFormEditar((prev) => ({ ...prev, apellido: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">CUIT</label>
                      <input
                        className="sis-form-control"
                        placeholder="Ej: 20-12345678-3"
                        value={formEditar.cuit}
                        onChange={(e) =>
                          setFormEditar((prev) => ({ ...prev, cuit: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Email</label>
                      <input
                        className="sis-form-control"
                        type="email"
                        placeholder="usuario@correo.com"
                        value={formEditar.email}
                        onChange={(e) =>
                          setFormEditar((prev) => ({ ...prev, email: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div className="sis-form-group">
                      <label className="sis-form-label">Rol</label>
                      <select
                        className="sis-form-control"
                        value={formEditar.rol}
                        onChange={(e) =>
                          setFormEditar((prev) => ({ ...prev, rol: e.target.value }))
                        }
                        required
                      >
                        <option value="MEDICO">MÉDICO</option>
                        <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                      </select>
                    </div>
                  </div>

                  <div className="sis-page-actions">
                    <button
                      type="submit"
                      className="sis-btn sis-btn-primary"
                      disabled={guardando}
                    >
                      {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="sis-card" style={{ marginBottom: 24 }}>
              <div className="sis-card-body">
                <div style={sectionTitleStyle}>
                  <h3 className="sis-page-title2">Seguridad del usuario</h3>
                  <p className="sis-page-subtitle">
                    Cambiá la contraseña manualmente o generá una contraseña temporal.
                  </p>
                </div>

                <form onSubmit={handleCambiarPassword} className="sis-form" style={{ marginTop: 18 }}>
                  <div className="sis-form-grid" style={{ gridTemplateColumns: "minmax(280px, 420px)" }}>
                    <div className="sis-form-group">
                      <label className="sis-form-label">Nueva contraseña</label>
                      <input
                        className="sis-form-control"
                        type="password"
                        placeholder="Ingresá la nueva contraseña"
                        value={formPassword.passwordNueva}
                        onChange={(e) =>
                          setFormPassword({ passwordNueva: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="sis-page-actions">
                    <button
                      type="submit"
                      className="sis-btn sis-btn-primary"
                      disabled={guardando}
                    >
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
                  <div
                    className="sis-alert sis-alert-info"
                    role="alert"
                    style={{ marginTop: 16 }}
                  >
                    Contraseña temporal generada: <strong>{passwordReseteada}</strong>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmarAccion}
        onCancel={cerrarConfirmacion}
        loading={guardando}
      />

      <AlertDialog
        open={dialog.open}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onClose={cerrarDialogo}
      />
    </>
  );
}
