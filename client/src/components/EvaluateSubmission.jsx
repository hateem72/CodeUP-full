import React, { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

const EvaluateSubmission = ({ testId, token }) => {
  const [submissions, setSubmissions] = useState([]);
  const [evaluations, setEvaluations] = useState({});

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/teacher/tests/${testId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchSubmissions();
  }, [testId, token]);

  const handleEvaluationChange = (submissionId, questionId, field, value) => {
    setEvaluations((prev) => ({
      ...prev,
      [submissionId]: {
        ...prev[submissionId],
        [questionId]: { ...prev[submissionId]?.[questionId], [field]: value },
      },
    }));
  };

  const handleEvaluate = async (submissionId) => {
    const submissionEvals = Object.entries(evaluations[submissionId] || {}).map(([questionId, data]) => ({
      questionId,
      marks: Number(data.marks),
      feedback: data.feedback,
    }));
    try {
      const res = await axios.put(
        `http://localhost:5000/api/teacher/submissions/${submissionId}`,
        { evaluations: submissionEvals },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmissions((prev) =>
        prev.map((sub) => (sub._id === submissionId ? res.data : sub))
      );
    } catch (error) {
      alert(error.response?.data.message || "Failed to evaluate");
    }
  };

  return (
    <div className="bg-tertiary p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-octonary mb-4">Evaluate Submissions</h2>
      {submissions.length === 0 ? (
        <p className="text-senary">No submissions yet</p>
      ) : (
        submissions.map((submission) => (
          <div key={submission._id} className="mb-6">
            <h3 className="text-lg font-medium text-octonary">{submission.student.name}</h3>
            {submission.answers.map((ans) => (
              <div key={ans.questionId} className="mt-2">
                <Editor
                  height="150px"
                  defaultLanguage="javascript"
                  value={ans.code}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    padding: { top: 10 },
                    readOnly: true,
                  }}
                  className="border border-senary rounded mb-2"
                />
                <input
                  type="number"
                  value={evaluations[submission._id]?.[ans.questionId]?.marks || ans.marks || ""}
                  onChange={(e) =>
                    handleEvaluationChange(submission._id, ans.questionId, "marks", e.target.value)
                  }
                  placeholder="Marks"
                  className="w-20 p-1 bg-quaternary text-octonary rounded border border-senary mr-2"
                  disabled={ans.marks !== null}
                />
                <input
                  type="text"
                  value={evaluations[submission._id]?.[ans.questionId]?.feedback || ans.feedback || ""}
                  onChange={(e) =>
                    handleEvaluationChange(submission._id, ans.questionId, "feedback", e.target.value)
                  }
                  placeholder="Feedback"
                  className="w-full p-1 bg-quaternary text-octonary rounded border border-senary"
                  disabled={ans.marks !== null}
                />
              </div>
            ))}
            <button
              onClick={() => handleEvaluate(submission._id)}
              className="mt-2 bg-teal text-background p-2 rounded hover:bg-hover-teal transition-all duration-300"
              disabled={submission.answers.every((ans) => ans.marks !== null)}
            >
              Submit Evaluation
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default EvaluateSubmission;