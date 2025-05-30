import React from "react";
import { AIHelp, AIDoc, AIOptimizer } from "./AIComponents"; 
import DostAI from "./DostAI";
import DostAiAgent from "./DostAiAgent";
import AIExplain from "./AIExplain";


const OutputPanel = ({ output, editorContent, onContentChange, isTestMode = false }) => {
  return (
    <div className="w-1/3 bg-tertiary p-4 flex flex-col">
      <h3 className="text-teal font-semibold mb-2">Output</h3>
      <pre className="flex-1 bg-gray-900 text-green-400 p-4 rounded overflow-auto">
        {output || "Click 'Run' to see output"}
      </pre>
      {!isTestMode && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <DostAiAgent editorContent={editorContent} />
          <AIHelp editorContent={editorContent} onContentChange={onContentChange} />
          <AIDoc editorContent={editorContent} onContentChange={onContentChange} />
          <AIOptimizer editorContent={editorContent} onContentChange={onContentChange} />
          {/* <AIExplain editorContent={editorContent} /> */}
        </div>
      )}
    </div>
  );
};

export default OutputPanel;