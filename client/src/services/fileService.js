import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const createFile = async (fileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_URL}/api/file/create`,
      {
        name: fileData.name,
        workspaceId: fileData.workspaceId,
        content: fileData.content || ''
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('File creation error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


const deleteFile = async (fileId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/file/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getWorkspaceFiles = async (workspaceId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/file/workspace/${workspaceId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};


const updateFile = async (fileId, fileData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    console.log('Updating file with data:', fileData); 

    const response = await axios.put(
      `${API_URL}/api/file/${fileId}`,
      fileData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('File update error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

export const fileService = {
  createFile,
  deleteFile,
  getWorkspaceFiles,
  updateFile
};

 