import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faRocket, faSpinner, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useParams } from "react-router-dom";
import roadmapService from "../services/roadmapService";
import RoadmapNode from "../components/RoadmapNode";
import YouTubeRecommendations from "../components/YouTubeRecommendations";

const Roadmap = ({ user }) => {
  const [roadmap, setRoadmap] = useState(null);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const nodeColors = [
    "from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20",
    "from-purple-400 to-indigo-600 shadow-lg shadow-purple-500/20",
    "from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20",
    "from-amber-400 to-orange-600 shadow-lg shadow-amber-500/20",
    "from-pink-400 to-rose-600 shadow-lg shadow-pink-500/20",
    "from-violet-400 to-fuchsia-600 shadow-lg shadow-violet-500/20",
    "from-lime-400 to-green-600 shadow-lg shadow-lime-500/20",
    "from-red-400 to-pink-600 shadow-lg shadow-red-500/20",
  ];

  const fetchRoadmap = async () => {
    try {
      const data = await roadmapService.fetchRoadmapById(id);
      setRoadmap(data.roadmap);
      setProgress(data.progress);
      setError(null);
    } catch (err) {
      setError(
        err.message === "Please login to view your roadmap"
          ? "Please log in to view your roadmap."
          : err.message === "Roadmap not found"
          ? "Roadmap not found. Please select another roadmap."
          : `Failed to fetch roadmap: ${err.message}`
      );
      setRoadmap(null);
      // Redirect to /roadmap/generate if roadmap not found
      if (err.message === "Roadmap not found") {
        navigate("/roadmap/generate");
      }
    }
  };

  const updateProgress = async (nodeId, status) => {
    try {
      setError(null);
      await roadmapService.updateProgress(nodeId, status);
      await fetchRoadmap();
    } catch (err) {
      setError(
        err.message === "Please login to view your roadmap"
          ? "Please log in to update progress."
          : `Failed to update progress: ${err.message}`
      );
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoadmap();
    }
  }, [id]);

  const calculateProgress = () =>
    roadmap
      ? (Object.values(progress).filter((s) => s === "completed").length / roadmap.nodes.length) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background text-white p-6 md:p-10 font-sans overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-[0.03]"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 50 + 30,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative mb-8 p-4 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl shadow-lg text-center w-full max-w-lg mx-auto text-white font-medium backdrop-blur-sm z-50"
          >
            {error}{" "}
            {error.includes("log in") && (
              <a href="/login" className="underline text-yellow-200 hover:text-yellow-300">
                Login
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap Display */}
      {roadmap && (
        <div className="relative w-full max-w-6xl mx-auto z-10">
          {/* Back to Roadmaps Button */}
          <motion.button
            onClick={() => navigate("/roadmap/generate")}
            className="mb-8 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-xl" />
            <span className="text-lg font-bold">Back to Roadmaps</span>
          </motion.button>

          {/* Header with progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal via-yellow to-red-600 tracking-tight">
              {roadmap.interest} Mastery Path
            </h1>
            <div className="relative w-full max-w-2xl mx-auto h-4 bg-gray-800/50 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-300 to-red-600 rounded-full relative overflow-hidden"
                initial={{ width: "0%" }}
                animate={{ width: `${calculateProgress()}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 animate-pulse"></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white tracking-wider">
                  {Math.round(calculateProgress())}% Complete
                </span>
              </motion.div>
            </div>
            <p className="mt-4 text-gray-300 text-sm">
              {Object.values(progress).filter((s) => s === "completed").length} of{" "}
              {roadmap.nodes.length} milestones achieved
            </p>
            {/* Practice Code Now Button */}
            {roadmap.practiceWorkspaceId && (
              <motion.button
                onClick={() => navigate(`/workspace/${roadmap.practiceWorkspaceId}`)}
                className="mt-6 p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <FontAwesomeIcon icon={faRocket} className="text-xl" />
                <span className="text-lg font-bold">Practice Code Now</span>
              </motion.button>
            )}
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Glowing center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-white via-white to-yellow transform -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow to-teal transform -translate-x-1/2 shadow-lg shadow-white"></div>

            <div className="space-y-24">
              {roadmap.nodes.map((node, index) => (
                <RoadmapNode
                  key={node.id}
                  node={node}
                  index={index}
                  progress={progress}
                  updateProgress={updateProgress}
                  hoveredNode={hoveredNode}
                  setHoveredNode={setHoveredNode}
                  nodeColors={nodeColors}
                  practiceWorkspaceId={roadmap.practiceWorkspaceId}
                />
              ))}
            </div>
          </div>

          {/* YouTube Recommendations Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-24"
          >
            <YouTubeRecommendations 
              interest={roadmap.interest} 
              hoveredNode={hoveredNode} 
              nodes={roadmap.nodes} 
            />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;