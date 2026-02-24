import axios from "axios";

// Ajustá esto si tu backend corre en otro puerto/host
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: agrega JWT a cada request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // o donde lo guardes
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: manejo simple de 401 (opcional)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si vence el token o no es válido
    if (error?.response?.status === 401) {
      // opcional: limpiar token + redirigir
      localStorage.removeItem("token");
      // si usás router, preferible navegar desde un hook; acá dejamos algo mínimo
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;