import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faArrowRight, faCode } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RoadmapNode = ({ node, index, progress, updateProgress, hoveredNode, setHoveredNode, nodeColors, practiceWorkspaceId }) => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {index !== 0 && (
        <motion.div
          className={`absolute top-0 h-1 bg-gradient-to-r from-white to-teal transform -translate-y-6 ${
            index % 2 === 0 ? "left-1/2 w-16 -translate-x-16" : "right-1/2 w-16 translate-x-16"
          }`}
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "4rem" }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
        />
      )}

      <motion.div
        className={`relative p-8 rounded-2xl transition-all duration-300 ${
          nodeColors[index % nodeColors.length]
        } ${progress[node.id] === "completed" ? "opacity-90" : ""}`}
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          marginLeft: index % 2 === 0 ? "0" : "auto",
          width: "90%",
          maxWidth: "600px", 
          border: "1px solid rgba(255,255,255,0.15)",
          minHeight: "300px",
        }}
      >
        {/* Glow effect on hover */}
        <div
          className={`absolute inset-0 rounded-2xl bg-white opacity-0 transition-opacity duration-300 ${
            hoveredNode === node.id ? "opacity-[0.03]" : ""
          }`}
        ></div>

        {/* Timeline dot with pulse animation */}
        <div
          className={`absolute top-8 ${
            index % 2 === 0 ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
          } w-6 h-6 rounded-full bg-white border-4 border-teal z-10 shadow-lg`}
        >
          <div
            className={`absolute inset-0 rounded-full bg-teal animate-ping opacity-30 ${
              progress[node.id] === "in_progress" ? "" : "hidden"
            }`}
          ></div>
        </div>

        {/* Step badge */}
        <div className="absolute -top-3 -right-3 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
          Step {index + 1}
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">{node.title}</h2>

          <div>
            <p className="text-gray-100 text-sm leading-relaxed">{node.description}</p>
            <div className="mt-4 bg-black/20 p-4 rounded-lg border border-white/10">
              <p className="font-semibold text-white mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faArrowRight} className="text-teal" />
                Your Task:
              </p>
              <p className="text-gray-100 pl-6 text-sm">{node.task}</p>
            </div>
          </div>

          <div>
            <p className="font-semibold text-white mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faArrowRight} className="text-teal" />
              Resources:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {node.resources.map((link, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm bg-black/30 hover:bg-black/40 border border-white/10 px-3 py-2 rounded-lg transition-all flex items-center gap-2 whitespace-normal break-words"
                >
                  <span>{new URL(link).hostname.replace("www.", "")}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Practice Questions */}
          <div>
            <p className="font-semibold text-white mb-3 flex items-center gap-2">
              <FontAwesomeIcon icon={faCode} className="text-teal" />
              Practice Questions:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {node.practiceQuestions && node.practiceQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => practiceWorkspaceId && q.fileId && navigate(`/workspace/${practiceWorkspaceId}?fileId=${q.fileId}`)}
                  className="text-sm bg-black/30 hover:bg-black/40 border border-white/10 px-3 py-2 rounded-lg transition-all text-left flex items-center gap-2 whitespace-normal break-words"
                  disabled={!practiceWorkspaceId || !q.fileId}
                >
                  <span>{`Q${i + 1}: ${q.question}`}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <select
              value={progress[node.id] || "not_started"}
              onChange={(e) => updateProgress(node.id, e.target.value)}
              className="bg-black/30 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal/50 hover:bg-black/40 transition-all"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {progress[node.id] === "completed" && (
              <div className="flex items-center gap-2 text-emerald-300">
                <FontAwesomeIcon icon={faCheckCircle} className="text-2xl" />
                <span className="font-medium">Completed!</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoadmapNode;