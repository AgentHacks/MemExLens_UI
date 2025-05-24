import { Readability } from "@mozilla/readability";
// Define interface for extracted page data
interface ExtractedData {
  url: string;
  content: string;
  timestamp: number;
}

/**
 * Helper function to extract main content from the page using Mozilla's Readability
 */
function extractPageContent(): ExtractedData {
  // Get the page URL
  const url = window.location.href;

  // Clone the current document to avoid modifying the live DOM
  const clonedDoc = document.cloneNode(true) as Document;

  // Parse the document using Readability
  const article = new Readability(clonedDoc).parse();

  // Get clean, readable content (fallback to empty string if nothing is parsed)
  let content = article?.textContent?.trim() || "";

  // Clean up the content (normalize whitespace)
  content = content.replace(/\s+/g, " ").trim();

  return {
    url,
    content,
    timestamp: Date.now(),
  };
}

// Define message types
type ExtractContentMessage = {
  action: "extractContent";
};

type ContentExtractedMessage = {
  action: "contentExtracted";
  data: ExtractedData;
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(
  (message: ExtractContentMessage, _sender, _sendResponse) => {
    if (message.action === "extractContent") {
      try {
        // Extract content from the current page
        const extractedData = extractPageContent();

        // Send the extracted content back to the background script
        chrome.runtime.sendMessage({
          action: "contentExtracted",
          data: extractedData,
        } as ContentExtractedMessage);
      } catch (error) {
        console.error("Error extracting page content:", error);
      }
    }
  }
);

// Flag to prevent duplicate extraction
let contentExtracted = false;

// Also extract content when the page initially loads
document.addEventListener("DOMContentLoaded", () => {
  if (contentExtracted) return;

  // Wait a bit for dynamic content to load
  setTimeout(() => {
    try {
      const extractedData = extractPageContent();
      chrome.runtime.sendMessage({
        action: "contentExtracted",
        data: extractedData,
      } as ContentExtractedMessage);

      contentExtracted = true;
    } catch (error) {
      console.error("Error extracting page content on load:", error);
    }
  }, 1000);
});
