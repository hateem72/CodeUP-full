import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import vivaService from "../services/vivaService.js";
import VapiStudentAssistant from "../components/VapiStudentAssistant.jsx";

const GiveViva = () => {
  const { uniqueCode } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [viva, setViva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViva = async () => {
      try {
        const response = await vivaService.getVivaByUniqueCode(uniqueCode);
        // console.log("Fetched viva:", response); // Add this log
        setViva(response);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        } else {
          setError("Failed to load viva. Please check the code and try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchViva();
  }, [uniqueCode, navigate, logout]);

  const handleComplete = () => {
    navigate("/dashboard");
  };

  if (loading) return <div className="min-h-screen p-6 bg-background">Loading viva...</div>;
  if (error) return <div className="min-h-screen p-6 bg-background text-red-500">{error}</div>;
  if (!viva) return <div className="min-h-screen p-6 bg-background">No viva found.</div>;

  return (
    <div className="min-h-screen p-6 bg-background">
      <h1 className="text-3xl font-bold mb-4 text-teal">Give Viva: {viva.title}</h1>
      <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
        <VapiStudentAssistant
          viva={viva}
          studentId={user.id}
          onComplete={handleComplete}
        />
      </div>
      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to exit the viva? Your progress will be lost.")) {
            navigate("/dashboard");
          }
        }}
        className="mt-6 bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600"
      >
        Exit Viva
      </button>
    </div>
  );
};

export default GiveViva;