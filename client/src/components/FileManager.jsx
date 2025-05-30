import React, { useState, useEffect } from "react";
import { fileService } from "../services/fileService.js";
import { useParams, useNavigate } from "react-router-dom";
import { faArrowLeft, faPlus, faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AssignmentGeneratorPopup from "./AssignmentGeneratorPopup";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
});

const FileManager = ({ files, setFiles, activeFile, setActiveFile }) => {
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const params = useParams();
  const navigate = useNavigate();
  const workspaceId = params.id;

  // Socket.IO setup
  useEffect(() => {
    socket.emit("join-room", {
      roomId: `workspace-${workspaceId}`,
      username: "Anonymous",
    });

    socket.on("file-created", ({ file }) => {
      setFiles((prev) => {
        if (!prev.some((f) => f._id === file._id)) {
          return [...prev, file];
        }
        return prev;
      });
    });

    socket.on("file-deleted", ({ fileId }) => {
      setFiles((prev) => {
        const newFiles = prev.filter((f) => f._id !== fileId);
        if (activeFile?._id === fileId) {
          setActiveFile(newFiles[0] || null);
        }
        return newFiles;
      });
    });

    socket.on("file-selected", ({ fileId }) => {
      const file = files.find((f) => f._id === fileId);
      if (file && activeFile?._id !== fileId) {
        setActiveFile(file);
      }
    });

    return () => {
      socket.off("file-created");
      socket.off("file-deleted");
      socket.off("file-selected");
    };
  }, [workspaceId, files, activeFile, setFiles, setActiveFile]);

  const handleFileAdd = async () => {
    if (!newFileName) return;

    try {
      const extension = newFileName.split(".").pop().toLowerCase();
      const languageMap = {
        js: "javascript",
        py: "python",
        cpp: "cpp",
        c: "c",
        java: "java",
      };
      const language = languageMap[extension] || "javascript";

      const fileData = {
        name: newFileName,
        workspaceId: workspaceId,
        content: "",
        language: language,
      };

      console.log("Creating new file:", { name: newFileName, extension, language });

      const response = await fileService.createFile(fileData);
      setFiles((prev) => [...prev, response]);
      setActiveFile(response);
      socket.emit("file-created", {
        roomId: `workspace-${workspaceId}`,
        file: response,
      });
      socket.emit("file-selected", {
        roomId: `workspace-${workspaceId}`,
        fileId: response._id,
      });
      setError(null);
      setShowAddModal(false);
      setNewFileName("");
    } catch (error) {
      console.error("Error creating file:", error);
      setError(error.message);
    }
  };

  const handleFileClick = (file) => {
    if (activeFile?._id !== file._id) {
      setActiveFile(file);
      socket.emit("file-selected", {
        roomId: `workspace-${workspaceId}`,
        fileId: file._id,
      });
    }
  };

  const handleFileDelete = async () => {
    if (!fileToDelete) return;

    try {
      await fileService.deleteFile(fileToDelete._id);
      setFiles((prev) => {
        const newFiles = prev.filter((f) => f._id !== fileToDelete._id);
        setActiveFile(newFiles[0] || null);
        return newFiles;
      });
      socket.emit("file-deleted", {
        roomId: `workspace-${workspaceId}`,
        fileId: fileToDelete._id,
      });
      setError(null);
      setShowDeleteModal(false);
      setFileToDelete(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      setError(error.message);
    }
  };

  return (
    <div className="w-72 bg-tertiary p-5 flex flex-col shadow-lg border-r border-quaternary">
      {/* Header */}
      <div className="flex flex-col mb-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-teal">Files</h3>
          <button
            onClick={() => navigate(-1)}
            className="bg-quaternary text-octonary px-3 py-1 rounded-lg hover:bg-tertiary transition-colors duration-200 text-sm font-semibold shadow-md flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Back</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-teal text-background px-3 py-1 rounded-lg hover:bg-hover-teal transition-colors duration-200 text-sm font-semibold shadow-md flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Create File</span>
          </button>
          <button
            onClick={() => setShowAssignmentPopup(true)}
            className="bg-gradient-to-r from-yellow to-orange-500 text-background px-3 py-1 rounded-lg hover:from-orange-500 hover:to-yellow transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download Assignment</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="text-octonary bg-quaternary p-2 rounded-lg mb-4 text-sm border border-hover-teal animate-slide-in">
          {error}
        </div>
      )}

      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-quinary scrollbar-track-background">
        {files.length === 0 ? (
          <p className="text-senary text-sm text-center">No files yet. Add one!</p>
        ) : (
          files.map((file) => (
            <div
              key={file._id}
              className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                activeFile?._id === file._id
                  ? "bg-teal text-background"
                  : "bg-quaternary text-octonary hover:bg-tertiary"
              }`}
              onClick={() => handleFileClick(file)}
            >
              <span className="truncate max-w-[180px] text-sm">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFileToDelete(file);
                  setShowDeleteModal(true);
                }}
                className={`text-sm ${
                  activeFile?._id === file._id
                    ? "text-background hover:text-hover-yellow"
                    : "text-quaternary hover:text-hover-teal"
                } transition-colors duration-200`}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-tertiary p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-teal mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g., test.js, test.py, test.cpp"
              className="w-full px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent transition-all duration-300 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewFileName("");
                }}
                className="bg-quaternary text-octonary px-4 py-2 rounded-lg hover:bg-tertiary transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFileAdd}
                className="bg-teal text-background px-4 py-2 rounded-lg hover:bg-hover-teal transition-colors duration-200"
                disabled={!newFileName}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && fileToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-tertiary p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold text-teal mb-4">Delete File</h3>
            <p className="text-senary mb-4">
              Are you sure you want to delete{" "}
              <span className="text-octonary font-medium">{fileToDelete.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setFileToDelete(null);
                }}
                className="bg-quaternary text-octonary px-4 py-2 rounded-lg hover:bg-tertiary transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleFileDelete}
                className="bg-yellow text-background px-4 py-2 rounded-lg hover:bg-hover-yellow transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showAssignmentPopup && (
        <AssignmentGeneratorPopup
          files={files}
          workspaceId={workspaceId}
          onClose={() => setShowAssignmentPopup(false)}
        />
      )}
    </div>
  );
};

export default FileManager;