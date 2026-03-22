import axiosClient from "./axiosClient";

export async function crearPaciente(payload) {
  const { data } = await axiosClient.post("/api/pacientes", payload);
  return data;
}

export async function obtenerPacientePorDni(dni) {
  const { data } = await axiosClient.get(`/api/pacientes/${dni}`);
  return data;
}

export async function buscarPacientes(q) {
  const { data } = await axiosClient.get(`/api/pacientes/buscar?q=${encodeURIComponent(q)}`);
  return data;
}

export async function actualizarPacientePorDni(dni, payload) {
  const { data } = await axiosClient.put(`/api/pacientes/${dni}`, payload);
  return data;
}
