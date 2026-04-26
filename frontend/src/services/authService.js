import { apiClient } from "./apiClient";

export const authService = {
  login: (credentials) => apiClient.post("/api/auth/login", credentials),
  register: (payload) => apiClient.post("/api/auth/register", payload),
};
