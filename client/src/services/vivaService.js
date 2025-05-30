import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getTeacherVivas = async () => {
  const response = await axios.get(`${API_URL}/api/viva/teacher`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

const getSubmissionsByViva=async (vivaId)=> {
  if (!vivaId || !/^[a-fA-F0-9]{24}$/.test(vivaId)) {
    console.warn("Invalid or missing vivaId, returning empty submissions");
    return [];
  }
  try {
    const response = await axios.get(`${API_URL}/api/viva/${vivaId}/submissions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching submissions by viva:", error);
    return [];
  }
}

const createViva = async (vivaData) => {
  const response = await axios.post(`${API_URL}/api/viva`, vivaData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};





 const getStudentVivaSubmissions = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/viva/student/submissions`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student viva submissions:", error);
    if (error.response?.status === 401) {
      throw new Error("Authentication required");
    }
    throw error;
  }
};
const getVivaByUniqueCode = async (uniqueCode) => {
  const response = await axios.get(`${API_URL}/api/viva/link/${uniqueCode}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

const updateVivaStatus = async (vivaId, status) => {
  const response = await axios.patch(
    `${API_URL}/api/viva/${vivaId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  return response.data;
};

const submitVivaEvaluation = async (vivaId, evaluationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/viva/${vivaId}/evaluation`,
      evaluationData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    throw error;
  }
};



export default {
  getTeacherVivas,
  getSubmissionsByViva,
  submitVivaEvaluation,
  createViva,
  getStudentVivaSubmissions,
  getVivaByUniqueCode,
  updateVivaStatus,
};