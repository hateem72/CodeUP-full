import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faRobot, faPhoneSlash, faPhone } from "@fortawesome/free-solid-svg-icons";
import { VapiContext } from "../context/VapiContext.jsx";
import vivaService from "../services/vivaService";

const StudentViva = () => {
  const { vapi } = useContext(VapiContext);
  const { uniqueCode } = useParams();
  const navigate = useNavigate();
  const [viva, setViva] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [shouldStartCall, setShouldStartCall] = useState(false);
  const [vapiError, setVapiError] = useState(null);
  const videoRef = useRef(null);
  const speakingTimeoutRef = useRef(null);

  const videoUrls = {
    idle: "/videos/robot-start.mp4",
    listening: "/videos/robot-listening.mp4",
    speaking: "/videos/robot-speaking.mp4",
    thinking: "/videos/robot-listening.mp4",
    loading: "/videos/robot-start.mp4",
  };

  const [currentVideo, setCurrentVideo] = useState(videoUrls.idle);

  useEffect(() => {
    const fetchViva = async () => {
      try {
        const vivaData = await vivaService.getVivaByUniqueCode(uniqueCode);
        setViva(vivaData);
        const questionData = await vivaService.generateVivaQuestions(vivaData._id);
        setQuestions(questionData.questions);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load viva or questions");
      }
    };
    fetchViva();
  }, [uniqueCode]);

  useEffect(() => {
    if (error) {
      setCurrentVideo(videoUrls.idle);
      return;
    }

    if (!isActive && !isConnecting) {
      setCurrentVideo(videoUrls.idle);
    } else if (isConnecting) {
      setCurrentVideo(videoUrls.loading);
    } else if (isSpeaking) {
      setCurrentVideo(videoUrls.speaking);
    } else if (isSubmitting) {
      setCurrentVideo(videoUrls.thinking);
    } else if (isActive) {
      setCurrentVideo(videoUrls.listening);
    }
  }, [isActive, isConnecting, isSpeaking, isSubmitting, error]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Video play error:", e));
    }
  }, [currentVideo]);

  useEffect(() => {
    if (!vapi) {
      setVapiError('Vapi service is not initialized. Please try again later.');
    } else {
      setVapiError(null);
    }
  }, [vapi]);

  useEffect(() => {
    if (!vapi) return;

    const handleCallStart = () => {
      setIsActive(true);
      setIsConnecting(false);
      setMessages([]);
      setError(null);
      setSuccessMessage(null);
      setShouldStartCall(false);
    };

    const handleCallEnd = async () => {
      setIsActive(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      setShouldStartCall(false);

      if (answers.length > 0) {
        await submitViva();
      }
    };

    const handleSpeechStart = () => {
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }
    };

    const handleMessage = async (message) => {
      if (message.type === "transcript") {
        setMessages((prev) => [
          ...prev,
          {
            role: message.role,
            content: message.transcript,
            timestamp: new Date(),
          },
        ]);

        if (message.role === "user" && message.transcript.trim() && currentQuestionIndex < questions.length) {
          const response = message.transcript.trim();
          setAnswers((prev) => [
            ...prev,
            { question: questions[currentQuestionIndex], response },
          ]);

          if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex((prev) => prev + 1);
            await speakQuestion(questions[currentQuestionIndex + 1]);
          } else {
            vapi.stop();
          }
        }

        if (message.role === "assistant" && !isSpeaking) {
          if (speakingTimeoutRef.current) {
            clearTimeout(speakingTimeoutRef.current);
            speakingTimeoutRef.current = null;
          }
          setIsSpeaking(true);
          speakingTimeoutRef.current = setTimeout(() => {
            setIsSpeaking(false);
            speakingTimeoutRef.current = null;
          }, 3000);
        }
      }
    };

    const handleError = (error) => {
      if (isActive || isConnecting) {
        setIsActive(false);
        setIsConnecting(false);
        setIsSpeaking(false);
        setShouldStartCall(false);
        setIsSubmitting(false);
        if (speakingTimeoutRef.current) {
          clearTimeout(speakingTimeoutRef.current);
          speakingTimeoutRef.current = null;
        }
        setError("Failed to start conversation. Please check your Vapi configuration.");
      }
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.on("message", handleMessage);
      vapi.off("error", handleError);
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }
    };
  }, [vapi, questions, currentQuestionIndex]);

  useEffect(() => {
    if (isOpen && shouldStartCall && !isActive && vapi && !isConnecting && questions.length > 0) {
      const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        setError("Assistant ID is not defined. Please set VITE_VAPI_ASSISTANT_ID in your environment variables.");
        setShouldStartCall(false);
        return;
      }

      setIsConnecting(true);
      vapi.start(assistantId).then(() => {
        speakQuestion(questions[0]);
      }).catch((err) => {
        console.error("Vapi start error:", err);
        setIsConnecting(false);
        setShouldStartCall(false);
        setError("Failed to start call. Check your browser or network settings.");
      });
    }
  }, [isOpen, shouldStartCall, isActive, vapi, questions]);

  const speakQuestion = async (question) => {
    if (vapi && question) {
      await vapi.say(`Please answer the following question: ${question}`);
    }
  };

  const submitViva = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Evaluate answers
      const evaluations = await Promise.all(
        answers.map(async (ans) => {
          const evalResult = await vivaService.evaluateAnswer({
            question: ans.question,
            response: ans.response,
          });
          return evalResult;
        })
      );

      // Generate overall feedback
      const feedbackResult = await vivaService.generateFeedback({
        questions: answers.map(a => a.question),
        responses: answers.map(a => a.response),
        evaluations,
      });

      // Prepare submission
      const submissionAnswers = answers.map((ans, index) => ({
        question: ans.question,
        response: ans.response,
        marks: evaluations[index].marks || 0,
        feedback: evaluations[index].explanation || "",
      }));

      await vivaService.submitViva(viva._id, submissionAnswers);
      setSuccessMessage("Viva submitted successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err) {
      setError("Failed to submit viva: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChat = () => {
    if (isOpen && vapi) {
      vapi.stop();
      setIsActive(false);
      setIsConnecting(false);
      setShouldStartCall(false);
      setError(null);
      setSuccessMessage(null);
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      navigate("/dashboard");
    }
  };

  const startCall = () => {
    if (!isActive && !isConnecting && questions.length > 0) {
      setShouldStartCall(true);
      setSuccessMessage(null);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
      setIsActive(false);
      setIsConnecting(false);
      setShouldStartCall(false);
      setError(null);
    }
  };

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  if (!viva) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-yellow text-lg">{error || "Loading viva..."}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-octonary mb-6">{viva.title}</h2>
      {vapiError && (
        <div className="text-red-500 text-lg font-semibold drop-shadow-md mb-4">
          {vapiError}
        </div>
      )}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShouldStartCall(true);
          }}
          className="w-full flex items-center justify-center bg-teal text-white py-3 px-5 rounded-xl font-semibold uppercase shadow-lg hover:bg-hover-teal transition-all duration-300"
        >
          <FontAwesomeIcon icon={faRobot} className="mr-2" />
          Start Viva
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 p-4"
          >
            <div className="relative flex flex-col items-center bg-tertiary p-6 rounded-lg shadow-lg max-w-md w-full mx-auto">
              <div className="relative w-full h-64 bg-quaternary rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  src={currentVideo}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              <button
                onClick={toggleChat}
                className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors duration-200 z-50"
              >
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>

              <div className="mt-4 w-full text-center">
                {successMessage ? (
                  <div className="text-teal text-lg font-semibold drop-shadow-md">
                    {successMessage}
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-lg font-semibold drop-shadow-md">
                    {error}
                  </div>
                ) : isSubmitting ? (
                  <div className="text-yellow text-lg font-semibold drop-shadow-md">
                    Submitting viva...
                  </div>
                ) : latestMessage ? (
                  <div className="text-white text-lg font-semibold drop-shadow-md">
                    {latestMessage.content}
                  </div>
                ) : isConnecting ? (
                  <div className="text-yellow text-lg font-semibold drop-shadow-md">
                    Connecting to AI Agent...
                  </div>
                ) : (
                  <div className="text-gray-400 text-lg font-semibold drop-shadow-md">
                    {isActive ? "Listening..." : 'Click "Start Call" to begin...'}
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-4">
                {!isActive && !isConnecting && !isSubmitting && (
                  <button
                    onClick={startCall}
                    className="px-6 py-3 bg-teal text-white rounded font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-md flex items-center"
                    disabled={questions.length === 0}
                  >
                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                    Start Call
                  </button>
                )}
                {isActive && (
                  <button
                    onClick={endCall}
                    className="px-6 py-3 bg-red-500 text-white rounded font-semibold hover:bg-red-600 transition-colors duration-300 shadow-md flex items-center"
                  >
                    <FontAwesomeIcon icon={faPhoneSlash} className="mr-2" />
                    End Call
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentViva;