import axiosClient from "./axiosClient";

export async function crearPaciente(payload) {
  // POST /api/pacientes
  const { data } = await axiosClient.post("/api/pacientes", payload);
  return data; 
  // esperable: { nroHistoriaClinica: "...", ... } (según tu backend)
}

export async function obtenerPacientePorDni(dni) {
  const { data } = await axiosClient.get(`/api/pacientes/${dni}`);
  return data;
}

export async function buscarPacientes(q) {
  const { data } = await axiosClient.get("/api/pacientes/buscar", { params: { q } });
  return data;
}