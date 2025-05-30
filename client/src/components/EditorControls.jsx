import React from "react";

const EditorControls = ({ settings, onSettingsChange, onRunCode, usersOnline, onLanguageChange }) => {
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    onSettingsChange("language", newLanguage);
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  return (
    <div className="bg-quaternary p-3 flex justify-between items-center border-b border-senary shadow-md">
      {/* Left Controls */}
      <div className="flex space-x-3">
        <select
          value={settings.theme}
          onChange={(e) => onSettingsChange("theme", e.target.value)}
          className="bg-tertiary text-octonary p-2 rounded-lg border border-quinary focus:outline-none focus:ring-2 focus:ring-teal transition-all duration-200 text-sm"
        >
          <option value="vs-dark">Dark</option>
          <option value="vs-light">Light</option>
          <option value="hc-black">High Contrast</option>
        </select>
        <input
          type="number"
          value={settings.fontSize}
          onChange={(e) => onSettingsChange("fontSize", Number(e.target.value))}
          className="w-16 bg-tertiary text-octonary p-2 rounded-lg border border-quinary focus:outline-none focus:ring-2 focus:ring-teal transition-all duration-200 text-sm"
          min="12"
          max="24"
        />
        <select
          value={settings.language}
          onChange={handleLanguageChange}
          className="bg-tertiary text-octonary p-2 rounded-lg border border-quinary focus:outline-none focus:ring-2 focus:ring-teal transition-all duration-200 text-sm"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
        </select>
      </div>

     
      <div className="flex items-center space-x-4">
        <span className="text-senary font-medium">
          Online: <span className="text-teal">{usersOnline}</span>
        </span>
        <button
          onClick={onRunCode}
          className="bg-teal text-background px-4 py-2 rounded-lg hover:bg-hover-teal transition-all duration-200 text-sm font-semibold shadow-md"
        >
          Run Code
        </button>
      </div>
    </div>
  );
};

export default EditorControls;