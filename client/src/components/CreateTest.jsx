import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../common/LoadingSpinner";

const CreateTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
const [showLinkPopup, setShowLinkPopup] = useState(false);
const [generatedLink, setGeneratedLink] = useState("");
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    timeLimit: "",
    questions: [{ question: "Write a Program to ", marks: "4", testCases: [] }]
  });

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: "", marks: "", testCases: [] }]
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/teacher/tests`,
        {
          ...formData,
          timeLimit: Number(formData.timeLimit)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
  
   
      if (response.data.test && response.data.test.uniqueLink) {
        setGeneratedLink(response.data.test.uniqueLink);
        setShowLinkPopup(true);
      } else {
        throw new Error("No test link received from server");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test");
      console.error("Create test error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner/>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-tertiary p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-octonary mb-6">Create Coding Test</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-octonary mb-2">Test Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 bg-quaternary text-octonary rounded border border-senary"
              required
              placeholder="Enter test title"
            />
          </div>

          <div>
            <label className="block text-octonary mb-2">Time Limit (minutes)</label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: e.target.value }))}
              className="w-full p-3 bg-quaternary text-octonary rounded border border-senary"
              required
              min="1"
              placeholder="Enter time limit"
            />
          </div>

          <div className="space-y-6">
            <label className="block text-octonary mb-2">Questions</label>
            {formData.questions.map((q, index) => (
              <div key={index} className="p-4 bg-quaternary rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-octonary font-medium">Question {index + 1}</h3>
                  {formData.questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                  className="w-full p-3 bg-tertiary text-octonary rounded border border-senary"
                  required
                  rows="4"
                  placeholder="Enter question description"
                />

                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) => handleQuestionChange(index, "marks", e.target.value)}
                  className="w-full p-3 bg-tertiary text-octonary rounded border border-senary"
                  required
                  min="1"
                  placeholder="Enter marks"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 transition-colors"
            >
              Add Question
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
      {showLinkPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-tertiary p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <h3 className="text-xl font-semibold text-teal mb-4">Test Created Successfully!</h3>
      <p className="text-octonary mb-4">Share this unique code with your students:</p>
      
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={generatedLink}
          readOnly
          className="w-full p-2 bg-quaternary text-octonary rounded border border-senary"
        />
        <button
  onClick={() => {
    const invitationMessage = `🚀🚀 Hey Future Coding Superstar! 🌟\n Get ready to flex your problem-solving muscles and show the world your coding prowess! 💪💻\nJoin the epic coding challenge on CodeUp using this exclusive link:   ${generatedLink}\n Let's see how you can crack the code and shine bright! 💡✨\n Remember, every line of code brings you one step closer to mastery. Let's do this! 🎉🏆`;
   navigator.clipboard.writeText(invitationMessage);
    
    const button = document.activeElement;
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = "Copy";
    }, 1000);
  }}
  className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 transition-colors"
>
  Copy
</button>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(`/test/${generatedLink}`)}
          className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 transition-colors"
        >
          View Test
        </button>
        <button
          onClick={() => {
            setShowLinkPopup(false);
            setGeneratedLink("");
          }}
          className="px-4 py-2 bg-senary text-white rounded hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default CreateTest;