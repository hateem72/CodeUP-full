import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import VapiStudentAssistant from "./VapiStudentAssistant";

const VivaWrapper = () => {
  const { state } = useLocation();
  const { uniqueCode } = useParams();
  const navigate = useNavigate();
  const [viva, setViva] = useState(state?.viva || null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!state?.viva);

  console.log("VivaWrapper initial state:", state);
  console.log("Initial viva:", viva);

  useEffect(() => {
    if (!viva) {
      console.log("Fetching viva for uniqueCode:", uniqueCode);
      const fetchViva = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          if (!token) {
            console.log("No token found, redirecting to login");
            setError("Please log in to access the viva.");
            navigate("/login");
            return;
          }
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/viva/link/${uniqueCode}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Fetch response in VivaWrapper:", response.data);
          if (!response.data || !response.data._id) {
            throw new Error("Invalid viva data received");
          }
          setViva(response.data);
        } catch (error) {
          console.error("Error fetching viva in VivaWrapper:", error);
          if (error.response?.status === 404) {
            setError("Viva not found. Please check the code and try again.");
          } else if (error.response?.status === 403) {
            setError("You have already submitted this viva.");
          } else if (error.response?.status === 400) {
            setError("Invalid unique code format.");
          } else {
            setError("Failed to load viva. Please try again later.");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchViva();
    }
  }, [uniqueCode, navigate]);

  const handleComplete = () => {
    navigate("/student-dashboard");
  };

  if (loading) {
    return <div className="text-center p-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-6">{error}</div>;
  }

  if (!viva) {
    console.log("Viva is null after fetch, displaying error");
    return <div className="text-red-500 text-center p-6">Failed to load viva. Please check the code and try again.</div>;
  }

  return <VapiStudentAssistant viva={viva} onComplete={handleComplete} />;
};

export default VivaWrapper;