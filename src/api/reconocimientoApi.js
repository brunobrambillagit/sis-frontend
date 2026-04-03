import axiosClient from "./axiosClient";

export async function registrarRostroPaciente(pacienteId, archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await axiosClient.post(
    `/api/reconocimiento/rostro/${pacienteId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function buscarPacientePorRostro(archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await axiosClient.post(
    "/api/reconocimiento/rostro/buscar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function obtenerRostrosAdmin() {
  const { data } = await axiosClient.get("/api/reconocimiento/rostros/admin");
  return data;
}

export async function eliminarRostroAdmin(reconocimientoId) {
  const { data } = await axiosClient.delete(`/api/reconocimiento/rostros/${reconocimientoId}`);
  return data;
}