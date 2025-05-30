import React, { useContext, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import { VapiProvider } from './context/VapiContext';

import Login from "./pages/Login.jsx";
import TeacherEvaluation from "./pages/TeacherEvaluation.jsx";
import Register from "./pages/Register.jsx";
import Workspaces from "./pages/Workspaces.jsx";
import Workspace from "./pages/Workspace.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Header from "./components/Header.jsx";
import DostAIPage from "./pages/DostAi.jsx";
import AIExplain from "./components/AIExplain.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import TestWorkspace from "./pages/TestWorkspace.jsx";
import CreateTest from "./components/CreateTest.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import LoadingSpinner from "./common/LoadingSpinner.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import CreateViva from "./pages/CreateViva.jsx";
import GiveViva from "./pages/GiveViva.jsx";
import RoadmapInput from "./components/RoadmapInput.jsx";
const App = () => {
  const { user, loading } = useContext(AuthContext);
  const [isLiveSharing, setIsLiveSharing] = useState(true);
  const location = useLocation();

  const noHeaderRoutes = ["/", "/login", "/register", "/workspace/:id"];

  if (loading) {
    return <LoadingSpinner />;
  }

  const toggleLiveSharing = () => {
    setIsLiveSharing((prev) => !prev);
  };

  const showHeader = !noHeaderRoutes.some((route) => {
    const pattern = route.replace(/:\w+/g, "[^/]+");
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(location.pathname);
  });
  const LazyVivaFeedback = lazy(() => import("./pages/VivaFeedback.jsx").catch((err) => {
    console.error("Failed to load VivaFeedback:", err);
    return { default: () => <div>Error loading feedback page</div> };
  }));
  
  return (
    <ErrorBoundary>
      <VapiProvider>
      <div className="min-h-screen bg-background">
        {showHeader && <Header isLiveSharing={isLiveSharing} toggleLiveSharing={toggleLiveSharing} />}
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
              path="/ai"
              element={<AIExplain />}
            />
            <Route
              path="/workspaces"
              element={user ? <Workspaces /> : <Navigate to="/login" />}
            />
            <Route
              path="/teacher/evaluate/:submissionId"
              element={<TeacherEvaluation />}
            />
            <Route
              path="/dashboard"
              element={
                user ? (
                  user.role === "student" ? (
                    <StudentDashboard />
                  ) : (
                    <TeacherDashboard />
                  )
                ) : (
                  <Navigate to="/login" state={{ from: location }} />
                )
              }
            />
            <Route
              path="/workspace/:id"
              element={
                user ? (
                  <Workspace />
                ) : (
                  <Navigate to="/login" state={{ from: location }} />
                )
              }
            />
            <Route
              path="/dostai"
              element={
                user ? (
                  <DostAIPage />
                ) : (
                  <Navigate to="/login" state={{ from: location }} />
                )
              }
            />
            <Route
        path="/roadmap"
        element={<Navigate to="/roadmap/generate" replace />}
      />
      {/* Roadmap Generator */}
      <Route
        path="/roadmap/generate"
        element={
          user ? (
            <RoadmapInput />
          ) : (
            <Navigate to="/login" state={{ from: location }} />
          )
        }
      />
      {/* Specific Roadmap by ID */}
      <Route
        path="/roadmap/:id"
        element={
          user ? (
            <Roadmap user={user} />
          ) : (
            <Navigate to="/login" state={{ from: location }} />
          )
        }
      />
            <Route
              path="/create-test"
              element={
                user && user.role === "teacher" ? (
                  <CreateTest />
                ) : (
                  <Navigate to="/login" state={{ from: location }} />
                )
              }
            />
            <Route
              path="/test/:uniqueLink"
              element={
                user ? (
                  <TestWorkspace />
                ) : (
                  <Navigate to="/login" state={{ from: location }} />
                )
              }
            />
             <Route
                path="/create-viva"
                element={
                  user && user.role === "teacher" ? (
                    <CreateViva />
                  ) : (
                    <Navigate to="/login" replace state={{ from: location }} />
                  )
                }
              />
               <Route
                path="/viva/:uniqueCode"
                element={
                  user && user.role === "student" ? (
                    <GiveViva />
                  ) : (
                    <Navigate to="/login" replace state={{ from: location }} />
                  )
                }
              />
              <Route
                path="/viva-feedback"
                element={
                  user && user.role === "student" ? (
                    <Suspense fallback={<div>Loading...</div>}>
                      {/* Ensure VivaFeedback.jsx has a default export: export default VivaFeedback */}
                      <LazyVivaFeedback />
                    </Suspense>
                  ) : (
                    <Navigate to="/login" replace state={{ from: location }} />
                  )
                }
              />
          </Routes>
        </main>
      </div>
      </VapiProvider>
    </ErrorBoundary>
  );
};

export default App;