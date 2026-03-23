import api from "./axiosClient";

export async function obtenerMovimientosCamaPorEpisodio(episodioId) {
  const { data } = await api.get(`api/episodios/${episodioId}/movimientos-cama`);
  return data;
}
