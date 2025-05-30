import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faPaperPlane,
  faTimes,
  faBookOpen,
  faCode,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { fetchAifyResponse } from "../services/geminiService";



const DostAI = ({ onClose, isOpenByDefault = false }) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]); 

  const fetchDostAIResponse = async (mode) => {
    if (!query.trim()) return;
    setLoading(true);
    const userMessage = { type: "user", text: query };
    setMessages((prev) => [...prev, userMessage]);

    try {
      let prompt;
      if (mode === "understand") {
        prompt = `"${query}".this is the user's query. Now, you need to explain this in Hinglish as if you are the user's friend. Use a friendly and casual tone, incorporating various slang words like dekh bhaii, aaya smjhhh, aree, etc. Make sure to include emojis to keep the conversation light and engaging. Your goal is to make the explanation very easy for the user to understand. Break down complex information into simple, digestible parts, and use relatable examples or analogies. Keep the explanation in Hinglish throughout, mixing Hindi and English seamlessly to maintain a friendly and approachable vibe. Encourage the user by being supportive and positive. Use phrases like "Don't worry, it's super easy" or "You'll get the hang of it in no time." Make the user feel confident and motivated to learn. Remember to be thorough in your explanation, covering all aspects of the query to ensure the user gains complete knowledge. Be patient and willing to reiterate points if needed, and invite the user to ask follow-up questions if they have any doubts. Overall, aim to create a comfortable and enjoyable learning experience for the user. The user should feel like they are chatting with a close friend who genuinely wants to help them understand and learn.`;
      } else if (mode === "getcode") {
        prompt = `Generate code for this request: "${query}". Return only the raw code itself, without any markdown formatting, language tags, or explanations. Include a main function or equivalent entry point. Use hardcoded values instead of requesting user input. Format the code with proper indentation. Ensure the output is pure code that can be directly executed. Do not include any backticks, comments about the language, or markdown symbols.`;
      }
      const res = await fetchAifyResponse(prompt);
      const aiResponse = res || (mode === "understand" ? "Kuch samajh nahi aaya, thodi aur detail de!" : "// No code generated, try again!");
      setMessages((prev) => [...prev, { type: "ai", text: aiResponse, isCode: mode === "getcode" }]);
    } catch (error) {
      const errorMessage = mode === "understand" ? "Sorry yaar, kuch gadbad ho gaya!" : "// Error generating code!";
      setMessages((prev) => [...prev, { type: "ai", text: errorMessage, isCode: mode === "getcode" }]);
    } finally {
      setLoading(false);
      setQuery(""); 
    }
  };
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!"); 
  };

  return (
    <div
      className={
        isOpen
          ? "fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60 p-4"
          : "relative"
      }
    >
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-background py-3 px-5 rounded-xl font-semibold uppercase shadow-lg hover:from-orange-600 hover:to-red-700 hover:shadow-xl hover:-translate-y-1 active:translate-y-0.5 active:shadow-md transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2"></span>
              Loading...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faRobot} className="mr-2" />
              DostAI
            </>
          )}
        </button>
      )}
      {isOpen && (
        <div className="bg-tertiary rounded-2xl shadow-2xl w-full max-w-lg h-[36rem] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex justify-between items-center p-4 border-b border-quaternary">
            <h4 className="text-teal text-xl font-bold">DostAI</h4>
            <button
              onClick={handleClose}
              className="text-octonary hover:text-hover-teal transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-quinary scrollbar-track-background space-y-4">
            {messages.length === 0 ? (
              <p className="text-senary text-center italic">
                Abhi koi baat nahi hui, chalo shuru karte hain!
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.type === "user"
                        ? "bg-quaternary text-octonary"
                        : msg.isCode
                        ? "bg-gray-900 text-white border border-senary font-mono"
                        : "bg-background text-octonary border border-senary"
                    }`}
                  >
                    {msg.isCode ? (
                      <div className="relative">
                        <pre className="whitespace-pre-wrap break-words">{msg.text}</pre>
                        <button
                          onClick={() => copyToClipboard(msg.text)}
                          className="absolute top-2 right-2 text-octonary hover:text-teal transition-colors duration-200"
                        >
                          <FontAwesomeIcon icon={faCopy} />
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-quaternary flex flex-col gap-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pooch na, coding mein kya samajhna hai ya code chahiye?"
              className="w-full bg-quaternary text-octonary border border-senary rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal disabled:opacity-60 disabled:cursor-not-allowed"
              rows="2"
              disabled={loading}
            />
            <div className="flex gap-3">
              <button
                onClick={() => fetchDostAIResponse("understand")}
                className="flex-1 bg-teal text-background py-2 px-4 rounded-lg hover:bg-hover-teal transition-all duration-200 flex items-center justify-center disabled:bg-senary disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2"></span>
                    Loading...
                  </span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
                    Understand
                  </>
                )}
              </button>
              <button
                onClick={() => fetchDostAIResponse("getcode")}
                className="flex-1 bg-teal text-background py-2 px-4 rounded-lg hover:bg-hover-teal transition-all duration-200 flex items-center justify-center disabled:bg-senary disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 border-2 border-background border-t-transparent rounded-full mr-2"></span>
                    Loading...
                  </span>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCode} className="mr-2" />
                    Get Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DostAI;