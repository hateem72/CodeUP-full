import React, { useState, useEffect } from "react";
import axios from "axios";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import EditorControls from "../components/EditorControls.jsx";
import Cursor from "../components/Cursor.jsx";
import io from "socket.io-client";
import { fileService } from "../services/fileService.js";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
});

const EditorArea = ({ file, user, files, workspaceId, onFileChange, isTestMode = false }) => {
  const [output, setOutput] = useState("");
  const [editorSettings, setEditorSettings] = useState({
    theme: "vs-dark",
    fontSize: 14,
    language: file?.language || "javascript",
  });
  const [editorContent, setEditorContent] = useState(file?.content || "");
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    if (!workspaceId || !user) return;
  
    const roomId = `workspace-${workspaceId}`;
  
    socket.emit("join-room", { roomId, username: user?.displayName || "Anonymous" });
  
    socket.on("cursor-update", ({ userId, cursor, username }) => {
      setCursors((prev) => ({
        ...prev,
        [userId]: { cursor, username },
      }));
    });
  
    socket.on("user-joined", ({ userId, username }) => {
      setCursors((prev) => ({
        ...prev,
        [userId]: { cursor: null, username },
      }));
    });
  
    socket.on("user-left", ({ userId }) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });
  
    return () => {
      socket.off("cursor-update");
      socket.off("user-joined");
      socket.off("user-left");
      socket.emit("leave-room", { roomId });
    };
  }, [workspaceId, user]);
  
  useEffect(() => {
    const editorContainer = document.getElementById("editor-container");
    const handlePointerMove = (e) => {
      if (!editorContainer) return;
      const bounds = editorContainer.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const roomId = `workspace-${workspaceId}`;
      socket.emit("cursor-update", {
        roomId,
        cursor: { x, y },
        username: user?.displayName || "Anonymous",
      });
    };
    const handlePointerLeave = () => {
      const roomId = `workspace-${workspaceId}`;
      socket.emit("cursor-update", {
        roomId,
        cursor: null,
        username: user?.displayName || "Anonymous",
      });
    };
  
    editorContainer?.addEventListener("pointermove", handlePointerMove);
    editorContainer?.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      editorContainer?.removeEventListener("pointermove", handlePointerMove);
      editorContainer?.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [workspaceId, user]);
  

  useEffect(() => {
    if (file) {
      setEditorSettings((prev) => ({
        ...prev,
        language: file.language,
      }));
      setEditorContent(file.content);
    }
  }, [file]);

  const handleRunCode = async () => {
    if (!file?.content) {
      setOutput("Error: No code to execute");
      return;
    }
    setOutput("Running code...");
    try {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let language;
      switch (fileExtension) {
        case "js": language = "javascript"; break;
        case "py": language = "python"; break;
        case "cpp": language = "cpp"; break;
        case "c": language = "c"; break;
        case "java": language = "java"; break;
        default: language = file.language?.toLowerCase() || "javascript";
      }
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/execute`,
        { code: file.content, language: language || "python", fileName: file.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
          timeout: 15000,
        }
      );
      if (response.data && typeof response.data.output === "string") {
        setOutput(response.data.output);
      } else if (response.data.error) {
        setOutput(`Execution Error: ${response.data.error}`);
      } else {
        setOutput("No output received from execution");
      }
    } catch (error) {
      console.error("Code execution error details:", error.response?.data);
      if (error.code === "ECONNABORTED") {
        setOutput("Error: Code execution timed out (15s limit)");
      } else if (error.response?.data?.message) {
        setOutput(`Error: ${error.response.data.message}`);
      } else {
        setOutput(`Error: ${error.message || "Unknown error occurred"}`);
      }
    }
  };

  const handleLanguageChange = (newLanguage) => {
    if (file && onFileChange) {
      const updatedFile = { ...file, language: newLanguage };
      onFileChange(updatedFile);
      fileService.updateFile(file._id, updatedFile).catch((error) =>
        console.error("Error updating file language:", error)
      );
    }
  };

  const handleContentChange = (newContent) => {
    setEditorContent(newContent);
    if (file && onFileChange) {
      const updatedFile = { ...file, content: newContent };
      onFileChange(updatedFile);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <EditorControls
  settings={editorSettings}
  onSettingsChange={(key, value) =>
    setEditorSettings((prev) => ({ ...prev, [key]: value }))
  }
  onRunCode={handleRunCode}
  usersOnline={Object.keys(cursors).length }
  onLanguageChange={handleLanguageChange}
/>
      <div className="flex flex-1 overflow-hidden">
        <div id="editor-container" className="flex-1 relative bg-tertiary">
          {Object.entries(cursors).map(([userId, { cursor, username }]) =>
            cursor ? (
              <Cursor
                key={`cursor-${userId}`}
                x={cursor.x}
                y={cursor.y}
                username={username || "Anonymous"}
              />
            ) : null
          )}
          {file ? (
            <CodeEditor
              file={file}
              settings={editorSettings}
              onFileChange={onFileChange}
              workspaceId={workspaceId}
              isTestMode={isTestMode}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-senary text-lg">
              No file selected. Create or select a file to start coding!
            </div>
          )}
        </div>
        <OutputPanel
          output={output}
          editorContent={editorContent}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
};

export default EditorArea;