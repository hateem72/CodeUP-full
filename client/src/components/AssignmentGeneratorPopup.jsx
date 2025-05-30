import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { fetchAifyResponse } from "../services/geminiService";

const AssignmentGeneratorPopup = ({ files, workspaceId, onClose }) => {
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    rollNo: "",
    class: "",
    section: "",
    branch: "",
    college: "",
  });
  const [questions, setQuestions] = useState(files.map(() => ""));
  const [outputs, setOutputs] = useState(files.map(() => ""));
  const [loading, setLoading] = useState(false);

 
  useEffect(() => {
    const fetchOutputs = async () => {
      setLoading(true);
      const outputPromises = files.map((file) =>
        fetchAifyResponse(`  
          Analyze and execute the following code strictly as written:\n${file.content}\n  
          - If the code runs successfully without **any** syntax errors, missing characters, or runtime exceptions, return **only** the raw output as it would appear in a terminal.  
          - If there is **any** error, even a minor syntax issue (missing semicolons, brackets, incorrect syntax, or undeclared variables), return **only** the word **"Error"** without any additional text, explanation, or formatting.  
          - Perform a strict syntax check before execution. If syntax validation fails, return **"Error"** immediately.  
          - Do not attempt to correct, explain, or describe errors—return **only** the exact output or **"Error"**.  
          - Do not include markdown, code blocks, or any extra content beyond the output or **"Error"**.  
        `)   
        .catch(() => "Error")
      );
      const results = await Promise.all(outputPromises);
      setOutputs(results);
      console.log("Outputs:", results);
      setLoading(false);
    };

    fetchOutputs();
  }, [files]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, value) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      newQuestions[index] = value;
      return newQuestions;
    });
  };

  const generatePDF = () => {
    setLoading(true);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    const footerHeight = 15;
    const headerHeight = 30;

    doc.setFont("helvetica");

    files.forEach((file, index) => {
      if (index > 0) doc.addPage();
      let yOffset = headerHeight;

      // HEADER SECTION
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const title = `Assignment ${index + 1}`;
      doc.text(title, margin, 20);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, 25, pageWidth - margin, 25);
      doc.setFontSize(10);
      doc.text(`Page ${index + 1} of ${files.length}`, pageWidth - margin, 20, { align: "right" });

      // MAIN CONTENT
      if (questions[index]) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(50, 50, 50);
        const questionLines = doc.splitTextToSize(questions[index], maxWidth);
        doc.text(questionLines, margin, yOffset);
        yOffset += questionLines.length * 6 + 10;
      }

      // Code section
      doc.setFontSize(10);
      doc.setFont("courier");
      doc.setTextColor(0, 0, 0);
      const codeLines = doc.splitTextToSize(file.content || "No code available", maxWidth);

      if (yOffset + codeLines.length * 5 > pageHeight - footerHeight - 20) {
        doc.addPage();
        yOffset = headerHeight;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, 20);
        doc.line(margin, 25, pageWidth - margin, 25);
        doc.setFontSize(10);
        doc.text(`Page ${index + 1} of ${files.length} (cont.)`, pageWidth - margin, 20, { align: "right" });
      }

      doc.setFillColor(240, 240, 240);
      const codeBlockHeight = codeLines.length * 5 + 10;
      doc.rect(margin, yOffset, maxWidth, codeBlockHeight, "F");
      doc.text(codeLines, margin + 2, yOffset + 5);
      yOffset += codeBlockHeight + 15;

      // Output section
      const minOutputHeight = 30;
      const outputText = `Output: ${outputs[index] || "Loading..."}`;
      const outputLines = doc.splitTextToSize(outputText, maxWidth);
      const calculatedHeight = outputLines.length * 5 + 10;
      const outputHeight = Math.max(calculatedHeight, minOutputHeight);

      if (yOffset + outputHeight > pageHeight - footerHeight) {
        doc.addPage();
        yOffset = headerHeight;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, 20);
        doc.line(margin, 25, pageWidth - margin, 25);
        doc.setFontSize(10);
        doc.text(`Page ${index + 1} of ${files.length} (cont.)`, pageWidth - margin, 20, { align: "right" });
      }

      const outputY = pageHeight - footerHeight - outputHeight - 5;
      doc.setFontSize(10);
      doc.setFont("helvetica");
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(50, 50, 50);
      doc.rect(margin, outputY, maxWidth, outputHeight, "F");
      doc.text(outputLines, margin + 2, outputY + 5);

      // FOOTER SECTION
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);

      const footerText = [
        `Name: ${studentDetails.name || "N/A"}`,
        `Roll No: ${studentDetails.rollNo || "N/A"}`,
        `Class: ${studentDetails.class || "N/A"}`,
        `Section: ${studentDetails.section || "N/A"}`,
        `Branch: ${studentDetails.branch || "N/A"}`,
        `College: ${studentDetails.college || "N/A"}`,
        `Date: ${new Date().toLocaleDateString()}`,
      ].join(" | ");

      doc.text(footerText, margin, pageHeight - footerHeight + 5);
    });

    doc.save(`Assignment_${workspaceId}.pdf`);
    setLoading(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-tertiary to-quaternary p-8 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto transform transition-all duration-300 scale-100 hover:scale-105">
       
        <h3 className="text-3xl font-extrabold text-teal mb-6 bg-gradient-to-r from-teal to-hover-teal text-transparent bg-clip-text">
          Assignment Generator
        </h3>      
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-octonary mb-4 border-b-2 border-teal pb-2">
            Student Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "name", placeholder: "Name" },
              { name: "rollNo", placeholder: "Roll No" },
              { name: "class", placeholder: "Class" },
              { name: "section", placeholder: "Section" },
              { name: "branch", placeholder: "Branch" },
              { name: "college", placeholder: "College" },
            ].map((field) => (
              <input
                key={field.name}
                type="text"
                name={field.name}
                value={studentDetails[field.name]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="px-4 py-3 bg-quaternary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:bg-quinary transition-all duration-300 shadow-inner hover:shadow-md"
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-xl font-semibold text-octonary mb-4 border-b-2 border-teal pb-2">
            Add Questions (Optional)
          </h4>
          {files.map((file, index) => (
            <div key={file._id} className="mb-6 bg-quaternary p-4 rounded-lg shadow-md">
              <label className="text-senary text-sm font-medium mb-2 block">
                Program {index + 1}
              </label>
              <textarea
                value={questions[index]}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                placeholder={`Question for Program ${index + 1}`}
                className="w-full px-4 py-3 bg-tertiary text-octonary border border-senary rounded-lg focus:outline-none focus:ring-2 focus:ring-teal focus:bg-quinary transition-all duration-300 resize-y shadow-inner hover:shadow-md"
                rows="3"
              />
            </div>
          ))}
        </div>

      
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-quaternary text-octonary rounded-full font-semibold hover:bg-tertiary hover:text-teal transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
          <button
            onClick={generatePDF}
            disabled={loading}
            className={`px-6 py-3 bg-teal text-background rounded-full font-semibold hover:bg-hover-teal transition-all duration-300 shadow-lg hover:shadow-xl ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                Generating...
              </span>
            ) : (
              "Download PDF"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentGeneratorPopup;