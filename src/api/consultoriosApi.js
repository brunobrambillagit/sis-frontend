import axiosClient from "./axiosClient";

export async function obtenerAgendas() {
  const { data } = await axiosClient.get("/api/agendas");
  return data;
}

export async function obtenerAgendasMedico(medicoId) {
  const { data } = await axiosClient.get(`/api/agendas/medico/${medicoId}`);
  return data;
}

export async function crearAgenda(payload) {
  const { data } = await axiosClient.post("/api/agendas", payload);
  return data;
}

export async function generarTurnosAgenda(agendaId, payload) {
  const { data } = await axiosClient.post(
    `/api/agendas/${agendaId}/generar-turnos`,
    payload
  );
  return data;
}

export async function obtenerTurnosAdministrativo(params = {}) {
  const usaFiltroAgenda = !!params?.agendaId;

  const url = usaFiltroAgenda ? "/api/turnos/filtrar" : "/api/turnos/dia";

  const { data } = await axiosClient.get(url, { params });
  return data;
}

export async function obtenerTurnosMedico(medicoId, params = {}) {
  const { data } = await axiosClient.get(`/api/turnos/medico/${medicoId}`, {
    params,
  });
  return data;
}

export async function asignarPacienteATurno(turnoId, payload) {
  const { data } = await axiosClient.patch(`/api/turnos/${turnoId}/asignar-paciente`, payload);
  return data;
}

export async function cambiarEstadoTurno(turnoId, payload) {
  const { data } = await axiosClient.patch(`/api/turnos/${turnoId}/estado`, payload);
  return data;
}

export async function reprogramarTurno(turnoId, payload) {
  const { data } = await axiosClient.patch(`/api/turnos/${turnoId}/reprogramar`, payload);
  return data;
}

export async function obtenerComprobanteTurno(turnoId) {
  const { data } = await axiosClient.get(`/api/turnos/${turnoId}/comprobante`);
  return data;
}

export async function buscarPacientePorDni(dni) {
  const { data } = await axiosClient.get(`/api/pacientes/${dni}`);
  return data;
}

export async function obtenerMedicos() {
  const { data } = await axiosClient.get("/api/usuarios/medicos");
  return data;
}