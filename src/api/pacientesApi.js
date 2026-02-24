import axiosClient from "./axiosClient";

export async function crearPaciente(payload) {
  // POST /api/pacientes
  const { data } = await axiosClient.post("/api/pacientes", payload);
  return data; 
  // esperable: { nroHistoriaClinica: "...", ... } (según tu backend)
}