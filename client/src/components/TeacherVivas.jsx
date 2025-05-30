import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import vivaService from "../services/vivaService";
import LoadingSpinner from "../common/LoadingSpinner";

const TeacherVivas = ({ setSelectedViva }) => {
  const [vivas, setVivas] = useState([]);
  const [selectedViva, setSelectedVivaLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVivas = async () => {
      try {
        const data = await vivaService.getTeacherVivas();
        setVivas(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch vivas");
      } finally {
        setLoading(false);
      }
    };
    fetchVivas();
  }, []);

  const handleVivaSelect = (viva) => {
    setSelectedVivaLocal(viva);
    setSelectedViva(viva);
  };

  const updateVivaStatus = async (vivaId, status) => {
    try {
      await vivaService.updateVivaStatus(vivaId, status);
      setVivas((prev) =>
        prev.map((viva) =>
          viva._id === vivaId ? { ...viva, status } : viva
        )
      );
      setError(null);
      if (selectedViva?._id === vivaId) {
        setSelectedVivaLocal(null);
        setSelectedViva(null);
      }
    } catch (error) {
      console.error("Error updating viva status:", error);
      setError(error.response?.data?.message || "Failed to update viva status");
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-yellow text-lg font-medium mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-teal text-background rounded-full font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-teal mb-6">Your Vivas</h2>
      {vivas.length === 0 ? (
        <p className="text-senary text-center">No vivas created yet.</p>
      ) : (
        <ul className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
          {vivas.map((viva) => (
            <li
              key={viva._id}
              className={`p-4 rounded-lg cursor-pointer ${
                selectedViva?._id === viva._id ? "bg-quinary" : "bg-quaternary"
              } hover:bg-quinary transition-colors duration-300`}
              onClick={() => handleVivaSelect(viva)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-octonary truncate">{viva.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    viva.status === "ongoing" ? "bg-teal text-background" : "bg-yellow text-background"
                  }`}
                >
                  {viva.status === "ongoing" ? "Ongoing" : "Expired"}
                </span>
              </div>
              <p className="text-senary text-sm">Submissions: {viva.submissionCount || 0}</p>
              <p className="text-septenary text-xs">
                Created: {new Date(viva.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex justify-between">
                <Link
                  to={`/viva/${viva.uniqueCode}`}
                  className="text-teal hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateVivaStatus(viva._id, "ongoing");
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      viva.status === "ongoing"
                        ? "bg-teal text-background opacity-50 cursor-not-allowed"
                        : "bg-quaternary text-teal hover:bg-teal hover:text-background"
                    } transition-colors duration-200`}
                    disabled={viva.status === "ongoing"}
                  >
                    Ongoing
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateVivaStatus(viva._id, "expired");
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      viva.status === "expired"
                        ? "bg-yellow text-background opacity-50 cursor-not-allowed"
                        : "bg-quaternary text-yellow hover:bg-yellow hover:text-background"
                    } transition-colors duration-200`}
                    disabled={viva.status === "expired"}
                  >
                    Expired
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherVivas;