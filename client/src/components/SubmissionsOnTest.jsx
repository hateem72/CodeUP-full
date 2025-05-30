import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AIEvaluate } from "./AIComponents";
import testService from "../services/testService";

const SubmissionsOnTest = ({ selectedTest, submissions: initialSubmissions }) => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState(initialSubmissions || []);
  const [isEvaluating, setIsEvaluating] = useState(false);
const [evaluationError, setEvaluationError] = useState(null);


  useEffect(() => {
    setSubmissions(initialSubmissions || []);
  }, [initialSubmissions]);
  console.log("Submissions:", submissions);
  console.log("Selected Test:", selectedTest);

  const handleEvaluationComplete = async (submissionId, evaluations) => {
    setIsEvaluating(true);
    setEvaluationError(null);
    try {
      
      const submission = submissions.find((sub) => sub._id === submissionId);
      if (!submission) {
        throw new Error("Submission not found");
      }
  
      const updatedAnswers = submission.answers.map((answer) => {
      
        const questionIndex = selectedTest.questions.findIndex(
          (q) => q._id.toString() === answer.questionId.toString()
        );
        const evalData = evaluations.find(
          (e) => e.questionId === `Question ${questionIndex + 1}`
        ) || {
          marks: 0,
          feedback: "No evaluation returned"
        };
  
        const question = selectedTest.questions[questionIndex];
        const maxMarks = question ? question.marks : 0;
  
        const marks = Math.min(Number(evalData.marks) || 0, maxMarks);
  
        return {
          questionId: answer.questionId,
          code: answer.code,
          marks: marks,
          feedback: evalData.feedback || "No feedback provided",
          maxMarks: maxMarks
        };
      });
  
      const totalMarks = updatedAnswers.reduce((sum, ans) => sum + ans.marks, 0);
      const maxTotalMarks = selectedTest.questions.reduce(
        (sum, q) => sum + (q.marks || 0),
        0
      );
  
      await testService.evaluateTestSubmission(submissionId, updatedAnswers);
  
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub._id === submissionId
            ? {
                ...sub,
                answers: updatedAnswers,
                totalMarks,
                maxTotalMarks,
                isEvaluated: true
              }
            : sub
        )
      );
  
      console.log("Evaluation saved successfully:", {
        submissionId,
        totalMarks,
        maxTotalMarks
      });
    } catch (error) {
      setEvaluationError(error.message);
      console.error("Error updating submission:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!selectedTest) {
    return (
      <section className="lg:col-span-3">
        <div className="bg-tertiary p-6 rounded-2xl shadow-xl flex items-center justify-center h-full">
          <p className="text-senary text-lg">Select a test to view submissions</p>
        </div>
      </section>
    );
  }

  return (
    <section className="lg:col-span-3">
      <div className="bg-tertiary p-6 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold text-teal mb-6">
          Submissions for {selectedTest.title}
        </h2>
        {submissions.length === 0 ? (
          <p className="text-senary text-center py-10">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-quaternary text-septenary">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-quaternary">
                {submissions.map((sub) => {
                  const totalMarks = sub.totalMarks || sub.answers.reduce((sum, ans) => sum + (ans.marks || 0), 0);
                  const maxTotalMarks = sub.maxTotalMarks || selectedTest.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
                  const isEvaluated = sub.answers.some((ans) => ans.marks > 0);
                  return (
                    <tr
                      key={sub._id}
                      className="hover:bg-quinary transition-colors duration-200"
                    >
                      <td className="p-4 text-octonary">{sub.student?.email || "Unknown Student"}</td>
                      <td className="p-4">
                        <span className={isEvaluated ? "text-teal" : "text-yellow"}>
                          {isEvaluated ? `${totalMarks}/${maxTotalMarks}` : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/teacher/evaluate/${sub._id}`)}
                          className="px-4 py-2 bg-yellow text-background rounded-lg hover:bg-hover-yellow transition-colors duration-300 font-semibold shadow-sm"
                        >
                          Review
                        </button>
                        <AIEvaluate
                          submission={sub}
                          questions={selectedTest.questions}
                          onEvaluationComplete={handleEvaluationComplete}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default SubmissionsOnTest;