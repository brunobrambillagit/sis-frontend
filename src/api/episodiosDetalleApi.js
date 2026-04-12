import axiosClient from "./axiosClient";

export async function obtenerDetalleEpisodio(id) {
  const { data } = await axiosClient.get(`/api/episodios/${id}`);
  return data;
}

export async function agregarObservacionEpisodio(id, payload) {
  const { data } = await axiosClient.post(`/api/episodios/${id}/observaciones`, payload);
  return data;
}

export async function agregarEvolucionEpisodio(id, payload) {
  const { data } = await axiosClient.post(`/api/episodios/${id}/evoluciones`, payload);
  return data;
}

export async function obtenerEpisodiosPorPacienteDni(dni) {
  const { data } = await axiosClient.get(`/api/episodios/paciente/${dni}`);
  return data;
}

export async function agregarObservacionHistoriaClinica(id, payload) {
  const { data } = await axiosClient.post(
    `/api/episodios/${id}/historia-clinica/historial-observaciones`,
    payload
  );
  return data;
}

export async function actualizarObservacionesHistoriaClinica(id, payload) {
  const { data } = await axiosClient.put(
    `/api/episodios/${id}/historia-clinica/observaciones`,
    payload
  );
  return data;
}