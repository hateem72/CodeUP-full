import React from "react";

const ErrorDisplay = ({ error, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-6">
      <div className="bg-tertiary p-8 rounded-xl shadow-2xl w-full max-w-md border border-quaternary transform transition-all">
        <h2 className="text-2xl font-bold text-teal mb-4 text-center">Oops! Something Went Wrong</h2>
        <p className="text-octonary text-center mb-6">
          {error || "An unexpected error occurred. Please try again."}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-teal text-background py-3 px-4 rounded-lg shadow-md text-sm font-semibold uppercase tracking-wide transition-all duration-300 hover:bg-hover-teal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;