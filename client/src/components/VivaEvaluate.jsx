import React, { useState } from "react";
import { fetchAifyResponse } from "../services/geminiService";

const VivaEvaluate = ({ transcript, onEvaluationComplete, disabled, vivaId, studentId }) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const generateFeedbackWithAI = async (transcript) => {
    try {
      const prompt = `Evaluate this viva transcript. Extract questions and responses, then provide:
      - Overall feedback (2-3 sentences on performance)
      - Score (0-100)
      - Per-answer evaluation with marks (0-5) and brief feedback (1 sentence)
      
      Return JSON:
      {
        "feedback": string,
        "score": number,
        "answers": [{ "marks": number, "feedback": string }]
      }
      
      Transcript:
      ${transcript}`;

      const resultText = await fetchAifyResponse(prompt);
      const cleanedResponse = resultText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("AI evaluation error:", error);
      throw error;
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError(null);

    try {
      if (!transcript || transcript.trim().length === 0) {
        throw new Error("No transcript available for evaluation");
      }

      const evaluationResult = await generateFeedbackWithAI(transcript);

      if (!evaluationResult.feedback || !Array.isArray(evaluationResult.answers)) {
        throw new Error("Invalid evaluation format from AI");
      }

      onEvaluationComplete({
        feedback: evaluationResult.feedback,
        score: evaluationResult.score || 0,
        answers: evaluationResult.answers,
        transcript,
      });

    } catch (err) {
      console.error("Evaluation error:", err);
      setError("Failed to evaluate: " + (err.message || "Unknown error"));
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="evaluation-controls">
      {error && <div className="error-message text-yellow text-sm">{error}</div>}
      <button
        onClick={handleEvaluate}
        disabled={isEvaluating || disabled || !transcript}
        className={`px-4 py-2 bg-teal text-background rounded-lg font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-md ${
          isEvaluating || disabled || !transcript ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isEvaluating ? "Generating Feedback..." : "Generate Evaluation"}
      </button>
    </div>
  );
};

export default VivaEvaluate;