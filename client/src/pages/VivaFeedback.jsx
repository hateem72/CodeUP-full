import React from "react";
import { useLocation } from "react-router-dom";

const VivaFeedback = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const score = decodeURIComponent(searchParams.get("score") || "0");
  console.log("Score:", score);
  const feedback = decodeURIComponent(searchParams.get("feedback") || "No feedback available.");
  console.log("Feedback:", feedback);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-center text-blue-600">Viva Feedback</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Score: {score}/100</h2>
      </div>
      <div className="prose prose-sm">
        {feedback.split("\n").map((line, index) => (
          <p key={index} className="text-gray-700">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default VivaFeedback;