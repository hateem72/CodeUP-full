import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import SubmitTest from "../components/SubmittedTest.jsx";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { workspaceService } from "../services/workspaceService.js";
import vivaService from "../services/vivaService.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [invitedWorkspaces, setInvitedWorkspaces] = useState([]);
  const [uniqueCode, setUniqueCode] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [vivaSubmissions, setVivaSubmissions] = useState([]);
  const [vivaUniqueCode, setVivaUniqueCode] = useState("");
  const [selectedVivaSubmission, setSelectedVivaSubmission] = useState(null);
  const [vivaError, setVivaError] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch test submissions
      const subRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/submissions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const validSubmissions = subRes.data.filter(sub =>
        sub && sub.test && Array.isArray(sub.answers)
      );
      setSubmissions(validSubmissions);

      // Fetch viva submissions
      try {
  const vivaSubs = await vivaService.getStudentVivaSubmissions();
  console.log("Fetched viva submissions:", vivaSubs);
  setVivaSubmissions(
    Array.isArray(vivaSubs)
      ? vivaSubs.filter(sub => sub && sub.viva)
      : []
  );
  setVivaError(null);
} catch (error) {
  console.error("Error fetching viva submissions:", error);
  setVivaSubmissions([]);
  setVivaError(
    error.message === "Authentication required"
      ? "Please login again to view submissions"
      : "Failed to load viva submissions. Please try again."
  );
}

      // Fetch workspaces
      const allWorkspaces = await workspaceService.getWorkspaces();
      setWorkspaces(
        allWorkspaces.filter((w) =>
          w.members.some((m) => m.userId._id === user.id && m.role === "owner")
        )
      );
      setInvitedWorkspaces(
        allWorkspaces.filter((w) =>
          w.members.some((m) => m.userId._id === user.id && m.role !== "owner")
        )
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load test submissions or workspaces");
    }
  };
  fetchData();
}, [user.id]);

  const handleOpenTest = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/test/link/${uniqueCode}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      navigate(`/test/${uniqueCode}`);
    } catch (error) {
      console.error("Error opening test:", error);
      setError("Invalid or unavailable test code");
    }
  };

  const handleOpenViva = async () => {
    try {
      await vivaService.getVivaByUniqueCode(vivaUniqueCode);
      navigate(`/viva/${vivaUniqueCode}`);
    } catch (error) {
      console.error("Error opening viva:", error);
      if (error.response?.status === 404) {
        setVivaError("Viva not found. Please check the unique code.");
      } else if (error.response?.status === 403) {
        setVivaError("You have already submitted this viva.");
      } else if (error.response?.status === 400) {
        setVivaError("Invalid unique code format.");
      } else {
        setVivaError("An error occurred while opening the viva: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleNavigateToWorkspaces = () => {
    navigate("/workspaces");
  };

  const testsAttempted = submissions.length;
  const vivasAttempted = vivaSubmissions.length;
  const workspacesCreated = workspaces.length;
  const invitedCount = invitedWorkspaces.length;

  const chartData = {
    labels: submissions.map((sub) => sub.test?.title || 'Untitled Test'),
    datasets: [
      {
        label: "Marks Obtained",
        data: submissions.map((sub) => sub.answers?.reduce((sum, ans) => sum + (ans.marks || 0), 0) || 0),
        backgroundColor: submissions.map((sub) =>
          sub.answers?.some((ans) => ans.marks > 0) ? "#3dffa2" : "#f8ec9e"
        ),
        borderColor: submissions.map((sub) =>
          sub.answers?.some((ans) => ans.marks > 0) ? "#2ecc8b" : "#e6d87a"
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#b3b3b3" },
      },
      title: {
        display: true,
        text: "Your Performance Statistics",
        color: "#3dffa2",
        font: { size: 18 },
      },
      tooltip: {
        backgroundColor: "#333333",
        titleColor: "#b3b3b3",
        bodyColor: "#b3b3b3",
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#999999" },
        grid: { color: "#4d4d4d" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#999999" },
        grid: { color: "#4d4d4d" },
        title: {
          display: true,
          text: "Marks Obtained",
          color: "#b3b3b3",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-teal tracking-tight">Student Dashboard</h1>
        <button
          onClick={handleNavigateToWorkspaces}
          className="bg-teal text-background py-2 px-6 rounded-lg font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-sm"
        >
          Go to Workspaces
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-tertiary p-3 rounded-lg shadow-md border border-quaternary text-center">
          <h3 className="text-base font-semibold text-octonary">Tests Attempted</h3>
          <p className="text-xl text-teal mt-1">{testsAttempted}</p>
        </div>
        <div className="bg-tertiary p-3 rounded-lg shadow-md border border-quaternary text-center">
          <h3 className="text-base font-semibold text-octonary">Passed Test</h3>
          <p className="text-xl text-teal mt-1">{testsAttempted}</p>
        </div>
        <div className="bg-tertiary p-3 rounded-lg shadow-md border border-quaternary text-center">
          <h3 className="text-base font-semibold text-octonary">Workspaces Created</h3>
          <p className="text-xl text-teal mt-1">{workspacesCreated}</p>
        </div>
        <div className="bg-tertiary p-3 rounded-lg shadow-md border border-quaternary text-center">
          <h3 className="text-base font-semibold text-octonary">Invited Workspaces</h3>
          <p className="text-xl text-teal mt-1">{invitedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
            <h2 className="text-2xl font-semibold text-octonary mb-4">Open a Test</h2>
            <input
              type="text"
              value={uniqueCode}
              onChange={(e) => setUniqueCode(e.target.value)}
              placeholder="Enter test unique code"
              className="w-full p-3 bg-quaternary text-octonary rounded-lg border border-senary focus:outline-none focus:border-teal transition-colors duration-200 placeholder-septenary"
            />
            <button
              onClick={handleOpenTest}
              className="mt-4 w-full bg-teal text-background py-3 rounded-lg font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-sm"
            >
              Open Test
            </button>
            {error && <p className="text-yellow mt-3 text-sm">{error}</p>}
          </div>
          {/* <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
            <h2 className="text-2xl font-semibold text-octonary mb-4">Open a Viva</h2>
            <input
              type="text"
              value={vivaUniqueCode}
              onChange={(e) => setVivaUniqueCode(e.target.value.toUpperCase())}
              placeholder="Enter viva unique code"
              className="w-full p-3 bg-quaternary text-octonary rounded-lg border border-senary focus:outline-none focus:border-teal transition-colors duration-200 placeholder-septenary"
            />
            <button
              onClick={handleOpenViva}
              className="mt-4 w-full bg-teal text-background py-3 rounded-lg font-semibold hover:bg-hover-teal transition-colors duration-300 shadow-sm"
            >
              Open Viva
            </button>
            {vivaError && <p className="text-yellow mt-3 text-sm">{vivaError}</p>}
          </div> */}
        </div>
        <div className="md:col-span-1 space-y-6">
          <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
            <h2 className="text-2xl font-semibold text-octonary mb-4">Your Test Submissions</h2>
            <ul className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {submissions.length === 0 ? (
                <li className="text-senary text-center">No submissions yet</li>
              ) : (
                submissions.map((sub) => (
                  <li
                    key={sub._id}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setSelectedVivaSubmission(null);
                    }}
                    className="bg-quaternary p-4 rounded-lg cursor-pointer hover:bg-quinary transition-colors duration-200 text-octonary shadow-sm"
                  >
                    <span className="font-medium">{sub.test?.title || "Untitled Test"}</span> -{" "}
                    <span className={sub.answers?.some((ans) => ans.marks > 0) ? "text-teal" : "text-yellow"}>
                      {sub.answers?.some((ans) => ans.marks > 0) ? "Evaluated" : "Pending"}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
          {/* <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
            <h2 className="text-2xl font-semibold text-octonary mb-4">Your Viva Submissions</h2>
            {vivaError ? (
              <div className="text-yellow text-center p-4 bg-quaternary rounded-lg">
                {vivaError}
              </div>
            ) : (
              <ul className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {vivaSubmissions.length === 0 ? (
                  <li className="text-senary text-center py-4">No viva submissions yet</li>
                ) : (
                  vivaSubmissions.map((sub) => (
                    <li
                      key={sub._id}
                      onClick={() => {
                        setSelectedVivaSubmission(sub);
                        setSelectedSubmission(null);
                      }}
                      className={`bg-quaternary p-4 rounded-lg cursor-pointer hover:bg-quinary transition-colors duration-200 text-octonary shadow-sm border ${
                        sub.evaluatedAt ? 'border-teal' : 'border-senary'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sub.viva?.title || "Untitled Viva"}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          sub.evaluatedAt
                            ? 'bg-teal text-background'
                            : 'bg-yellow text-background'
                        }`}>
                          {sub.evaluatedAt
                            ? `Score: ${sub.marks?.obtained || 0}/${sub.marks?.max || 100}`
                            : 'Pending'}
                        </span>
                      </div>
                      <div className="text-septenary text-sm mt-2">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div> */}
        </div>
        <div className="md:col-span-2 space-y-6">
          <div className="bg-tertiary p-6 rounded-lg shadow-md border border-quaternary">
            <Bar data={chartData} options={chartOptions} />
          </div>
          {selectedSubmission && <SubmitTest submission={selectedSubmission} />}
          {/* {selectedVivaSubmission && (
            <div className="bg-tertiary p-6 rounded-lg shadow-lg border border-quaternary">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-teal">
                    {selectedVivaSubmission.viva?.title || "Untitled Viva"}
                  </h2>
                  <p className="text-septenary mt-2">
                    Submitted: <span className="text-octonary">
                      {new Date(selectedVivaSubmission.submittedAt).toLocaleString()}
                    </span>
                  </p>
                </div>
                {selectedVivaSubmission.evaluatedAt && (
                  <div className="bg-quaternary p-3 rounded-lg text-center min-w-[120px]">
                    <div className="text-teal text-2xl font-bold">
                      {selectedVivaSubmission.marks?.obtained || 0}/{selectedVivaSubmission.marks?.max || 100}
                    </div>
                    <div className="text-septenary text-sm">Total Score</div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="border-b border-quaternary pb-4">
                  <h3 className="text-2xl font-semibold text-octonary">Submission Details</h3>
                  {selectedVivaSubmission.transcript && (
                    <div className="mt-4 bg-quaternary p-4 rounded-lg">
                      <h4 className="text-teal font-medium mb-2">Transcript</h4>
                      <p className="text-octonary text-sm whitespace-pre-wrap">
                        {selectedVivaSubmission.transcript}
                      </p>
                    </div>
                  )}
                </div>

                {selectedVivaSubmission.answers?.length === 0 ? (
                  <p className="text-senary text-lg text-center py-4">No answers submitted</p>
                ) : (
                  <div className="space-y-4">
                    {selectedVivaSubmission.answers.map((ans, index) => (
                      <div
                        key={index}
                        className="bg-quaternary p-5 rounded-lg border border-senary shadow-md hover:border-teal transition-colors duration-200"
                      >
                        <h4 className="text-xl font-medium text-teal mb-3">
                          Question {index + 1}: {ans.question}
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-background p-3 rounded-lg">
                            <p className="text-octonary text-sm whitespace-pre-wrap">
                              {ans.response || "No response recorded"}
                            </p>
                          </div>
                          {ans.marks > 0 && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-septenary">
                                <span className="font-medium text-teal">Marks:</span> {ans.marks}
                              </span>
                              {ans.feedback && (
                                <span className="text-septenary flex-1 ml-4">
                                  <span className="font-medium text-teal">Feedback:</span>{" "}
                                  <span className="text-octonary">{ans.feedback}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedVivaSubmission.feedback && (
                  <div className="mt-6 bg-quaternary p-4 rounded-lg">
                    <h4 className="text-teal font-medium mb-2">Overall Feedback</h4>
                    <p className="text-octonary whitespace-pre-wrap">
                      {selectedVivaSubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;