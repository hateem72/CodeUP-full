import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import testService from "../services/testService";
import LoadingSpinner from "../common/LoadingSpinner";

const TeacherTests = ({ selectedTest, setSelectedTest, setSubmissions }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const testsData = await testService.getTeacherTests();
        const testsWithCounts = await Promise.all(
          testsData.map(async (test) => {
            const submissions = await testService.getSubmissionsByTest(test._id);
            return { ...test, submissionCount: submissions.length };
          })
        );
        setTests(testsWithCounts);
      } catch (error) {
        console.error("Error fetching tests:", error);
        setError(error.response?.data?.message || "Failed to fetch tests");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const fetchSubmissions = async (testId) => {
    try {
      setLoading(true);
      const submissionsData = await testService.getSubmissionsByTest(testId);
      setSubmissions(submissionsData);
      setSelectedTest(tests.find((t) => t._id === testId));
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const updateTestStatus = async (testId, status) => {
    try {
      const updatedTest = await testService.updateTestStatus(testId, status);
      setTests((prev) =>
        prev.map((test) =>
          test._id === testId ? { ...test, status: updatedTest.status } : test
        )
      );
      setError(null);
      if (selectedTest?._id === testId) setSelectedTest(null);
    } catch (error) {
      console.error("Error updating test status:", error.response || error);
      setError(error.response?.data?.message || "Failed to update test status");
    }
  };

  if (loading) return <LoadingSpinner />;
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
      <h2 className="text-2xl font-semibold text-teal mb-6">Your Tests</h2>
      {tests.length === 0 ? (
        <p className="text-senary text-center">No tests created yet.</p>
      ) : (
        <ul className="space-y-4">
          {tests.map((test) => (
            <li
              key={test._id}
              className="bg-quaternary p-4 rounded-lg hover:bg-quinary transition-all duration-300 cursor-pointer"
              onClick={() => fetchSubmissions(test._id)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-octonary truncate">{test.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    test.status === "ongoing" ? "bg-teal text-background" : "bg-yellow text-background"
                  }`}
                >
                  {test.status === "ongoing" ? "Ongoing" : "Expired"}
                </span>
              </div>
              <p className="text-senary text-sm">Submissions: {test.submissionCount || 0}</p>
              <p className="text-septenary text-xs">
                Created: {new Date(test.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-3 flex justify-between">
                <Link
                  to={`/test/${test.uniqueLink}`}
                  className="text-teal hover:underline text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTestStatus(test._id, "ongoing");
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      test.status === "ongoing"
                        ? "bg-teal text-background opacity-50 cursor-not-allowed"
                        : "bg-quaternary text-teal hover:bg-teal hover:text-background"
                    } transition-colors duration-200`}
                    disabled={test.status === "ongoing"}
                  >
                    Ongoing
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateTestStatus(test._id, "expired");
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      test.status === "expired"
                        ? "bg-yellow text-background opacity-50 cursor-not-allowed"
                        : "bg-quaternary text-yellow hover:bg-yellow hover:text-background"
                    } transition-colors duration-200`}
                    disabled={test.status === "expired"}
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

export default TeacherTests;