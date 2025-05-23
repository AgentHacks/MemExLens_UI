import api from "../api";

// User login
export const login = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { token } = response.data;

    if (token) {
      // Store token in Chrome storage
      await chrome.storage.local.set({ authToken: token });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

// User registration
export const register = async (
  email: string,
  password: string,
  name: string
): Promise<boolean> => {
  try {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
    });
    const { token } = response.data;

    if (token) {
      // Store token in Chrome storage
      await chrome.storage.local.set({ authToken: token });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Registration error:", error);
    return false;
  }
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await chrome.storage.local.remove(["authToken"]);
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const result = await chrome.storage.local.get(["authToken"]);
    return !!result.authToken;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};
