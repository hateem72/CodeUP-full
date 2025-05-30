import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/workspace`;


axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const workspaceService = {
    getWorkspaces: async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      throw error.response?.data || { message: "Failed to fetch workspaces" };
    }
  },

    getWorkspace: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching workspace:", error);
      throw error.response?.data || { message: "Failed to fetch workspace" };
    }
  },

    getUserWorkspaces: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}/workspaces`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user workspaces:", error);
      throw error.response?.data || { message: "Failed to fetch user workspaces" };
    }
  },

    createWorkspace: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/create`, {
        name: data.name,
        isPublic: data.isPublic
      });
      return response.data;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error.response?.data || { message: "Failed to create workspace" };
    }
  },

    inviteUser: async ({ workspaceId, email }) => {
    try {
      const response = await axios.post(`${API_URL}/invite`, {
        workspaceId,
        email
      });
      return response.data;
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error.response?.data || { message: "Failed to invite user" };
    }
  },

  deleteWorkspace: async (workspaceId) => {
    try {
      const response = await axios.delete(`${API_URL}/${workspaceId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw error.response?.data || { message: "Failed to delete workspace" };
    }
  },

    updateWorkspace: async (workspaceId, data) => {
    try {
      const response = await axios.put(`${API_URL}/${workspaceId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error.response?.data || { message: "Failed to update workspace" };
    }
  },

    removeMember: async (workspaceId, userId) => {
    try {
      const response = await axios.delete(`${API_URL}/${workspaceId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing member:", error);
      throw error.response?.data || { message: "Failed to remove member" };
    }
  }
};