import axiosClient from "./axiosClient";

export async function listarUsuariosAdmin() {
  const { data } = await axiosClient.get("/api/usuarios");
  return data;
}

export async function crearUsuarioAdmin(payload) {
  const { data } = await axiosClient.post("/api/usuarios/registrar", payload);
  return data;
}

export async function actualizarUsuarioAdmin(usuarioId, payload) {
  const { data } = await axiosClient.put(`/api/usuarios/${usuarioId}`, payload);
  return data;
}

export async function cambiarPasswordUsuarioAdmin(usuarioId, payload) {
  const { data } = await axiosClient.put(`/api/usuarios/${usuarioId}/password`, payload);
  return data;
}

export async function reiniciarPasswordUsuarioAdmin(usuarioId) {
  const { data } = await axiosClient.post(`/api/usuarios/${usuarioId}/reset-password`);
  return data;
}
