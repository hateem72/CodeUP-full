import React from 'react';

const QuestionPanel = ({ test, currentQuestion, setCurrentQuestion, answers }) => (
  <div className="w-1/3 p-4 bg-tertiary border-r border-senary overflow-y-auto">
    <h2 className="text-xl font-bold text-octonary mb-4">{test.title}</h2>
    <div className="space-y-4">
      {test.questions.map((q, index) => (
        <button
          key={index}
          onClick={() => setCurrentQuestion(index)}
          className={`w-full p-4 rounded-lg text-left ${
            currentQuestion === index
              ? 'bg-teal text-white'
              : 'bg-quaternary text-octonary hover:bg-teal/10'
          } ${answers[index]?.submitted ? 'border-2 border-green-500' : ''}`}
        >
          <div className="font-medium">Question {index + 1}</div>
          <div className="text-sm mt-1">{q.question.substring(0, 100)}...</div>
          <div className="text-sm mt-2">Marks: {q.marks}</div>
        </button>
      ))}
    </div>
  </div>
);

export default QuestionPanel;