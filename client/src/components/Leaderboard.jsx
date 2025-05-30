import React, { useState, useEffect } from "react";
import axios from "axios";

const Leaderboard = ({ testId }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/teacher/tests/${testId}/leaderboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setLeaderboard(res.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };
    fetchLeaderboard();
  }, [testId]);

  return (
    <div className="bg-tertiary p-6 rounded-lg shadow-lg mt-6">
      <h2 className="text-xl font-semibold text-octonary mb-4">Leaderboard</h2>
      {leaderboard.length === 0 ? (
        <p className="text-senary">No leaderboard data yet</p>
      ) : (
        <table className="w-full text-octonary">
          <thead>
            <tr className="border-b border-senary">
              <th className="text-left p-2">Rank</th>
              <th className="text-left p-2">Student</th>
              <th className="text-left p-2">Marks</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index} className="border-b border-senary">
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{entry.studentName}</td>
                <td className="p-2">{entry.totalMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;