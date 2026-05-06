import axios from "axios";
import { API_BASE_URL } from "@/utils/constants";
import { useAuthStore } from "@/stores/authStore";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default client;
