import React from 'react';
import CodeEditor from './CodeEditor';

const EditorPanel = ({
  question,
  questionNumber,
  code,
  isSubmitted,
  isSubmitting,
  onCodeChange,
  onSubmit
}) => (
  <div className="flex-1 flex flex-col">
    <div className="p-4 bg-tertiary border-b border-senary">
      <h3 className="text-lg font-medium text-octonary">
        Question {questionNumber}
      </h3>
      <p className="mt-2 text-senary">{question.question}</p>
    </div>
    <div className="flex-1">
      <CodeEditor
        value={code}
        onChange={onCodeChange}
        language="javascript"
        readOnly={isSubmitted}
      />
    </div>
    <div className="p-4 bg-tertiary border-t border-senary">
      <button
        onClick={onSubmit}
        disabled={isSubmitted || isSubmitting}
        className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : isSubmitted ? 'Submitted' : 'Submit Answer'}
      </button>
    </div>
  </div>
);

export default EditorPanel;