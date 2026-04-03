import axiosClient from "./axiosClient";

export async function obtenerCamasDisponiblesHospitalizacion() {
  const { data } = await axiosClient.get("/api/camas/disponibles/hospitalizacion");
  return data;
}

export async function obtenerCamasAdmin() {
  const { data } = await axiosClient.get("/api/camas");
  return data;
}

export async function crearCamaAdmin(payload) {
  const { data } = await axiosClient.post("/api/camas", payload);
  return data;
}

export async function actualizarCamaAdmin(camaId, payload) {
  const { data } = await axiosClient.put(`/api/camas/${camaId}`, payload);
  return data;
}
