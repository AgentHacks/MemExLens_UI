import api from "../api";
import { BrowsingHistoryItem } from "../types/storageTypes";

// Store page content on the server
export const storePageContent = async (
  data: BrowsingHistoryItem
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await api.post("/api/data", data);
    return response.data;
  } catch (error) {
    console.error("Error storing content on server:", error);
    return { success: false, message: "Failed to store content on server" };
  }
};

// Search content using server-side LLM and vector DB
export const searchContent = async (
  query: string
): Promise<{ data: string; message?: string }> => {
  try {
    // Using the exact payload structure specified
    const payload = {
      userId: "useraaditya123",
      prompt: query,
    };

    const response = await api.post("/api/data/user", payload);
    return response.data; // Expected to be { data: "Some string of data" }
  } catch (error) {
    console.error("Error searching content on server:", error);
    return { data: "", message: "Error searching content on server" };
  }
};

// Get user's browsing history from server
export const getHistory = async (): Promise<{
  history: BrowsingHistoryItem[];
  message?: string;
}> => {
  try {
    const response = await api.get("/history");
    return response.data;
  } catch (error) {
    console.error("Error fetching history from server:", error);
    return { history: [], message: "Error fetching history from server" };
  }
};
