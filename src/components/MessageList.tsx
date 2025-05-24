import React, { useRef, useEffect } from "react";
import MessageItem from "./chat/MessageItem";
import { Message } from "../types/chatTypes";
import "/src/assets/MessageList.css";

type MessageListProps = {
  messages: Message[];
  isLoading: boolean;
};

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>✨ Welcome to MemExLens! ✨</p>
          <p>Your personal browsing assistant</p>
          <ul style={{ textAlign: "left", paddingInlineStart: "20px" }}>
            <li>"Just in what you remember..."</li>
            <li>"Ask anything that you read somewhere..."</li>
            <li>"Forgot where you read the that thing..."</li>
          </ul>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}
      {isLoading && (
        <div className="message bot-message loading-message">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
