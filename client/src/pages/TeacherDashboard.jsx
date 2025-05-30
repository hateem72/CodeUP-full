
import React, { useState } from "react";
import { Link } from "react-router-dom";
import TeacherTests from "../components/TeacherTests";
import SubmissionsOnTest from "../components/SubmissionsOnTest";
import TeacherVivas from "../components/TeacherVivas";
import VivaSubmissions from "../components/VivaSubmissions";

const TeacherDashboard = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedViva, setSelectedViva] = useState(null);

  return (
    <div className="min-h-screen bg-background text-octonary">
      <header className="bg-gradient-to-r from-teal to-hover-teal p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-bold text-background">Teacher Dashboard</h1>
          <div className="flex gap-4">
            <Link
              to="/create-test"
              className="px-6 py-3 bg-background text-teal rounded-full font-semibold hover:bg-quinary transition-colors duration-300 shadow-md"
            >
              Create New Test
            </Link>
            {/* <Link
              to="/create-viva"
              className="px-6 py-3 bg-background text-teal rounded-full font-semibold hover:bg-quinary transition-colors duration-300 shadow-md"
            >
              Create New Viva
            </Link> */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Sidebar for Tests and Vivas */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-6">
          <div className="bg-tertiary p-6 rounded-2xl shadow-xl">
            <TeacherTests
              selectedTest={selectedTest}
              setSelectedTest={setSelectedTest}
              setSubmissions={setSubmissions}
            />
          </div>
          {/* <div className="bg-tertiary p-6 rounded-2xl shadow-xl">
            <TeacherVivas setSelectedViva={setSelectedViva} />
          </div> */}
        </div>

        {/* Main Content for Submissions */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
          <div className="bg-tertiary p-6 rounded-2xl shadow-xl">
            <SubmissionsOnTest selectedTest={selectedTest} submissions={submissions} />
          </div>
          {/* <div className="bg-tertiary p-6 rounded-2xl shadow-xl">
            <VivaSubmissions selectedViva={selectedViva} />
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
