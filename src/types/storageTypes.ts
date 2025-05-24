// Define interfaces for our data structures
export interface BrowsingHistoryItem {
  timestamp: string;
  data: {
    userId: string;
    scrapedTextData: string;
    url: string;
  };
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
  timestamp: string;
  data: {
    userId: string;
    scrapedTextData: string;
    url: string;
  };
  relevanceScore?: number; // Added for vector search relevance
  snippets?: string[]; // Relevant text snippets
}
