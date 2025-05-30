import axios from "axios";
import { fetchAifyResponse } from "../services/geminiService";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const roadmapService = {
  generateRoadmap: async (interest) => {
    try {
      console.log("Generating roadmap with AI for:", interest);
      const aiPrompt = `
        Generate a detailed learning roadmap for "${interest}" aimed at coding enthusiasts. Include 5-7 key milestones, each with:
        - A unique ID (e.g., "node1", "node2")
        - A title (e.g., "Learn Basics of ${interest}")
        - A description (short, 15-20 words)
        - A task (e.g., "Solve 5 problems on X")
        - 2-3 relevant resource links (real URLs from reputable sources)
        - Exactly 3 practice questions, each a coding problem relevant to the milestone, starting with "Write a program to..."
        Examples:
        - For Linked Lists: "Write a program to reverse a singly linked list"
        - For Arrays: "Write a program to find the maximum element in an array"
        - For Strings: "Write a program to check if a string is a palindrome"
        Return the result as a JSON object with "interest" and "nodes" fields. Ensure each node has a "practiceQuestions" array with 3 questions, each with a "question" field (string).
        Example for Linked Lists:
        {
          "interest": "Linked List Data Structure",
          "nodes": [
            {
              "id": "node1",
              "title": "Learn Basics of Linked Lists",
              "description": "Understand nodes, pointers, and basic operations.",
              "task": "Implement a singly linked list and traverse it.",
              "resources": ["https://www.geeksforgeeks.org/linked-list-data-structure/", "https://www.tutorialspoint.com/data_structures_algorithms/linked_list_algorithm.htm"],
              "practiceQuestions": [
                {"question": "Write a program to insert a node at the end of a singly linked list"},
                {"question": "Write a program to print all elements of a linked list"},
                {"question": "Write a program to find the length of a linked list"}
              ]
            },
            ...
          ]
        }
      `;

      const aiResponse = await fetchAifyResponse(aiPrompt);
      console.log("Raw AI response:", aiResponse);

      let roadmapData;
      try {
        const cleaned = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
        roadmapData = JSON.parse(cleaned);
      } catch (parseError) {
        console.error("Parse error:", parseError);
        throw new Error("Failed to parse AI response");
      }

      if (!roadmapData?.interest || !Array.isArray(roadmapData?.nodes)) {
        throw new Error("Invalid AI response structure");
      }

      // Validate practice questions
      for (const node of roadmapData.nodes) {
        if (!node.practiceQuestions || node.practiceQuestions.length !== 3) {
          throw new Error(`Node ${node.id} does not have exactly 3 practice questions`);
        }
        node.practiceQuestions = node.practiceQuestions.map((q) => ({
          question: q.question,
          fileId: null, // Will be set by backend
        }));
      }

      const response = await axios.post(
        `${BASE_URL}/api/roadmap/generate`,
        roadmapData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Generate roadmap error:", {
        message: error.message,
        response: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message || error.message || "Failed to generate roadmap"
      );
    }
  },

  fetchRoadmap: async () => {
    try {
      console.log("Attempting to fetch roadmap...");
      const response = await axios.get(`${BASE_URL}/api/roadmap`, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Roadmap fetch successful:", response.data);
      const { roadmaps, progress } = response.data;
      if (!roadmaps || roadmaps.length === 0) {
        throw new Error("No roadmap found");
      }
      // Return the first roadmap for backward compatibility
      return { roadmap: roadmaps[0], progress };
    } catch (error) {
      console.error("Roadmap fetch error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 404 || error.message === "No roadmap found") {
        throw new Error("No roadmap found");
      } else if (error.response?.status === 401) {
        throw new Error("Please login to view your roadmap");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch roadmap");
      }
    }
  },

  fetchRoadmapById: async (id) => {
    try {
      console.log(`Attempting to fetch roadmap with ID: ${id}`);
      const response = await axios.get(`${BASE_URL}/api/roadmap/${id}`, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("Roadmap fetch by ID successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Roadmap fetch by ID error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 404) {
        throw new Error("Roadmap not found");
      } else if (error.response?.status === 401) {
        throw new Error("Please login to view your roadmap");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch roadmap");
      }
    }
  },

  fetchUserRoadmaps: async () => {
    try {
      console.log("Attempting to fetch user roadmaps...");
      const response = await axios.get(`${BASE_URL}/api/roadmap`, {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("User roadmaps fetch successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("User roadmaps fetch error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.response?.status === 404) {
        return { roadmaps: [], progress: {} }; // No roadmaps exist
      } else if (error.response?.status === 401) {
        throw new Error("Please login to view your roadmaps");
      } else {
        throw new Error(error.response?.data?.message || "Failed to fetch roadmaps");
      }
    }
  },

  updateProgress: async (nodeId, status) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/roadmap/progress`,
        { nodeId, status },
        { 
          withCredentials: true,
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update progress");
    }
  },

  updateRoadmap: async (interest) => {
    try {
      const aiPrompt = `
        Update an existing roadmap for "${interest}". Provide 5-7 new milestones with:
        - Unique IDs
        - Titles
        - Descriptions
        - Tasks
        - Resource links
        - Exactly 3 practice questions, each a coding problem starting with "Write a program to..."
        Examples:
        - For Linked Lists: "Write a program to reverse a linked list"
        - For Arrays: "Write a program to sort an array"
        - For Strings: "Write a program to reverse a string"
        Return as JSON with "interest" and "nodes", no markdown (e.g., no backticks).
        Ensure each node has a "practiceQuestions" array with 3 questions, each with a "question" field.
      `;
      const aiResponse = await fetchAifyResponse(aiPrompt);
      const roadmapData = JSON.parse(aiResponse);

      // Validate practice questions
      for (const node of roadmapData.nodes) {
        if (!node.practiceQuestions || node.practiceQuestions.length !== 3) {
          throw new Error(`Node ${node.id} does not have exactly 3 practice questions`);
        }
        node.practiceQuestions = node.practiceQuestions.map((q) => ({
          question: q.question,
          fileId: null,
        }));
      }

      const response = await axios.put(`${BASE_URL}/api/roadmap/update`, roadmapData, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update roadmap");
    }
  },

  deleteRoadmap: async (roadmapId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/api/roadmap/${roadmapId}`, {
        withCredentials: true,
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete roadmap");
    }
  },
};

export default roadmapService;