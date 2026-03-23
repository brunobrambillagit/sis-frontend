import axiosClient from "./axiosClient";

export async function obtenerCamasDisponiblesHospitalizacion() {
  const { data } = await axiosClient.get("/api/camas/disponibles/hospitalizacion");
  return data;
}
