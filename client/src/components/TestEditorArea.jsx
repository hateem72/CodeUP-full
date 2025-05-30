import React, { useState, useEffect } from "react";
import axios from "axios";
import CodeEditor from "./CodeEditor.jsx";
import OutputPanel from "./OutputPanel.jsx";
import EditorControls from "./EditorControls.jsx";

const TestEditorArea = ({ file, user, files, onFileChange, isTestMode = true }) => {
  const [output, setOutput] = useState("");
  const [editorSettings, setEditorSettings] = useState({
    theme: "vs-dark",
    fontSize: 14,
    language: file?.language || "javascript",
  });
  const [editorContent, setEditorContent] = useState(file?.content || "");

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
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/execute`,
        { code: file.content, language: editorSettings.language, fileName: file.name },
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
    setEditorSettings((prev) => ({ ...prev, language: newLanguage }));
    if (file && onFileChange) {
      const updatedFile = { ...file, language: newLanguage };
      onFileChange(updatedFile);
    }
  };

  const handleContentChange = (newContent) => {
    setEditorContent(newContent);
    if (file && onFileChange) {
      const updatedFile = { ...file, content: newContent, language: editorSettings.language };
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
        onLanguageChange={handleLanguageChange}
        isTestMode={isTestMode}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-tertiary">
          {file ? (
            <CodeEditor
              file={file}
              settings={editorSettings}
              onFileChange={onFileChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-senary text-lg">
              No question selected.
            </div>
          )}
        </div>
        <OutputPanel
          output={output}
          editorContent={editorContent}
          onContentChange={handleContentChange}
          isTestMode={isTestMode}
        />
      </div>
    </div>
  );
};

export default TestEditorArea;