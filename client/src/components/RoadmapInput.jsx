import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRocket, faSpinner, faExclamationCircle, faTrash, faEye, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import roadmapService from "../services/roadmapService";

const motivationalPhrases = [
  "Master Algorithms Today!",
  "Conquer Data Structures!",
  "Build Your Coding Future!",
  "Dive into Python Mastery!",
  "Create with Web Development!",
  "Unlock AI & Machine Learning!",
  "Become a Programming Pro!"
];

const RoadmapInput = () => {
  const [interest, setInterest] = useState("");
  const [inputError, setInputError] = useState("");
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const navigate = useNavigate();

  // Cycle through motivational phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % motivationalPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const validateInput = (value) => {
    const sanitizedValue = value.replace(/[^\w\s-]/g, '').trim();
    if (sanitizedValue.length < 2) {
      setInputError("Input must be at least 2 characters long");
      return false;
    }
    if (sanitizedValue.length > 50) {
      setInputError("Input must be less than 50 characters");
      return false;
    }
    if (!/^[a-zA-Z]/.test(sanitizedValue)) {
      setInputError("Input must start with a letter");
      return false;
    }
    setInputError("");
    return sanitizedValue;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^\w\s-]/g, '');
    setInterest(sanitizedValue);
    validateInput(sanitizedValue);
  };

  const generateRoadmap = async () => {
    if (roadmaps.length >= 3) {
      setInputError("You can only create up to 3 roadmaps. Delete one to create a new one.");
      return;
    }
    const validatedInput = validateInput(interest);
    if (validatedInput) {
      setIsGenerating(true);
      setInputError(null);
      setSuccessMessage("");
      try {
        const data = await roadmapService.generateRoadmap(validatedInput);
        setRoadmaps([...roadmaps, data.roadmap]);
        setInterest("");
        setSuccessMessage(`Roadmap for ${validatedInput} created successfully!`);
        navigate(`/roadmap/${data.roadmap._id}`);
      } catch (err) {
        setInputError(`Failed to generate roadmap: ${err.message}`);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const fetchRoadmaps = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    try {
      const data = await roadmapService.fetchUserRoadmaps();
      setRoadmaps(data.roadmaps || []);
      setDeleteError("");
    } catch (error) {
      setDeleteError(`Failed to fetch roadmaps: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoadmap = async (roadmapId) => {
    setIsLoading(true);
    setDeleteError("");
    setSuccessMessage("");
    try {
      await roadmapService.deleteRoadmap(roadmapId);
      await fetchRoadmaps();
      setSuccessMessage("Roadmap deleted successfully!");
    } catch (error) {
      setDeleteError(`Failed to delete roadmap: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewRoadmap = (roadmapId) => {
    setIsNavigating(roadmapId);
    setDeleteError("");
    setSuccessMessage("");
    try {
      navigate(`/roadmap/${roadmapId}`);
    } catch (error) {
      setDeleteError(`Failed to navigate to roadmap: ${error.message}`);
    } finally {
      setTimeout(() => setIsNavigating(null), 500);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-400/20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
              scale: [null, Math.random() * 0.5 + 0.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            style={{
              width: Math.random() * 50 + 20,
              height: Math.random() * 50 + 20,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4"
        >
          Launch Your Coding Journey
        </motion.h1>
        <AnimatePresence mode="wait">
          <motion.p
            key={currentPhraseIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-6 text-center"
          >
            {motivationalPhrases[currentPhraseIndex]}
          </motion.p>
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="relative">
            <input
              type="text"
              value={interest}
              onChange={handleInputChange}
              placeholder="Enter a programming topic.."
              className={`w-full p-4 pr-12 bg-gray-900/80 border ${
                inputError ? 'border-red-500/50' : 'border-cyan-500/50'
              } rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all hover:border-cyan-400/70 shadow-lg`}
            />
            <motion.button
              onClick={generateRoadmap}
              disabled={isGenerating || !interest.trim() || inputError || roadmaps.length >= 3}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg flex items-center gap-2 font-bold transition-all ${
                isGenerating || !interest.trim() || inputError || roadmaps.length >= 3
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:from-cyan-600 hover:to-purple-700"
              }`}
            >
              {isGenerating ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-lg" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faRocket} />
                  <span className="hidden sm:inline">Generate</span>
                </>
              )}
            </motion.button>
          </div>
          {inputError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-red-400 text-sm flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{inputError}</span>
            </motion.div>
          )}
          <p className="mt-2 text-sm text-gray-400 text-center">
            Your path to programming mastery starts here!
          </p>
        </motion.div>
      </motion.section>

      {/* Roadmap List Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl mx-auto px-4 mb-16"
      >
        {roadmaps.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center">
              Your Learning Paths ({roadmaps.length}/3)
            </h2>
            {isLoading && (
              <div className="text-center text-gray-400">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
                <span className="ml-2 text-lg">Loading...</span>
              </div>
            )}
            <AnimatePresence>
              {deleteError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg text-white text-center shadow-lg"
                >
                  <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                  {deleteError}
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg text-white text-center shadow-lg"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadmaps.map((roadmap) => (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 255, 255, 0.2)" }}
                  className="bg-gray-900/70 p-4 rounded-xl border border-cyan-500/30 hover:border-cyan-500/50 transition-all shadow-lg"
                >
                  <h3 className="text-lg font-medium text-white truncate">{roadmap.interest}</h3>
                  <div className="mt-3 flex justify-end gap-2">
                    <motion.button
                      onClick={() => handleViewRoadmap(roadmap._id)}
                      disabled={isNavigating === roadmap._id || isLoading}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className={`p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white shadow-sm transition-all ${
                        isNavigating === roadmap._id ? "animate-pulse" : ""
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isNavigating === roadmap._id ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      ) : (
                        <FontAwesomeIcon icon={faEye} />
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteRoadmap(roadmap._id)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default RoadmapInput;