import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

class TestService {
  
  async createTestWorkshop(testData) {
    const response = await axios.post(
      `${API_URL}/api/test-workshop/create`,
      testData,
      getAuthHeaders()
    );
    return response.data;
  }

  async getWorkspaceTests(workspaceId) {
    const response = await axios.get(
      `${API_URL}/api/test-workshop/${workspaceId}`,
      getAuthHeaders()
    );
    return response.data;
  }

  async submitTest(testWorkshopId, answers) {
    const response = await axios.post(
      `${API_URL}/api/test-workshop/submit`,
      { testWorkshopId, answers },
      getAuthHeaders()
    );
    return response.data;
  }

  async getTestSubmissions(testWorkshopId) {
    const response = await axios.get(
      `${API_URL}/api/test-workshop/submissions/${testWorkshopId}`,
      getAuthHeaders()
    );
    return response.data;
  }

  async evaluateSubmission(submissionId, score, feedback) {
    const response = await axios.put(
      `${API_URL}/api/test-workshop/evaluate/${submissionId}`,
      { score, feedback },
      getAuthHeaders()
    );
    return response.data;
  }


  async getTestByLink(uniqueLink) {
    const response = await axios.get(
      `${API_URL}/api/student/test/link/${uniqueLink}`,
      getAuthHeaders()
    );
    return response.data;
  }

  

  async submitTestAnswer(testId, answers) { 
    console.log("Submitting test with answers:", answers);
    const response = await axios.post(
      `${API_URL}/api/student/tests/${testId}/submit`, 
      { answers },
      getAuthHeaders()
    );
    return response.data;
  }

  async getStudentSubmissions() {
    const response = await axios.get(`${API_URL}/api/student/submissions`, getAuthHeaders());
    return response.data;
  }


    async getTests() {
      const response = await axios.get(`${API_URL}/api/teacher/tests`, getAuthHeaders());
      return response.data.tests || [];
    }
  
    async getSubmissionsByTest(testId) {
      const response = await axios.get(
        `${API_URL}/api/teacher/test/${testId}/submissions`,
        getAuthHeaders()
      );
      return response.data;
    }
  
    async getSubmissionById(submissionId) {
      const response = await axios.get(
        `${API_URL}/api/teacher/submission/${submissionId}`,
        getAuthHeaders()
      );
      return response.data;
    }
  
    async evaluateTestSubmission(submissionId, answers) {
      const response = await axios.put(
        `${API_URL}/api/teacher/submission/${submissionId}/evaluate`,
        { answers },
        getAuthHeaders()
      );
      return response.data;
    }
    async updateSubmission(submissionId, { marks, feedback }) {
      const response = await axios.put(
        `${API_URL}/api/teacher/submission/${submissionId}/evaluate`,
        { marks, feedback },
        getAuthHeaders()
      );
      return response.data;
    }


    async getTeacherTests() {
      const response = await axios.get(`${API_URL}/api/teacher/tests`, getAuthHeaders());
      return response.data.tests || [];
    }
  
    async getSubmissionsByTest(testId) {
      const response = await axios.get(
        `${API_URL}/api/teacher/test/${testId}/submissions`,
        getAuthHeaders()
      );
      return response.data;
    }
  
    async updateTestStatus(testId, status) {
      const response = await axios.put(
        `${API_URL}/api/teacher/test/${testId}/status`,
        { status },
        getAuthHeaders()
      );
      return response.data;
    }

  }

export default new TestService();