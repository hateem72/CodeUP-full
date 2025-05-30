import React from "react";

const SubmitTest = ({ submission }) => {
  const { test, answers, submittedAt } = submission;

  console.log("Submission received in SubmitTest:", submission);

  return (
    <div className="bg-tertiary p-6 rounded-lg shadow-lg border border-quaternary">
      <h2 className="text-3xl font-bold text-teal mb-4">{test.title || "Untitled Test"}</h2>
      <p className="text-septenary mb-6 text-lg">
        Submitted on: <span className="text-octonary">{new Date(submittedAt).toLocaleString()}</span>
      </p>
      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-octonary">Submission Details</h3>
        {answers.length === 0 ? (
          <p className="text-senary text-lg">No answers submitted</p>
        ) : (
          answers.map((ans, index) => {
            const question = Array.isArray(test.questions)
              ? test.questions.find(q => q._id.toString() === ans.questionId.toString())
              : null;
            console.log("Answer:", ans);
            return (
              <div
                key={ans.questionId}
                className="bg-quaternary p-5 rounded-lg border border-senary shadow-md hover:border-teal transition-colors duration-200"
              >
                <h4 className="text-xl font-medium text-teal mb-3">
                  Question {index + 1}: {question ? question.question : "Unknown Question"}
                </h4>
                <pre className="text-octonary mt-2 p-4 bg-background rounded-lg whitespace-pre-wrap text-sm border border-quinary">
                  {ans.code || "No code submitted"}
                </pre>
                <div className="mt-4 space-y-2">
                  <p className="text-septenary">
                    <span className="font-medium text-teal">Marks:</span>{" "}
                    <span className={ans.marks > 0 ? "text-teal" : "text-yellow"}>
                      {ans.marks > 0 ? ans.marks : "Not evaluated yet"}
                    </span>
                  </p>
                  <p className="text-septenary">
                    <span className="font-medium text-teal">Feedback:</span>{" "}
                    <span className="text-octonary">{ans.feedback || "No feedback provided"}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SubmitTest;