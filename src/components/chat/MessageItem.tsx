import React from "react";
import { Message } from "../../types/chatTypes";
import "../../assets/MessageItem.css";

type MessageItemProps = {
  message: Message;
};

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { content, sender, timestamp } = message;
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message ${sender}-message`}>
      <div className="message-content">{content}</div>
      <div className="message-timestamp">{formattedTime}</div>
    </div>
  );
};

export default MessageItem;
