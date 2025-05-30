import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import TestEditorArea from "../components/TestEditorArea.jsx";
import testService from "../services/testService.js";
import LoadingSpinner from "../common/LoadingSpinner.jsx";
import ErrorDisplay from "../common/ErrorDisplay.jsx";

const TestWorkspace = () => {
  const { uniqueLink } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [test, setTest] = useState(null);
  const [codes, setCodes] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/test/link/${uniqueLink}`);
        setTest(res.data);
        setCodes(res.data.questions.map(() => ({ content: "", language: "javascript" })));
        setTimeLeft(res.data.timeLimit * 60); 
      } catch (err) {
        setError(err.response?.data.message || "Failed to load test");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [uniqueLink]);

  useEffect(() => {
    if (timeLeft === null || submitted) return; 
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer); 
    }
  }, [timeLeft, submitted]);

  const handleCodeChange = (index) => (updatedFile) => {
    const newCodes = [...codes];
    newCodes[index] = { content: updatedFile.content || "", language: updatedFile.language || "javascript" };
    setCodes(newCodes);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = test.questions.map((q, index) => ({
        questionId: q._id,
        code: codes[index].content,
      }));
      await testService.submitTestAnswer(test._id, answers); 
      setSubmitted(true);
      alert("Test submitted successfully!");
    } catch (err) {
      setError(err.response?.data.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    navigate(0);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} onRetry={handleRetry} />;

  if (!test) return <div className="text-senary bg-background h-screen">Test not found</div>;

  return (
    <div className="flex h-screen bg-background text-octonary">
      <div className="w-1/4 p-4 bg-tertiary border-r border-senary flex flex-col">
        <h2 className="text-2xl font-bold text-teal mb-4">{test.title}</h2>
        <div className="text-senary mb-4">
          Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <ul className="space-y-2 flex-1">
          {test.questions.map((q, index) => (
            <li
              key={q._id}
              className={`p-2 rounded cursor-pointer ${
                currentQuestion === index ? "bg-teal text-background" : "bg-quaternary hover:bg-hover-teal"
              }`}
              onClick={() => setCurrentQuestion(index)}
            >
              Question {index + 1} ({q.marks} marks)
            </li>
          ))}
        </ul>
        <button
          onClick={handleSubmit}
          disabled={submitted || timeLeft === 0 || submitting} 
          className={`mt-4 w-full py-2 rounded-lg text-background font-semibold transition-all duration-300 ${
            submitted || timeLeft === 0 || submitting
              ? "bg-senary opacity-50 cursor-not-allowed"
              : "bg-teal hover:bg-hover-teal"
          }`}
        >
          {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Test"}
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        {submitted ? (
          <div className="flex items-center justify-center h-full text-teal text-lg">
            Test Submitted!
          </div>
        ) : timeLeft === 0 ? (
          <div className="flex items-center justify-center h-full text-teal text-lg">
            Time’s Up!
          </div>
        ) : (
          <TestEditorArea
            file={{
              _id: `test-${test._id}-q${currentQuestion}`,
              name: `Question ${currentQuestion + 1}: ${test.questions[currentQuestion].question}`,
              content: codes[currentQuestion].content,
              language: codes[currentQuestion].language,
            }}
            user={user}
            files={test.questions.map((q, i) => ({
              _id: `test-${test._id}-q${i}`,
              name: `Question ${i + 1}`,
              content: codes[i].content,
              language: codes[i].language,
            }))}
            onFileChange={handleCodeChange(currentQuestion)}
            isTestMode={true}
          />
        )}
      </div>
    </div>
  );
};

export default TestWorkspace;