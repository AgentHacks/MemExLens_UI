export type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: number;
};

export type ChatState = {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
};

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_CHAT" };
