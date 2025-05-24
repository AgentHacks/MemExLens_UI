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

            // Handle the new response format which just has a data field
            if (response && response.data) {
              resolve(response.data);
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
