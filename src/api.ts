import axios from "axios";

// You should store this in an environment variable or config file
export const API_BASE_URL = "https://your-api-endpoint.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(async (config) => {
  try {
    // Get auth token from Chrome storage if it exists
    const result = await chrome.storage.local.get(["authToken"]);
    const token = result.authToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  } catch (error) {
    console.error("Error setting auth token:", error);
    return config;
  }
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear the invalid token
      await chrome.storage.local.remove(["authToken"]);
      // You could redirect to login or handle this differently
    }
    return Promise.reject(error);
  }
);

export default api;
