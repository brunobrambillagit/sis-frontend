import axiosClient from "./axiosClient";

export async function obtenerEpisodiosActivos(servicio) {
  const { data } = await axiosClient.get(`/api/episodios/activos?servicio=${servicio}`);
  return data;
}

export async function cambiarEstadoEpisodio(id, nuevoEstado, usuarioId) {
  const { data } = await axiosClient.patch(`/api/episodios/${id}/estado`, {
    nuevoEstado,
    usuarioId,
  });
  return data;
}

export async function crearEpisodio(payload) {
  const { data } = await axiosClient.post("/api/episodios", payload);
  return data;
}