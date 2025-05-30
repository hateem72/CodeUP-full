import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import testService from "../services/testService";
import LoadingSpinner from "../common/LoadingSpinner";

const TeacherEvaluation = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const data = await testService.getSubmissionById(submissionId);
        setSubmission(data);
        setEvaluations(
          data.answers.map((ans) => ({
            questionId: ans.questionId,
            marks: ans.marks || 0,
            feedback: ans.feedback || "",
          }))
        );
      } catch (err) {
        setError(err.response?.data.message || "Failed to load submission");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  const handleEvaluationChange = (questionId, field, value) => {
    setEvaluations((prev) =>
      prev.map((item) => 
        item.questionId.toString() === questionId.toString()
          ? { ...item, [field]: field === "marks" ? Number(value) : value }
          : item
      )
    );
  };

  const handleSaveEvaluation = async () => {
    try {
      await testService.evaluateTestSubmission(submissionId, evaluations);
      alert("Evaluation saved successfully!");
    } catch (err) {
      setError(err.response?.data.message || "Failed to save evaluation");
    }
  };

  if (loading) return <LoadingSpinner/>;
  if (error) return <div className="text-yellow">{error}</div>;
  if (!submission) return <div className="text-senary">Submission not found</div>;

  return (
    <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
      <h2 className="text-2xl font-bold text-teal mb-4">
        Evaluate Submission: {submission.test.title}
      </h2>
      <p className="text-septenary mb-6">
        Student: <span className="text-octonary">{submission.student.email}</span>
      </p>
      <div className="space-y-6">
        {submission.answers.map((ans, index) => {
          const question = submission.test.questions.find(
            (q) => q._id.toString() === ans.questionId.toString()
          );
          const evalData = evaluations.find(
            (e) => e.questionId.toString() === ans.questionId.toString()
          );
          return (
            <div
              key={ans.questionId}
              className="bg-quaternary p-4 rounded-lg border border-senary"
            >
              <h3 className="text-lg font-medium text-teal-300 mb-2">
                Question {index + 1}: {question ? question.question : "Unknown"}
              </h3>
              <pre className="text-octonary p-3 bg-background rounded-lg whitespace-pre-wrap text-sm mb-4">
                {ans.code || "No code submitted"}
              </pre>
              <div className="space-y-2">
                <label className="text-septenary">
                  Marks (out of {question?.marks || "N/A"}):
                  <input
                    type="number"
                    min="0"
                    max={question?.marks || 100}
                    value={evalData.marks}
                    onChange={(e) =>
                      handleEvaluationChange(ans.questionId, "marks", e.target.value)
                    }
                    className="ml-2 w-20 p-1 bg-quaternary text-octonary border border-senary rounded focus:outline-none focus:border-teal"
                  />
                </label>
                <label className="block text-septenary">
                  Feedback:
                  <textarea
                    value={evalData.feedback}
                    onChange={(e) =>
                      handleEvaluationChange(ans.questionId, "feedback", e.target.value)
                    }
                    className="mt-1 w-full p-2 bg-quaternary text-octonary border border-senary rounded focus:outline-none focus:border-teal"
                    rows="3"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={handleSaveEvaluation}
        className="mt-6 w-full bg-teal text-background py-3 rounded-lg font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-sm"
      >
        Save Evaluation
      </button>
    </div>
  );
};

export default TeacherEvaluation;