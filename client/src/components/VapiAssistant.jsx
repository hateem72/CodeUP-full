import React, { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faRobot, faPhoneSlash, faPhone } from "@fortawesome/free-solid-svg-icons";
import { VapiContext } from "../context/VapiContext.jsx";

const VapiAssistant = ({ onVivaCreated }) => {
  const { vapi } = useContext(VapiContext);
  const [isOpen, setIsOpen] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAwaitingTitle, setIsAwaitingTitle] = useState(false);
  const [vivaTitle, setVivaTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [inputText, setInputText] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [shouldStartCall, setShouldStartCall] = useState(false);
  const [callId, setCallId] = useState(null);
  const callIdRef = useRef(null);
  const speakingTimeoutRef = useRef(null);
  const [vapiError, setVapiError] = useState(null);
  const videoRef = useRef(null);

  const videoUrls = {
    idle: "/videos/robot-start.mp4",
    listening: "/videos/robot-listening.mp4",
    speaking: "/videos/robot-speaking.mp4",
    thinking: "/videos/robot-listening.mp4",
    loading: "/videos/robot-start.mp4",
  };

  const [currentVideo, setCurrentVideo] = useState(videoUrls.idle);

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
    } else if (isAwaitingTitle) {
      setCurrentVideo(videoUrls.thinking);
    } else if (isActive) {
      setCurrentVideo(videoUrls.listening);
    }
  }, [isActive, isConnecting, isSpeaking, isAwaitingTitle, error]);

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

    const handleCallStart = async () => {
      setIsActive(true);
      setIsConnecting(false);
      setMessages([]);
      setError(null);
      setSuccessMessage(null);
      setShouldStartCall(false);
      setIsAwaitingTitle(false);
      setVivaTitle("");

      try {
        const response = await fetch("https://api.vapi.ai/call", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_VAPI_PRIVATE_KEY}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch call list");
        }
        const calls = await response.json();
        const latestCall = calls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        if (latestCall) {
          setCallId(latestCall.id);
          callIdRef.current = latestCall.id;
          console.log("Set callId:", latestCall.id);
        } else {
          console.error("No recent calls found");
        }
      } catch (err) {
        console.error("Error fetching callId:", err);
      }
    };

    const handleCallEnd = async () => {
      console.log("handleCallEnd triggered");
      setIsActive(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      setShouldStartCall(false);
      setError(null);

      if (callIdRef.current) {
        const maxRetries = 5;
        let retries = 0;
        let callData = null;

        while (retries < maxRetries) {
          try {
            const response = await fetch(`https://api.vapi.ai/call/${callIdRef.current}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_VAPI_PRIVATE_KEY}`,
              },
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch call details, status: ${response.status}`);
            }
            callData = await response.json();
            console.log("Call data (attempt " + (retries + 1) + "):", callData);

            if (callData.status === "ended") {
              console.log("Call status is ended with reason:", callData.endedReason);
              break;
            }

            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
          } catch (err) {
            console.error("Error fetching call data (attempt " + (retries + 1) + "):", err);
            retries++;
            if (retries === maxRetries) {
              setError("Could not retrieve call details after multiple attempts. Please try again.");
              return;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }

        if (!callData) {
          setError("Could not retrieve call details. Please try again.");
          return;
        }

        try {
          let topic = "";
          let numQuestions = "5";
          let difficulty = "medium";

          if (callData.transcript) {
            console.log("Transcript found, attempting to parse variables from transcript:", callData.transcript);
            const transcriptLines = callData.transcript.split("\n");

            for (let i = 0; i < transcriptLines.length; i++) {
              const line = transcriptLines[i].toLowerCase();
              console.log(`Transcript line ${i}:`, line);
              if (line.includes("topic") && line.startsWith("ai:")) {
                if (i + 1 < transcriptLines.length && transcriptLines[i + 1].startsWith("User:")) {
                  const userResponse = transcriptLines[i + 1].replace("User: ", "").trim();
                  topic = userResponse.replace(/\./g, "").trim();
                  console.log("Parsed topic from transcript:", topic);
                }
              }
              if (line.includes("difficulty") && line.startsWith("ai:")) {
                if (i + 1 < transcriptLines.length && transcriptLines[i + 1].startsWith("User:")) {
                  const userResponse = transcriptLines[i + 1].replace("User: ", "").replace(/\./g, "").trim();
                  if (["easy", "medium", "hard"].includes(userResponse.toLowerCase())) {
                    difficulty = userResponse.toLowerCase();
                    console.log("Parsed difficulty from transcript:", difficulty);
                  }
                }
              }
              if (line.includes("how many questions") && line.startsWith("ai:")) {
                if (i + 1 < transcriptLines.length && transcriptLines[i + 1].startsWith("User:")) {
                  const userResponse = transcriptLines[i + 1].replace("User: ", "").replace(/\./g, "").trim();
                  if (/^\d+$/.test(userResponse)) {
                    numQuestions = userResponse;
                    console.log("Parsed numQuestions from transcript:", numQuestions);
                  }
                }
              }
            }
          }

          if (!topic) {
            setError("No topic provided from the conversation. Please enter the topic manually.");
            setIsAwaitingTitle(true);
            return;
          }

          setNumberOfQuestions(parseInt(numQuestions, 10));
          setDifficulty(difficulty.toLowerCase());
          setInputText(topic);
          setIsAwaitingTitle(true);
        } catch (err) {
          setError("Error processing conversation data. Please try again.");
          console.error("Error in call-end:", err);
        }
      } else {
        setError("Could not retrieve call details. Please try again.");
        console.error("callId is not set on call-end event");
      }

      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
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

    const handleMessage = (message) => {
      if (message.type === "transcript") {
        setMessages((prev) => [
          ...prev,
          {
            role: message.role,
            content: message.transcript,
            timestamp: new Date(),
          },
        ]);
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
        setIsAwaitingTitle(false);
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
      console.log("Unregistering VapiAssistant event listeners");
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
        speakingTimeoutRef.current = null;
      }
    };
  }, [vapi]);

  useEffect(() => {
    if (isOpen && shouldStartCall && !isActive && vapi && !isConnecting) {
      const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;
      if (!assistantId) {
        setError("Assistant ID is not defined. Please set VITE_VAPI_ASSISTANT_ID in your environment variables.");
        setShouldStartCall(false);
        return;
      }

      setIsConnecting(true);
      vapi.start(assistantId).catch((err) => {
        console.error("Vapi start error:", err);
        setIsConnecting(false);
        setShouldStartCall(false);
        setError("Failed to start call. Check your browser or network settings.");
      });
    }
  }, [isOpen, shouldStartCall, isActive, vapi]);

  const toggleChat = () => {
    if (isOpen && vapi) {
      vapi.stop();
      setIsActive(false);
      setIsConnecting(false);
      setShouldStartCall(false);
      setError(null);
      setSuccessMessage(null);
      setIsAwaitingTitle(false);
      setVivaTitle("");
    }
    setIsOpen(!isOpen);
  };

  const startCall = () => {
    if (!isActive && !isConnecting) {
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

  const handleCreateViva = () => {
    if (!inputText.trim() || !vivaTitle.trim()) {
      setError("Please enter both a topic and a title.");
      return;
    }

    const vivaData = {
      title: vivaTitle,
      topic: inputText,
      numberOfQuestions,
      difficulty,
    };

    onVivaCreated(vivaData);
    setSuccessMessage("Viva created successfully.");
    setIsOpen(false);
  };

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div>
      {vapiError && (
        <div className="text-red-500 text-lg font-semibold drop-shadow-md">
          {vapiError}
        </div>
      )}
      {!isOpen && (
        <button
          onClick={() => {
            toggleChat();
            setShouldStartCall(true);
          }}
          className="w-full flex items-center justify-center bg-teal text-white py-3 px-5 rounded-xl font-semibold uppercase shadow-lg hover:bg-hover-teal transition-all duration-300"
        >
          <FontAwesomeIcon icon={faRobot} className="mr-2" />
          Create Viva with AI Assistant
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
                ) : isAwaitingTitle ? (
                  <div className="text-yellow text-lg font-semibold drop-shadow-md">
                    Please enter the title for the viva below.
                  </div>
                ) : latestMessage ? (
                  <div className="text-white text-lg font-semibold drop-shadow-md">
                    {latestMessage.content}
                  </div>
                ) : isConnecting ? (
                  <div className="text-yellow text-lg font-semibold drop-shadow-md">
                    Connecting to AiAgent in a few seconds...
                  </div>
                ) : (
                  <div className="text-gray-400 text-lg font-semibold drop-shadow-md">
                    {isActive ? "Listening..." : 'Click "Start Call" to begin...'}
                  </div>
                )}
              </div>

              {isAwaitingTitle && (
                <div className="mt-4 w-full flex flex-col gap-2">
                  <input
                    type="text"
                    value={vivaTitle}
                    onChange={(e) => {
                      setVivaTitle(e.target.value);
                    }}
                    placeholder="Enter the title of the viva"
                    className="w-full px-3 py-2 bg-quaternary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                  <button
                    onClick={handleCreateViva}
                    className="px-4 py-2 bg-teal text-white rounded hover:bg-hover-teal transition-colors"
                  >
                    Create Viva
                  </button>
                </div>
              )}

              <div className="mt-6 flex space-x-4">
                {!isActive && !isConnecting && !isAwaitingTitle && (
                  <button
                    onClick={startCall}
                    className="px-6 py-3 bg-teal text-white rounded font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-md flex items-center"
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

export default VapiAssistant;