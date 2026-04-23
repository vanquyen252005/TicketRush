import axios from "axios";
import keycloak from "./keycloak";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

// 🚀 BƯỚC 2: Cài đặt và thiết lập "Trạm trung chuyển" Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động đính kèm Token Keycloak vào mọi request gửi đi
apiClient.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
