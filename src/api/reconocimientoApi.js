import api from "./axiosClient";

export async function registrarRostroPaciente(pacienteId, archivo) {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const { data } = await api.post(
    `api/reconocimiento/rostro/${pacienteId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
