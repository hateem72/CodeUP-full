import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faTimes, faMicrophone, faCircleNotch, faHeadphones, faBrain, faComment, faClosedCaptioning } from "@fortawesome/free-solid-svg-icons";
import Vapi from "@vapi-ai/web";

// Initialize Vapi
const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);

const AIExplain = ({ editorContent }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [liveUserCaption, setLiveUserCaption] = useState("");
  const [liveAICaption, setLiveAICaption] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Start Vapi Agent
  const startVapiAgent = async () => {
    if (isVapiActive) {
      vapi.stop();
      setIsVapiActive(false);
      setIsLoading(false);
      setLiveUserCaption("");
      setLiveAICaption("");
      return;
    }

    try {
      setIsLoading(true);
      setLiveUserCaption("");
      setLiveAICaption("");
      
      const call = await vapi.start({
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
              content: `You are a friendly robot teacher named CodeBot. You're teaching coding concepts to a student. Current code context: ${editorContent}. 
              Explain concepts in simple, beginner-friendly terms with examples. Be encouraging and fun! 
              If the question isn't related to coding, politely guide the conversation back to programming topics.`,
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        name: "CodeBot",
        onError: (error) => {
          console.error("Vapi Error:", error);
          setIsVapiActive(false);
          setIsLoading(false);
          setConversation(prev => [...prev, {
            speaker: "system",
            text: "Connection error. Please try again.",
            time: new Date().toLocaleTimeString()
          }]);
        },
      });

      if (!call) {
        throw new Error("Failed to initialize Vapi call");
      }

      setIsVapiActive(true);
      setIsLoading(false);
      setConversation(prev => [...prev, {
        speaker: "system",
        text: "CodeBot is ready! Ask me anything about the code.",
        time: new Date().toLocaleTimeString()
      }]);

      // Clean up previous listeners
      vapi.removeAllListeners();

      // Event listeners
      vapi.on("speech-start", () => {
        setIsSpeaking(true);
        setIsThinking(false);
      });
      
      vapi.on("speech-end", () => setIsSpeaking(false));
      
      vapi.on("call-end", () => {
        setIsVapiActive(false);
        setIsSpeaking(false);
        setIsThinking(false);
        setLiveUserCaption("");
        setLiveAICaption("");
      });
      
      vapi.on("transcript", (data) => {
        if (data.type === "user") {
          setLiveUserCaption(data.transcript);
          if (data.isFinal) {
            setConversation(prev => [...prev, {
              speaker: "user",
              text: data.transcript,
              time: new Date().toLocaleTimeString()
            }]);
            setLiveUserCaption("");
          }
        }
      });
      
      vapi.on("message", (message) => {
        if (message.role === "assistant" && message.content) {
          setLiveAICaption(message.content);
          setConversation(prev => [...prev, {
            speaker: "bot",
            text: message.content,
            time: new Date().toLocaleTimeString()
          }]);
          setLiveAICaption("");
        }
      });
      
      vapi.on("thinking", () => {
        setIsThinking(true);
        setLiveAICaption("Thinking...");
      });
      
      vapi.on("thinking-end", () => {
        setIsThinking(false);
        setLiveAICaption("");
      });
      
    } catch (error) {
      console.error("Vapi Start Error:", error);
      setIsLoading(false);
      setConversation(prev => [...prev, {
        speaker: "system",
        text: "Failed to start. Please try again.",
        time: new Date().toLocaleTimeString()
      }]);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isVapiActive) {
        vapi.stop();
      }
      vapi.removeAllListeners();
    };
  }, [isVapiActive]);

  const handlePopupOpen = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    vapi.stop();
    setIsVapiActive(false);
    setIsSpeaking(false);
    setIsThinking(false);
    setIsPopupOpen(false);
    setLiveUserCaption("");
    setLiveAICaption("");
  };

  // Get current state for display
  const getCurrentState = () => {
    if (isLoading) return "loading";
    if (isThinking) return "thinking";
    if (isSpeaking) return "speaking";
    if (isVapiActive) return "listening";
    return "idle";
  };

  // Get status text
  const getStatusText = () => {
    if (isLoading) return "Initializing CodeBot...";
    if (isThinking) return "CodeBot is thinking...";
    if (isSpeaking) return "CodeBot is speaking...";
    if (isVapiActive) return "Listening for your question...";
    return "Ready to help with your code!";
  };

  // Get robot display based on state
  const getRobotDisplay = () => {
    const state = getCurrentState();
    
    return (
      <div className={`robot-display ${state} w-48 h-48 relative flex items-center justify-center`}>
        {/* Robot face container */}
        <div className="relative w-32 h-32">
          {/* Robot head */}
          <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg border-4 border-gray-400 flex items-center justify-center">
            {/* Eyes */}
            <div className="flex space-x-8 absolute top-8">
              <div className={`eye ${state === 'listening' ? 'animate-pulse' : ''}`}>
                <div className="w-6 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1"></div>
                </div>
              </div>
              <div className={`eye ${state === 'listening' ? 'animate-pulse delay-100' : ''}`}>
                <div className="w-6 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute w-2 h-2 bg-white rounded-full top-1 left-1"></div>
                </div>
              </div>
            </div>
            
            {/* Mouth - changes based on state */}
            <div className={`mouth absolute bottom-6 ${state === 'speaking' ? 'animate-pulse' : ''}`}>
              {state === 'speaking' ? (
                <div className="w-12 h-6 bg-red-400 rounded-full animate-bounce"></div>
              ) : state === 'thinking' ? (
                <div className="w-12 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              ) : state === 'listening' ? (
                <div className="w-12 h-1 bg-green-400 rounded-full"></div>
              ) : (
                <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
              )}
            </div>
          </div>
          
          {/* Antenna - shows activity */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-1 h-8 bg-gray-400 mx-auto"></div>
            <div className={`w-4 h-4 rounded-full ${state !== 'idle' ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'} mx-auto`}></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center cursor-pointer shadow-xl z-50 hover:scale-110 transition-transform duration-300 group"
        onClick={handlePopupOpen}
        title="Ask CodeBot"
      >
        <FontAwesomeIcon 
          icon={faPlay} 
          size="lg" 
          className="text-white group-hover:rotate-90 transition-transform" 
        />
        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
          AI
        </span>
      </div>

      {/* Sidebar Popup */}
      {isPopupOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-700 transform transition-transform duration-300 ease-in-out">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                CodeBot Assistant
              </h2>
            </div>
            <button 
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700"
              onClick={handlePopupClose}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Robot Display */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-800 border-b border-gray-700">
            {getRobotDisplay()}
            <div className="text-center mt-2 px-4 py-2 bg-gray-700 rounded-full">
              <p className="text-sm font-medium text-blue-200">{getStatusText()}</p>
            </div>
          </div>

          {/* Live Captions */}
          <div className="bg-gray-800 p-3 space-y-2 border-b border-gray-700">
            {(liveUserCaption || liveAICaption) && (
              <div className="flex items-center text-xs text-gray-400 mb-1">
                <FontAwesomeIcon icon={faClosedCaptioning} className="mr-1" />
                <span>Live Captions</span>
              </div>
            )}
            {liveUserCaption && (
              <div className="bg-indigo-900 bg-opacity-30 rounded-lg p-2">
                <div className="text-xs text-indigo-300 mb-1">You:</div>
                <div className="text-sm text-white">{liveUserCaption}</div>
              </div>
            )}
            {liveAICaption && (
              <div className="bg-gray-700 rounded-lg p-2">
                <div className="text-xs text-blue-300 mb-1">CodeBot:</div>
                <div className="text-sm text-white">{liveAICaption}</div>
              </div>
            )}
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {conversation.length > 0 ? (
              conversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 relative ${msg.speaker === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : msg.speaker === 'bot' 
                        ? 'bg-gray-700 text-gray-100 rounded-bl-none'
                        : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    <div className="absolute -top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {msg.speaker === 'user' ? 'You' : msg.speaker === 'bot' ? 'CodeBot' : 'System'}
                    </div>
                    <div className="text-sm mt-1">
                      {msg.text}
                    </div>
                    <div className="text-right mt-1 text-xs text-gray-300 opacity-70">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 opacity-30 mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faComment} className="text-4xl text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-400 mb-1">CodeBot Assistant</h3>
                <p className="text-sm text-gray-500">
                  Start a conversation to get explanations about your code
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <button
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                isLoading 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : isVapiActive 
                    ? 'bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-600 hover:to-amber-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
              }`}
              onClick={startVapiAgent}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="fa-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faMicrophone} />
                  <span>{isVapiActive ? "Stop Conversation" : "Talk to CodeBot"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes bounce {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.8); }
        }

        .animate-pulse {
          animation: pulse 1.5s infinite;
        }

        .animate-bounce {
          animation: bounce 0.5s infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }
      `}</style>
    </>
  );
};

export default AIExplain;