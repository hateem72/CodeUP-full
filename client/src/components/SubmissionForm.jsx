import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { testWorkshopService } from "../services/testService.js";

const SubmissionForm = ({ workshop, user }) => {
  const [answers, setAnswers] = useState(workshop.questions.map(() => ""));

  const handleSubmit = async () => {
    const submission = {
      testWorkshopId: workshop._id,
      answers: workshop.questions.map((q, i) => ({ questionId: q._id, code: answers[i] })),
    };
    await testWorkshopService.submitTest(submission);
    alert("Test submitted successfully!");
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">{workshop.title}</h3>
      {workshop.questions.map((question, index) => (
        <div key={question._id} className="mb-6">
          <p className="text-lg font-semibold mb-2">{question.questionText}</p>
          <Editor
            height="200px"
            language={question.language}
            value={answers[index]}
            onChange={(value) => {
              const newAnswers = [...answers];
              newAnswers[index] = value;
              setAnswers(newAnswers);
            }}
            className="border rounded"
          />
        </div>
      ))}
      <button onClick={handleSubmit} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Submit Test
      </button>
    </div>
  );
};

export default SubmissionForm;