import axios from "axios";

// You should store this in an environment variable or config file
export const API_BASE_URL =
  "https://memexlens-server-171038289672.us-east1.run.app";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  }
);

export default api;
