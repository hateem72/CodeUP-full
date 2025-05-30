import axios from "axios";

const API_URL = "http://localhost:5000/api/chat";

export const chatService = {
  getMessages: (workspaceId) => axios.get(`${API_URL}/${workspaceId}`, { withCredentials: true }),
  sendMessage: (data) => axios.post(`${API_URL}/send`, data, { withCredentials: true }),
};