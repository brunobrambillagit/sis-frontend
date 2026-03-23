import api from "./axiosInstance";

export async function obtenerEpisodiosActivosHospitalizacion() {
  const { data } = await api.get("/episodios/hospitalizacion/activos");
  return data;
}

export async function obtenerCamasDisponiblesHospitalizacion() {
  const { data } = await api.get("/camas/hospitalizacion/disponibles");
  return data;
}

export async function admisionarPacienteHospitalizacion(payload) {
  const { data } = await api.post("/episodios/hospitalizacion/admision", payload);
  return data;
}
