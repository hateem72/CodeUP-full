import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VapiAssistant from "../components/VapiAssistant";
import vivaService from "../services/vivaService";

const CreateViva = () => {
  const navigate = useNavigate();
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVivaCreated = async (vivaData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await vivaService.createViva(vivaData);
      if (!response.uniqueCode) {
        throw new Error("No uniqueCode returned from server");
      }
      setGeneratedLink(response.uniqueCode);
      setShowLinkPopup(true);
    } catch (error) {
      console.error("Error creating viva:", error);
      setError("Failed to create viva. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-octonary mb-6">Create Viva</h2>
      <VapiAssistant onVivaCreated={handleVivaCreated} />
      {loading && (
        <div className="text-center text-teal font-semibold mt-4">Creating viva...</div>
      )}
      {error && (
        <div className="text-center text-red-500 font-semibold mt-4">{error}</div>
      )}
      {showLinkPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-tertiary p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-teal mb-4">Viva Created Successfully!</h3>
            <p className="text-octonary mb-4">Share this unique code with your students:</p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="w-full p-2 bg-quaternary text-octonary rounded border border-senary"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLink);
                  const button = document.activeElement;
                  button.textContent = "Copied!";
                  setTimeout(() => {
                    button.textContent = "Copy";
                  }, 1000);
                }}
                className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate(`/viva/${generatedLink}`)}
                className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-600 transition-colors"
              >
                View Viva
              </button>
              <button
                onClick={() => {
                  setShowLinkPopup(false);
                  setGeneratedLink("");
                }}
                className="px-4 py-2 bg-senary text-white rounded hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateViva;