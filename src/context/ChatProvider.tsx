import React, { useReducer, ReactNode } from "react";
import { chatReducer, initialState } from "../reducers/chatReducer";
import { ChatContext } from "./ChatContext";
import { Message } from "../types/chatTypes";

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Update the sendMessage function to communicate with the background script
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: Date.now(),
    };

    dispatch({ type: "ADD_MESSAGE", payload: userMessage });
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // Send message to background script and get response
      const response = await new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { action: "search", query: content },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }

            // Format the search results into a readable response
            if (response && response.results) {
              if (response.results.length === 0) {
                resolve(
                  "I couldn't find any relevant information in your browsing history."
                );
              } else {
                // Enhanced response formatting for LLM-processed results
                const results = response.results;

                // Check if this is a server response with LLM formatting
                if (results[0].relevanceScore !== undefined) {
                  // If the server already provided a formatted response, use it
                  if (response.formattedResponse) {
                    resolve(response.formattedResponse);
                  } else {
                    // Format multiple results
                    let formattedResponse = `I found ${results.length} relevant pages in your browsing history:\n\n`;

                    results.slice(0, 3).forEach(
                      (
                        result: {
                          data: {
                            url: string;
                            scrapedTextData: string;
                            userId: string;
                          };
                          timestamp: string;
                          snippets?: string[];
                        },
                        index: number
                      ) => {
                        formattedResponse += `${index + 1}. **Page ${
                          index + 1
                        }**\n`;
                        formattedResponse += `   URL: ${result.data.url}\n`;

                        // Use snippets if available
                        if (result.snippets && result.snippets.length > 0) {
                          formattedResponse += `   Relevant content: "${result.snippets[0]}"\n\n`;
                        } else {
                          formattedResponse += `   Preview: "${result.data.scrapedTextData.substring(
                            0,
                            150
                          )}..."\n\n`;
                        }
                      }
                    );

                    resolve(formattedResponse);
                  }
                } else {
                  // Legacy formatting for local search results
                  const topResult = results[0];
                  resolve(
                    `I found this in your browsing history:\n\nURL: ${
                      topResult.data.url
                    }\n\n${topResult.data.scrapedTextData.substring(0, 200)}...`
                  );
                }
              }
            } else {
              resolve(
                "I received your message but couldn't process it properly."
              );
            }
          }
        );
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: Date.now(),
      };

      dispatch({ type: "ADD_MESSAGE", payload: botMessage });
    } catch (_error) {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to send message. Please try again.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <ChatContext.Provider value={{ state, dispatch, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
