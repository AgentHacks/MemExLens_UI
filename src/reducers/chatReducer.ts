import { ChatAction, ChatState } from "../types/chatTypes";

export const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "CLEAR_CHAT":
      return {
        ...state,
        messages: [],
      };
    default:
      return state;
  }
}
