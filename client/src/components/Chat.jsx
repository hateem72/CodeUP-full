import React, { useState, useEffect } from "react";
import { socketService } from "../services/socketService.js";
import { chatService } from "../services/chatService.js";

const Chat = ({ workspaceId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socketService.joinWorkspace(workspaceId);
    fetchMessages();
    socketService.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => socketService.off("newMessage");
  }, [workspaceId]);

  const fetchMessages = async () => {
    const response = await chatService.getMessages(workspaceId);
    setMessages(response.data);
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      socketService.emit("sendMessage", { workspaceId, content: newMessage });
      setNewMessage("");
    }
  };

  return (
    <div>
      <div className="h-80 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderId.displayName}: </strong>{msg.content}
          </div>
        ))}
      </div>
      <input
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="w-full p-2 border"
      />
      <button onClick={handleSend} className="mt-2 p-2 bg-green-500 text-white">
        Send
      </button>
    </div>
  );
};

export default Chat;