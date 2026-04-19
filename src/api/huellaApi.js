import axiosClient from "./axiosClient";

const HUELLERO_URL = "http://localhost:18080";

export async function capturarHuellaLocal() {
  const response = await fetch(`${HUELLERO_URL}/api/huella/capturar`, {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Error al capturar huella en el servicio local.");
  }

  return data;
}

export async function buscarPacientePorHuella(payload) {
  const { data } = await axiosClient.post("/api/huellas/buscar", payload);
  return data;
}

export async function registrarHuellaPaciente(payload) {
  const { data } = await axiosClient.post("/api/huellas/registrar", payload);
  return data;
}