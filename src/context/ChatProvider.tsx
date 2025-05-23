import React, { useReducer, ReactNode, useEffect, useState } from "react";
import { chatReducer, initialState } from "../reducers/chatReducer";
import { ChatContext } from "./ChatContext";
import { Message } from "../types/chatTypes";
import { isAuthenticated } from "../services/authServices";

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsLoggedIn(authStatus);
    };
    checkAuth();
  }, []);

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
                          title: string;
                          url: string;
                          snippets?: string[];
                          content: string;
                        },
                        index: number
                      ) => {
                        formattedResponse += `${index + 1}. **${
                          result.title
                        }**\n`;
                        formattedResponse += `   URL: ${result.url}\n`;

                        // Use snippets if available
                        if (result.snippets && result.snippets.length > 0) {
                          formattedResponse += `   Relevant content: "${result.snippets[0]}"\n\n`;
                        } else {
                          formattedResponse += `   Preview: "${result.content.substring(
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
                    `I found this in your browsing history:\n\nFrom: ${
                      topResult.title
                    }\nURL: ${topResult.url}\n\n${topResult.content.substring(
                      0,
                      200
                    )}...`
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
    <ChatContext.Provider value={{ state, dispatch, sendMessage, isLoggedIn }}>
      {children}
    </ChatContext.Provider>
  );
};
