// Import services
import { storePageContent } from "../services/contentServices";
import {
  BrowsingHistoryItem,
  Settings,
  StorageData,
} from "../types/storageTypes.ts";

// Initialize storage with default values if not already set
chrome.runtime.onInstalled.addListener(
  ({ reason }: chrome.runtime.InstalledDetails) => {
    if (reason === "install") {
      chrome.storage.local.set({
        browsingHistory: [],
        settings: {
          maxHistoryItems: 100,
          enableAutoCapture: true,
          useServerStorage: true, // Enable server storage by default
        },
      });
      console.log("MemExLens extension installed and storage initialized");
    }
  }
);

// Listen for tab updates to capture browsing history
chrome.tabs.onUpdated.addListener(
  (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    // Only process if the URL has changed and it's a complete load
    if (changeInfo.status === "complete" && tab.url) {
      // Ignore chrome:// and chrome-extension:// URLs
      if (
        !tab.url.startsWith("chrome://") &&
        !tab.url.startsWith("chrome-extension://")
      ) {
        // Check settings before capturing
        chrome.storage.local.get(
          ["settings"],
          (result: Partial<StorageData>) => {
            const settings = result.settings || {
              maxHistoryItems: 100,
              enableAutoCapture: true,
              useServerStorage: true,
            };

            if (settings.enableAutoCapture) {
              // Send message to content script to extract page content
              chrome.tabs.sendMessage(tabId, { action: "extractContent" });
            }
          }
        );
      }
    }
  }
);

// Define message types
type ContentExtractedMessage = {
  action: "contentExtracted";
  data: {
    url: string;
    content: string;
    timestamp: number;
    // title field removed
  };
};

type GetHistoryMessage = {
  action: "getHistory";
};

type SearchMessage = {
  action: "search";
  query: string;
};

type UpdateSettingsMessage = {
  action: "updateSettings";
  settings: Settings;
};

type Message =
  | ContentExtractedMessage
  | GetHistoryMessage
  | SearchMessage
  | UpdateSettingsMessage;

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    // Handle extracted content from content script
    if (message.action === "contentExtracted") {
      const { url, content, timestamp } = message.data; // title removed from destructuring

      // Get current browsing history and settings from storage
      chrome.storage.local.get(
        ["browsingHistory", "settings"],
        async (result: Partial<StorageData>) => {
          const {
            browsingHistory = [],
            settings = {
              maxHistoryItems: 100,
              enableAutoCapture: true,
              useServerStorage: true,
            },
          } = result;

          // Create history item
          const historyItem: BrowsingHistoryItem = {
            timestamp: new Date(timestamp).toISOString(),
            data: {
              userId: "useraaditya123", // You might want to replace this with actual user ID
              scrapedTextData: content.substring(0, 1000), // Limit content size for local storage
              url,
            },
          };

          // Add new entry to browsing history
          const newHistory = [historyItem, ...browsingHistory];

          // Limit history size based on settings
          if (newHistory.length > settings.maxHistoryItems) {
            newHistory.length = settings.maxHistoryItems;
          }

          // Save updated history to local storage
          chrome.storage.local.set({ browsingHistory: newHistory });

          // If server storage is enabled, send to server
          if (settings.useServerStorage) {
            try {
              // Send the full content to the server (not truncated)
              const serverHistoryItem: BrowsingHistoryItem = {
                timestamp: new Date(timestamp).toISOString(),
                data: {
                  userId: "useraaditya123", // You might want to replace this with actual user ID
                  scrapedTextData: content, // Send full content to server
                  url,
                },
              };

              await storePageContent(serverHistoryItem);
            } catch (error) {
              console.error("Error sending content to server:", error);
            }
          }
        }
      );
    }

    // Handle request for browsing history from popup
    else if (message.action === "getHistory") {
      chrome.storage.local.get(
        ["browsingHistory"],
        (result: Partial<StorageData>) => {
          sendResponse({ history: result.browsingHistory || [] });
        }
      );
      return true; // Required for asynchronous sendResponse
    }

    // Handle search request from popup
    else if (message.action === "search") {
      const { query } = message;

      // Get settings to determine search method
      chrome.storage.local.get(
        ["settings", "browsingHistory"],
        async (result: Partial<StorageData>) => {
          const settings = result.settings || {
            maxHistoryItems: 100,
            enableAutoCapture: true,
            useServerStorage: true,
          };

          // If server storage is enabled, use server-side search
          if (settings.useServerStorage) {
            try {
              // Import here to avoid circular dependencies
              const { searchContent } = await import(
                "../services/contentServices.ts"
              );
              const serverResponse = await searchContent(query);

              if (serverResponse && serverResponse.data) {
                // Create a simplified response with just the data string
                sendResponse({ data: serverResponse.data });
              } else {
                // Fallback to local search if server search fails
                performLocalSearch(
                  query,
                  result.browsingHistory || [],
                  sendResponse
                );
              }
            } catch (error) {
              console.error("Error with server search:", error);
              // Fallback to local search
              performLocalSearch(
                query,
                result.browsingHistory || [],
                sendResponse
              );
            }
          } else {
            // Use local search only
            performLocalSearch(
              query,
              result.browsingHistory || [],
              sendResponse
            );
          }
        }
      );
      return true; // Required for asynchronous sendResponse
    }

    // Handle settings update from popup
    else if (message.action === "updateSettings") {
      chrome.storage.local.set({ settings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true; // Required for asynchronous sendResponse
    }
  }
);

// Helper function for local search - update to match new response format
function performLocalSearch(
  query: string,
  history: BrowsingHistoryItem[],
  sendResponse: (response?: { data: string }) => void
) {
  const searchResults = history.filter((item) => {
    return item.data.scrapedTextData
      .toLowerCase()
      .includes(query.toLowerCase());
  });

  if (searchResults.length > 0) {
    const formattedData = `Found ${searchResults.length} results in your local history.`;
    sendResponse({ data: formattedData });
  } else {
    sendResponse({ data: "No results found in your local history." });
  }
}

// Remove the existing chrome.action.onClicked listener (lines 244-270)
// and replace with this:

// Set up side panel
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for extension icon clicks
chrome.action.onClicked.addListener((_tab) => {
  // Open the side panel when the extension icon is clicked
  chrome.windows.getCurrent((window) => {
    if (window.id) {
      chrome.sidePanel.open({ windowId: window.id });
    }
  });
});
