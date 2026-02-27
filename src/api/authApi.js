import axiosClient from "./axiosClient";

export async function loginApi(email, password) {
  const { data } = await axiosClient.post("/api/auth/login", { email, password });
  return data; // { token, email, rol }
}