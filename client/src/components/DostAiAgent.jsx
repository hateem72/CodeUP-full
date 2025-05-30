import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DostAI from './DostAI';
import { faTimes, faRobot, faComment, faMicrophone, faBrain } from '@fortawesome/free-solid-svg-icons';
import Vapi from '@vapi-ai/web';

const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const vapiRef = useRef(null);
  const [showChatMode, setShowChatMode] = useState(false);
  const hasInitialized = useRef(false);
  const speakingTimeoutRef = useRef(null);
  const thinkingTimeoutRef = useRef(null);

  const videoUrls = {
    idle: "/videos/robot-start.mp4",
    listening: "/videos/robot-listening.mp4",
    speaking: "/videos/robot-speaking.mp4",
    thinking: "/videos/robot-listening.mp4",
    loading: "/videos/robot-start.mp4",
  };

  const [currentVideo, setCurrentVideo] = useState(videoUrls.idle);

  // Update video based on state
  useEffect(() => {
    if (error) {
      setCurrentVideo(videoUrls.idle);
      return;
    }

    if (!isActive) {
      setCurrentVideo(videoUrls.idle);
    } else if (isSpeaking) {
      setCurrentVideo(videoUrls.speaking);
    } else if (isThinking) {
      setCurrentVideo(videoUrls.thinking);
    } else if (isActive) {
      setCurrentVideo(videoUrls.listening);
    }
  }, [isActive, isSpeaking, isThinking, error]);

  // Play video when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Video play error:", e));
    }
  }, [currentVideo]);

  // Initialize Vapi once
  useEffect(() => {
    if (hasInitialized.current) return;
    let vapi;
    try {
      const apiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_DOST;
      if (!apiKey) throw new Error('VAPI_PUBLIC_KEY is not defined');
      if (!assistantId) throw new Error('VAPI_ASSISTANT_ID is not defined');

      vapi = new Vapi(apiKey);
      vapiRef.current = vapi;

      vapi.on('call-start', () => {
        setIsActive(true);
        setIsThinking(true);
        setMessages([]);
        setError(null);
        if (thinkingTimeoutRef.current) {
          clearTimeout(thinkingTimeoutRef.current);
        }
        thinkingTimeoutRef.current = setTimeout(() => {
          setIsThinking(false);
        }, 3000);
      });

      vapi.on('call-end', () => {
        setIsActive(false);
        setIsSpeaking(false);
        setIsThinking(false);
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
        if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
      });

      vapi.on('speech-start', () => {
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
        setIsSpeaking(true);
      });

      vapi.on('speech-end', () => {
        setIsSpeaking(false);
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      });

      vapi.on('message', (message) => {
        if (message.type === 'transcript') {
          setMessages((prev) => [
            ...prev,
            {
              role: message.role,
              content: message.transcript,
              timestamp: new Date(),
            },
          ]);
          
          if (message.role === 'assistant' && !isSpeaking) {
            setIsThinking(false);
            setIsSpeaking(true);
            speakingTimeoutRef.current = setTimeout(() => {
              setIsSpeaking(false);
            }, 3000);
          } else if (message.role === 'user') {
            setIsThinking(true);
            thinkingTimeoutRef.current = setTimeout(() => {
              setIsThinking(false);
            }, 3000);
          }
        }
      });

      vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        setIsActive(false);
        setIsSpeaking(false);
        setIsThinking(false);
        if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
        if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
        setError('Internet connection error. Please check your network settings.');
      });

      hasInitialized.current = true;
    } catch (err) {
      console.error('Vapi initialization error:', err);
      setError(`Initialization failed: ${err.message}`);
    }

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      if (thinkingTimeoutRef.current) clearTimeout(thinkingTimeoutRef.current);
    };
  }, []);
  useEffect(() => {
    if (showChatMode && vapiRef.current) {
      // Stop the voice call when switching to chat mode
      vapiRef.current.stop();
      setIsActive(false);
      setIsSpeaking(false);
      setIsThinking(false);
    }
  }, [showChatMode]);
  // Start call when isOpen changes
  useEffect(() => {
    const startCall = () => {
      if (isOpen && !isActive && vapiRef.current) {
        const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID_DOST;
        if (!assistantId) {
          setError('Assistant ID is not defined.');
          return;
        }
        setTimeout(() => {
          if (vapiRef.current) {
            vapiRef.current.start(assistantId)
              .catch((err) => {
                console.error('Call start error:', err);
                setError('Failed to start call. Check your browser or network.');
              });
          }
        }, 2000);
      }
    };
    startCall();
  }, [isOpen, isActive]);

  const toggleChat = () => {
    if (isOpen && vapiRef.current) {
      vapiRef.current.stop();
    }
    setIsOpen(!isOpen);
  };

  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return (
    <div className="fixed right-0 top-0 h-full z-50">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-5 rounded-l-xl font-semibold uppercase shadow-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 flex items-center"
        >
          <FontAwesomeIcon icon={faRobot} className="mr-2" />
          DOSTAI
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30 }}
            className="h-full w-96 bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-700">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faRobot} className="text-orange-500 mr-2" />
                <h2 className="text-xl font-bold text-white">DOST AI</h2>
                {isActive && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close AI Agent"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Video Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
              <div className="w-full h-48 bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  src={currentVideo}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status Indicator */}
              <div className="flex items-center mb-4">
                {isActive ? (
                  <>
                    {isSpeaking && (
                      <div className="flex items-center text-orange-400 mr-4">
                        <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
                        <span>Speaking</span>
                      </div>
                    )}
                    {isThinking && (
                      <div className="flex items-center text-blue-400">
                        <FontAwesomeIcon icon={faBrain} className="mr-2" />
                        <span>Thinking</span>
                      </div>
                    )}
                    {!isSpeaking && !isThinking && (
                      <div className="flex items-center text-green-400">
                        <FontAwesomeIcon icon={faMicrophone} className="mr-2" />
                        <span>Listening</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400">Ready to connect</div>
                )}
              </div>

              {/* Subtitles */}
              <div className="w-full bg-gray-800 rounded-lg p-4 min-h-20 max-h-32 overflow-y-auto">
                {error ? (
                  <div className="text-red-400 text-center">{error}</div>
                ) : latestMessage ? (
                  <div className="text-white text-center">
                    <strong className="text-orange-400">
                      {latestMessage.role === 'user' ? 'You: ' : 'DOST: '}
                    </strong>
                    {latestMessage.content}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    {isActive ? 'Listening for your message...' : 'Starting conversation...'}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {/* Footer */}
<div className="p-4 border-t border-gray-700">
  {showChatMode ? (
    <DostAI 
      isOpenByDefault={true} 
      onClose={() => setShowChatMode(false)}
    />
  ) : (
    <button 
      onClick={() => setShowChatMode(true)}
      className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center hover:from-orange-600 hover:to-red-700 transition-all"
    >
      <FontAwesomeIcon icon={faComment} className="mr-2" />
      Use Chat Mode
    </button>
  )}
</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAgent;