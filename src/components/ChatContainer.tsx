import React from "react";
import ChatHeader from "./chat/ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./chat/ChatInput";
import { useChat } from "../hooks/useChat";
import "../assets/ChatContainer.css";

const ChatContainer: React.FC = () => {
  const { state, sendMessage } = useChat();

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  return (
    <div className="chat-container">
      <ChatHeader />
      <MessageList messages={state.messages} isLoading={state.isLoading} />
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={state.isLoading}
      />
      {state.error && <div className="error-message">{state.error}</div>}
    </div>
  );
};

export default ChatContainer;
