import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faPhoneSlash, faEye, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import Vapi from "@vapi-ai/web";
import vivaService from "../services/vivaService";
import VivaEvaluate from './VivaEvaluate';

const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

const VapiStudentAssistant = ({ viva, studentId, onComplete }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [maxTotalMarks, setMaxTotalMarks] = useState(100);
  const [responses, setResponses] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [assistantScore, setAssistantScore] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [hasConcluded, setHasConcluded] = useState(false);
  const [expectedQuestion, setExpectedQuestion] = useState(null);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [showEndButton, setShowEndButton] = useState(false);
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const messagesEndRef = useRef(null);

  const videoUrls = {
    idle: "/videos/robot-start.mp4",
    listening: "/videos/robot-listening.mp4",
    speaking: "/videos/robot-speaking.mp4",
    thinking: "/videos/robot-listening.mp4",
    loading: "/videos/robot-start.mp4",
  };

  const currentVideoState = useMemo(() => {
    if (isConnecting) return "loading";
    if (isSpeaking) return "speaking";
    if (isListening || isWaitingForResponse) return "listening";
    if (hasConcluded && !callStarted) return "idle";
    return "idle";
  }, [isConnecting, isSpeaking, isListening, isWaitingForResponse, hasConcluded, callStarted]);

  const questions = useMemo(() => {
    return viva?.questions?.map((q) => q.question) || [];
  }, [viva]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuestion = useCallback(
    (index) => {
      if (hasConcluded) return;

      let messageContent;
      if (index < questions.length) {
        messageContent = questions[index];
        setExpectedQuestion(messageContent);
        setCurrentQuestionIndex(index);
        setIsWaitingForResponse(true);
      } else {
        messageContent = "The viva has concluded. Thank you for participating!";
        setHasConcluded(true);
        setIsWaitingForResponse(false);
      }

      vapi.send({
        type: "add-message",
        message: { role: "assistant", content: messageContent },
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: messageContent, timestamp: new Date() },
      ]);
    },
    [questions, hasConcluded]
  );

  const handleCallStart = useCallback(() => {
    setIsActive(true);
    setIsConnecting(false);
    setError(null);
    setCallStarted(true);
    setMessages([]);
    setResponses([]);
    setFeedback(null);
    setAssistantScore(0);
    setCurrentQuestionIndex(0);
    setIsWaitingForResponse(false);
    setHasConcluded(false);
    setExpectedQuestion(null);
    setIsListening(false);

    const introMessage = "Hello, I am your viva assistant. I'm here to conduct your viva examination. Let's dive in and have a great session!";
    
    vapi.send({
      type: "add-message",
      message: { role: "assistant", content: introMessage },
    });
    
    setMessages([
      { role: "assistant", content: introMessage, timestamp: new Date() },
    ]);

    setTimeout(() => {
      sendQuestion(0);
    }, 2000);
  }, [sendQuestion]);

  const handleCompleteViva = async () => {
    setProcessingTranscript(true);
    try {
      const generatedTranscript = messages
        .filter(m => m.role && m.content)
        .map(m => ({
          role: m.role.charAt(0).toUpperCase() + m.role.slice(1),
          content: m.content,
          timestamp: m.timestamp || new Date()
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      console.log("Generated Transcript:", generatedTranscript);
      setTranscript(generatedTranscript);

      if (!generatedTranscript || generatedTranscript.trim().length === 0) {
        throw new Error("No conversation transcript available");
      }

      setShowEndButton(true);
      setShowCompleteButton(false);
    } catch (err) {
      console.error("Error generating transcript:", err);
      setError("Failed to generate transcript: " + (err.message || "Unknown error"));
    } finally {
      setProcessingTranscript(false);
    }
  };

  const handleEndViva = async () => {
  try {
    // Submit evaluation data to backend
    await vivaService.submitVivaEvaluation(viva._id, {
      feedback,
      score: assistantScore,
      marks: {
        obtained: totalMarks,
        max: maxTotalMarks
      },
      transcript
    });

    // Call completion handler if provided
    if (onComplete) {
      onComplete({
        transcript,
        feedback,
        score: assistantScore,
        marks: {
          obtained: totalMarks,
          max: maxTotalMarks
        }
      });
    }

    // Finally stop the call
    vapi.stop();
    handleCallEnd();

  } catch (err) {
    console.error("Error ending viva:", err);
    setError("Failed to complete viva: " + (err.message || "Unknown error"));
  }
};

  const handleCallEnd = useCallback(() => {
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
    setCallStarted(false);
    setIsWaitingForResponse(false);
    setShowCompleteButton(false);
    setShowEndButton(false);
  }, []);

  const handleSpeechStart = useCallback(() => {
    setIsSpeaking(true);
    setIsListening(false);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setIsSpeaking(false);
    if (isWaitingForResponse) {
      setIsListening(true);
    }
  }, [isWaitingForResponse]);

  const handleError = useCallback((error) => {
    console.error("Vapi error:", error);
    setError(error.message || "Failed to connect to the assistant.");
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    setIsListening(false);
    setCallStarted(false);
    setIsWaitingForResponse(false);
    setHasConcluded(false);
    setMessages((prev) => [
      ...prev,
      { role: "system", content: "Connection error. Please try again.", timestamp: new Date() },
    ]);
  }, []);

  const handleMessage = useCallback((message) => {
    if (message.role === "assistant" && message.content) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message.content, timestamp: new Date() },
      ]);
    } else if (message.type === "transcript" && (message.role === "user" || message.role === "assistant")) {
      const transcriptContent = message.transcript;
      if (transcriptContent) {
        setMessages((prev) => [
          ...prev,
          { role: message.role, content: transcriptContent, timestamp: new Date() },
        ]);
      }
    } else if (message.type === "voice-input" && message.input) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message.input, timestamp: new Date() },
      ]);
    }
  }, []);
const handleEvaluate = async () => {
  setIsEvaluating(true);
  setError(null);

  try {
    if (!transcript || transcript.trim().length === 0) {
      throw new Error("No transcript available for evaluation");
    }

    // Generate feedback using AI
    const evaluationResult = await generateFeedbackWithAI(transcript);

    if (!evaluationResult.feedback) {
      throw new Error("Invalid feedback format from AI");
    }

    // Call completion handler with all evaluation data
    onEvaluationComplete({
      feedback: evaluationResult.feedback,
      score: evaluationResult.score || 0,
      marks: evaluationResult.marks || { obtained: 0, max: 100 },
      transcript
    });

  } catch (err) {
    console.error("Evaluation error:", err);
    setError("Failed to evaluate: " + (err.message || "Unknown error"));
  } finally {
    setIsEvaluating(false);
  }
};
  const endViva = useCallback(() => {
    if (callStarted) {
      vapi.send({
        type: "add-message",
        message: { role: "assistant", content: "The viva questions have concluded. Please complete the evaluation." },
      });
      setShowCompleteButton(true);
    }
  }, [callStarted]);

  const startViva = useCallback(async () => {
    try {
      setIsConnecting(true);
      setCallStarted(true);

      const vapiConfig = {
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `You are a viva assistant conducting an examination for a student. Follow these instructions:
              1. Start with: "Hello, I am your viva assistant. I'm here to conduct your viva examination. Let's dive in and have a great session!"
              2. Ask ${viva.numberOfQuestions} questions about ${viva.topic} at ${viva.difficulty} difficulty
              3. After each question, say: "Take your time and answer confidently!"
              4. After all questions, say: "The viva has concluded. Thank you for participating!"`
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
      };

      vapi.on("speech-start", handleSpeechStart);
      vapi.on("speech-end", handleSpeechEnd);
      vapi.on("call-start", handleCallStart);
      vapi.on("call-end", handleCallEnd);
      vapi.on("error", handleError);
      vapi.on("message", handleMessage);

      await vapi.start(vapiConfig);
    } catch (err) {
      console.error("startViva error:", err);
      handleError(err);
    }
  }, [
    viva,
    handleSpeechStart,
    handleSpeechEnd,
    handleCallStart,
    handleCallEnd,
    handleError,
    handleMessage,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (callStarted) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to leave? Your viva progress will be lost.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [callStarted]);

  useEffect(() => {
    return () => {
      if (callStarted) {
        vapi.stop();
      }
    };
  }, [callStarted]);

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (feedback && !callStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-100 rounded-lg p-6">
        <video
          src={videoUrls.idle}
          autoPlay
          loop
          muted
          className="w-48 h-48 mb-4 rounded-full shadow-lg"
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Viva Completed
          </h2>
          <div className="feedback-section">
            <h3 className="feedback-title">Your Performance</h3>
            <div className="feedback-content">
              <p className="mb-2">
                Score: <span className="feedback-score">{assistantScore}%</span>
              </p>
              <p className="mb-2">
                Marks: {totalMarks}/{maxTotalMarks}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const redirectParams = new URLSearchParams();
              redirectParams.append("score", assistantScore);
              redirectParams.append("feedback", feedback);
              window.location.href = `/viva-feedback?${redirectParams.toString()}`;
            }}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-300 shadow-md flex items-center mx-auto mt-4"
          >
            <FontAwesomeIcon icon={faEye} className="mr-2" />
            View Detailed Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-gray-100 rounded-lg p-6">
      <div className="relative">
        <video
          src={videoUrls[currentVideoState]}
          autoPlay
          loop
          muted
          className="w-48 h-48 rounded-full shadow-lg"
        />
        {isActive && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full shadow-md animate-pulse" />
        )}
      </div>

      <div className="mt-4 w-full text-center">
        {messages.length > 0 && (
          <p className="text-gray-800 text-lg font-semibold">
            {messages[messages.length - 1].content}
          </p>
        )}
      </div>

      <div className="mt-4 w-full text-center">
        {isConnecting && (
          <p className="text-gray-500 text-lg font-semibold">
            Connecting to the assistant...
          </p>
        )}
        {isActive && isSpeaking && (
          <p className="text-teal-500 text-lg font-semibold">
            Assistant is speaking...
          </p>
        )}
        {isActive && isListening && (
          <p className="text-blue-500 text-lg font-semibold">
            Listening to your response...
          </p>
        )}
      </div>

      {showCompleteButton && (
        <button
          onClick={handleCompleteViva}
          disabled={processingTranscript}
          className={`px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 shadow-md flex items-center mt-4 ${
            processingTranscript ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
          {processingTranscript ? "Processing..." : "Viva Complete"}
        </button>
      )}

      {showEndButton && (
        <button
          onClick={handleEndViva}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 shadow-md flex items-center mt-4"
        >
          <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
          End Viva
        </button>
      )}

      {!callStarted ? (
        <button
          onClick={startViva}
          className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors duration-300 shadow-md flex items-center mt-6"
        >
          <FontAwesomeIcon icon={faPhone} className="mr-2" />
          Start Viva
        </button>
      ) : (
        !showCompleteButton && !showEndButton && (
          <button
            onClick={endViva}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors duration-300 shadow-md flex items-center mt-6"
          >
            <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
            End Questions
          </button>
        )
      )}

      {transcript && showEndButton && (
        <div className="w-full mt-6">
          <VivaEvaluate 
            transcript={transcript}
            onEvaluationComplete={(evaluationData) => {
              setFeedback(evaluationData.feedback);
              setAssistantScore(evaluationData.score);
              if (evaluationData.marks) {
                setTotalMarks(evaluationData.marks.obtained);
                setMaxTotalMarks(evaluationData.marks.max);
              }
            }}
          />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default VapiStudentAssistant;