import React, { useState } from "react";
import axios from 'axios';  // For OpenAI API calls
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot, 
  faBrain, 
  faBook, 
  faBolt, 
  faTimes,
  faPlay,
  faCheckCircle,
  faPaperPlane,
  faBookOpen, faCode,
} from "@fortawesome/free-solid-svg-icons";
import { fetchAifyResponse } from "../services/geminiService";
import testService from "../services/testService";
import animationData from "../assets/animation.json"; 


const aiButtonStyles = `
  .ai-button {
    position: relative;
    color: #FFFFFF;
    padding: 10px 20px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    transform: translateY(0);
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .ai-button::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .ai-button:hover:not(:disabled) {
    transform: translateY(-4px);
     }

  .ai-button:hover::before {
    opacity: 1;
  }

  .ai-button:active:not(:disabled) {
    transform: translateY(2px);
     }

  .ai-button:disabled {
    background: #666666;
    cursor: not-allowed;
    box-shadow: none;
  }

  .ai-button .icon {
    margin-right: 8px;
  }

  .ai-button .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #1a1a1a;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }

  .ai-button {
  background: linear-gradient(45deg, #27ae60, #f1c40f);
  box-shadow: 0 6px 12px rgba(39, 174, 96, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3);
}
.ai-button:hover:not(:disabled) {
  box-shadow: 0 10px 20px rgba(39, 174, 96, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4);
}
.ai-button:active:not(:disabled) {
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.2), 0 1px 2px rgba(0, 0, 0, 0.2);
}
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;



if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = aiButtonStyles;
  document.head.appendChild(styleSheet);
}






const AIHelp = ({ editorContent, onContentChange }) => {
  const [loading, setLoading] = useState(false);

  const fetchAIHelpResponse = async () => {
    setLoading(true);
    try {
      const prompt = `
Analyze the following code:\n${editorContent}\n
Your task is to:
1. Carefully examine the code for syntax errors, logical mistakes, or runtime issues.
2. For each identified error, insert a single-line comment (using the appropriate comment syntax for the code's language, e.g., // for C++/JavaScript, # for Python) directly on the same line as the error, explaining the mistake briefly and clearly (e.g., "// Missing semicolon", "// Undefined variable").
3. Do not modify the original code unless the comment placement requires it (e.g., adding a space before the comment).
4. Return only the raw code with the added comments, preserving the original formatting, indentation, and structure.
5. Do not include any additional text, explanations, markdown formatting , language identifiers, or any symbols beyond the code and its inline comments.
6. If no errors are found, return the original code unchanged.
7. Detect the programming language implicitly from the code’s syntax and use the correct comment style accordingly.
Ensure the output is pure code, ready to be displayed as-is without any cleanup.
`;
      const res = await fetchAifyResponse(prompt);
      onContentChange(res || editorContent);
    } catch (error) {
      onContentChange(`${editorContent}\n// Sorry, AIHelp couldn’t analyze this code!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={fetchAIHelpResponse}
      className="ai-button w-full flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Loading...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faBrain} className="icon" />
          AIHelp
        </>
      )}
    </button>
  );
};

const AIDoc = ({ editorContent, onContentChange }) => {
  const [loading, setLoading] = useState(false);

  const fetchAIDocResponse = async () => {
    setLoading(true);
    try {
      const prompt = `
        Take the following code:\n${editorContent}\n
        Your task is to:
        1. Place the original code at the top of the response, exactly as provided, with no modifications to its content, structure, or formatting.
        2. Detect the programming language based on the code’s syntax (e.g., Python, C++, JavaScript) and use the appropriate comment style (e.g., # for Python, // for C++/JavaScript) for all subsequent comments.
        3. Below the original code, add detailed documentation as comments, including:
           - A clear explanation of what the code does, broken into simple terms.
           - An analysis of its key components (e.g., functions, variables, loops) and their purposes.
           - Any notable features or potential improvements, keeping the tone concise yet informative.
        4. Include a catchy, interactive real-life example of how this code could be used, written as comments. Make the example engaging, relatable, and fun (e.g., a game, a practical tool, or a creative scenario), showing how the code fits into a real-world context.
        5. Return only the raw code followed by the comments, with no additional text, explanations, markdown formatting (e.g., no backticks ), language identifiers , backslashes, or any symbols beyond the code and its comments.
        6. Ensure the output is pure code with comments, ready to be displayed as-is without cleanup.
      `;
      const res = await fetchAifyResponse(prompt);
      onContentChange(res || editorContent);
    } catch (error) {
      onContentChange(`${editorContent}\n// Sorry, AIDoc couldn’t generate documentation!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={fetchAIDocResponse}
      className="ai-button w-full flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Loading...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faBook} className="icon" />
          AIDoc
        </>
      )}
    </button>
  );
};




const AIEvaluate = ({ submission, questions, onEvaluationComplete }) => {
  const [loading, setLoading] = useState(false);

  const fetchAIEvaluateResponse = async () => {
    setLoading(true);
    try {
      const prompt = `
        Evaluate the following submission with multiple questions and codes:
        ${
          submission.answers.map((answer, index) => {
            const question = questions.find(q => q._id.toString() === answer.questionId.toString());
            return `
              Question ${index + 1}: ${question?.text || "N/A"}
              Max Marks: ${question?.marks || 0}
              Code:\n${answer.code || "No code submitted"}\n
            `;
          }).join("\n")
        }
        For each question:
        1. Assign marks (out of the max marks) based on correctness and adherence to the question.
        2. Provide short feedback (2-3 lines max) explaining the marks.
        Return the response as a raw JSON string, an array of objects like:
        [
          {"questionId": "id1", "marks": number, "feedback": "string"},
          {"questionId": "id2", "marks": number, "feedback": "string"}
        ]
        No Markdown or code block formatting (e.g., no \`\`\`json).
      `;
      const res = await fetchAifyResponse(prompt);
      console.log("Raw Gemini Response:", res);

      const evaluations = JSON.parse(res || '[]');
      if (!Array.isArray(evaluations)) throw new Error("Invalid evaluation format");

      onEvaluationComplete(submission._id, evaluations);
    } catch (error) {
      console.error("AI Evaluation Error:", error);
      const fallbackEvaluations = submission.answers.map((answer) => ({
        questionId: answer.questionId,
        marks: 0,
        feedback: "AI evaluation failed",
      }));
      onEvaluationComplete(submission._id, fallbackEvaluations);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={fetchAIEvaluateResponse}
      className="ai-button w-full flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Evaluating...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faRobot} className="icon" />
          AI Evaluate
        </>
      )}
    </button>
  );
};


const AIOptimizer = ({ editorContent, onContentChange }) => {
  const [loading, setLoading] = useState(false);

  const fetchAIOptimizerResponse = async () => {
    setLoading(true);
    try {
      const prompt = `
Analyze this code:\n${editorContent}\n
Your task is to suggest 2-3 optimized alternative approaches to solve the same problem more efficiently or elegantly. Follow these steps:
1. Start by including the original code exactly as provided, unchanged, at the beginning of your response.
2. Then, provide 2-3 distinct alternative solutions as comments in the same programming language as the original code.
3. For each alternative:
   - Prefix it with a comment like "// Alternative Approach 1:", "// Alternative Approach 2:", etc.
   - Include the complete, working code for that approach as a multi-line comment (e.g., using /* */ or // for each line).
   - Follow each alternative with a concise 2-3 line comment explaining its optimization or improvement (e.g., better time complexity, reduced memory usage, improved readability, or simpler logic). Avoid vague statements—be specific about the benefit (e.g., "Reduces time complexity from O(n^2) to O(n)").
4. Ensure each alternative achieves the same output or functionality as the original code.
5. Do not modify the original code unless explicitly part of an alternative solution.
6. Avoid unnecessary explanations outside the 2-3 line comments for each alternative—keep the response focused and compact.
7. If the original code has errors, note this briefly after the original code (e.g., "// Note: Original code has errors") and base alternatives on the intended functionality inferred from the code.
Return the response as plain text, formatted cleanly for readability, with no additional markdown (e.g., no backticks ).
`;
      const res = await fetchAifyResponse(prompt);
      onContentChange(res || editorContent);
    } catch (error) {
      onContentChange(`${editorContent}\n// Sorry, AIOptimizer couldn’t suggest alternatives!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={fetchAIOptimizerResponse}
      className="ai-button w-full flex items-center justify-center"
      disabled={loading}
    >
      {loading ? (
        <>
          <span className="spinner"></span>
          Loading...
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faBolt} className="icon" />
          AIOptimizer
        </>
      )}
    </button>
  );
  };
// New AIExplain Component with Floating Button and Popup

  



export {   AIHelp, AIDoc, AIOptimizer,AIEvaluate   };