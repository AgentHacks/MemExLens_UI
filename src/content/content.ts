// Define interface for extracted page data
interface ExtractedData {
  title: string;
  url: string;
  content: string;
  timestamp: number;
}

// Helper function to extract main content from the page
function extractPageContent(): ExtractedData {
  // Get the page title
  const title = document.title;

  // Get the page URL
  const url = window.location.href;

  // Extract main content - prioritize article content
  let content = "";

  // Try to find main article content
  const articleElements = document.querySelectorAll<HTMLElement>(
    'article, [role="main"], main, .main-content, #main-content'
  );
  if (articleElements.length > 0) {
    // Use the first article element found
    const articleText = articleElements[0].textContent;
    content = articleText ? articleText : "";
  } else {
    // Fallback: get content from body, excluding scripts, styles, and navigation
    const bodyClone = document.body.cloneNode(true) as HTMLBodyElement;

    // Remove script, style, nav, footer, and header elements
    const elementsToRemove = bodyClone.querySelectorAll(
      "script, style, nav, footer, header"
    );
    elementsToRemove.forEach((el) => el.remove());

    const bodyText = bodyClone.textContent;
    content = bodyText ? bodyText : "";
  }

  // Clean up the content (remove extra whitespace)
  content = content.replace(/\s+/g, " ").trim();

  return {
    title,
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
