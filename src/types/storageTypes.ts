// Define interfaces for our data structures
export interface BrowsingHistoryItem {
  url: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface Settings {
  maxHistoryItems: number;
  enableAutoCapture: boolean;
  useServerStorage: boolean; // New setting to control server storage
  serverUrl?: string; // Optional server URL configuration
}

export interface StorageData {
  browsingHistory: BrowsingHistoryItem[];
  settings: Settings;
}

// API response types
export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export interface SearchResult {
  url: string;
  title: string;
  content: string;
  timestamp: number;
  relevanceScore: number; // Added for vector search relevance
  snippets?: string[]; // Relevant text snippets
}
