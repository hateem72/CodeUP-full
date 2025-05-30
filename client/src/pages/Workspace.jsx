import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import FileManager from "../components/FileManager.jsx";
import EditorArea from "./EditorArea.jsx";
import LoadingSpinner from "../common/LoadingSpinner.jsx";

const Workspace = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/file/workspace/${id}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setFiles(response.data);
        setActiveFile(response.data[0] || null);
      } catch (error) {
        console.error("Error fetching files:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [id]);

  const handleFileChange = (updatedFile) => {
    setActiveFile(updatedFile);
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f._id === updatedFile._id ? updatedFile : f))
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-background text-octonary">
      <FileManager
        files={files}
        setFiles={setFiles}
        activeFile={activeFile}
        setActiveFile={handleFileChange}
      />
      <EditorArea
        file={activeFile}
        user={user}
        files={files}
        onFileChange={handleFileChange}
        workspaceId={id}
      />
    </div>
  );
};

export default Workspace;