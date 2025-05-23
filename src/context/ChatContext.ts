import { createContext } from "react";
import { ChatAction, ChatState } from "../types/chatTypes";

type ChatContextType = {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => Promise<void>;
  isLoggedIn: boolean | null;
};

export const ChatContext = createContext<ChatContextType>({
  state: {
    messages: [],
    isLoading: false,
    error: null,
  },
  dispatch: () => null,
  sendMessage: async () => {},
  isLoggedIn: null,
});
