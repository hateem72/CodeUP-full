import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import vivaService from "../services/vivaService";
import LoadingSpinner from "../common/LoadingSpinner";
import {AIEvaluate} from "../components/AIComponents";

const VivaSubmissions = ({ selectedViva }) => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState(null);

  useEffect(() => {
    if (!selectedViva || !selectedViva._id) return;

    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vivaService.getSubmissionsByViva(selectedViva._id);
        setSubmissions(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [selectedViva]);

  const handleEvaluationComplete = async (submissionId, evaluations) => {
    setIsEvaluating(true);
    setEvaluationError(null);
    try {
      const submission = submissions.find((sub) => sub._id === submissionId);
      if (!submission) {
        throw new Error("Submission not found");
      }

      const maxMarksPerQuestion =
        selectedViva.difficulty === "easy" ? 3 : selectedViva.difficulty === "medium" ? 5 : 7;

      const updatedAnswers = submission.answers.map((answer, index) => {
        const evalData = evaluations[index] || {
          marks: 0,
          feedback: "No evaluation returned",
        };

        return {
          question: answer.question,
          response: answer.response,
          marks: Math.min(Number(evalData.marks) || 0, maxMarksPerQuestion),
          feedback: evalData.feedback || "No feedback provided",
        };
      });

      const totalMarks = updatedAnswers.reduce((sum, ans) => sum + ans.marks, 0);
      const maxTotalMarks = updatedAnswers.length * maxMarksPerQuestion;

      await vivaService.submitViva(submission.viva, updatedAnswers); // Update submission

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId
            ? {
                ...sub,
                answers: updatedAnswers,
                totalMarks,
                maxTotalMarks,
                isEvaluated: true,
              }
            : sub
        )
      );

      console.log("Evaluation saved successfully:", {
        submissionId,
        totalMarks,
        maxTotalMarks,
      });
    } catch (error) {
      setEvaluationError(error.message || "Failed to save evaluation");
      console.error("Error updating submission:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!selectedViva) {
    return (
      <div className="p-6">
        <p className="text-senary text-lg font-medium mb-4">
          Select a viva to view submissions.
        </p>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-yellow text-lg font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-teal text-background rounded-full font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal mb-6">
        Submissions for {selectedViva.title}
      </h2>
      {evaluationError && (
        <p className="text-yellow text-lg font-medium mb-4">{evaluationError}</p>
      )}
      {submissions.length === 0 ? (
        <p className="text-senary text-center">No submissions yet.</p>
      ) : (
        <ul className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {submissions.map((submission) => (
            <li
              key={submission._id}
              className="p-4 bg-quaternary rounded-lg hover:bg-quinary transition-colors duration-300"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-octonary">
                  {submission.student?.email || "Unknown Student"}
                </h3>
                <span className="text-senary text-sm">
                  {submission.isEvaluated
                    ? `Score: ${submission.totalMarks}/${submission.maxTotalMarks}`
                    : "Not Evaluated"}
                </span>
              </div>
              <p className="text-septenary text-xs">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </p>
              <div className="mt-3">
                {submission.answers.map((answer, index) => (
                  <div key={index} className="mb-2">
                    <p className="text-senary text-sm font-medium">
                      Q{index + 1}: {answer.question}
                    </p>
                    <p className="text-octonary text-sm">
                      Response: {answer.response || "No response"}
                    </p>
                    {answer.marks > 0 && (
                      <p className="text-teal text-sm">
                        Marks: {answer.marks} | Feedback: {answer.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {!submission.isEvaluated && (
                <div className="mt-3 flex justify-end">
                  <AIEvaluate
                    questions={submission.answers.map((ans) => ({
                      question: ans.question,
                      response: ans.response,
                    }))}
                    onEvaluationComplete={(evaluations) =>
                      handleEvaluationComplete(submission._id, evaluations)
                    }
                    disabled={isEvaluating}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VivaSubmissions;