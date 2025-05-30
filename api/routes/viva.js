import express from "express";
import mongoose from "mongoose";
import Viva from "../models/Viva.js";
import VivaSubmission from "../models/VivaSubmission.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateQuestionsFromGemini } from "../utils/geminiClient.js";

const router = express.Router();

// Helper function to generate unique code
const generateUniqueCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Create a new viva
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, topic, numberOfQuestions, difficulty } = req.body;
    if (!title || !topic || !numberOfQuestions || !difficulty) {
      return res.status(400).json({ message: "Title, topic, numberOfQuestions, and difficulty are required" });
    }

    const numQuestions = parseInt(numberOfQuestions, 10);
    if (isNaN(numQuestions) || numQuestions <= 0) {
      return res.status(400).json({ message: "numberOfQuestions must be a positive integer" });
    }

    const validDifficulties = ["easy", "medium", "hard"];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      return res.status(400).json({ message: "Difficulty must be one of: easy, medium, hard" });
    }

    let uniqueCode;
    let existingViva;
    do {
      uniqueCode = generateUniqueCode();
      existingViva = await Viva.findOne({ uniqueCode });
    } while (existingViva);

    const viva = new Viva({
      title,
      topic,
      numberOfQuestions: numQuestions,
      difficulty: difficulty.toLowerCase(),
      uniqueCode,
      teacherId: req.user.id,
    });

    await viva.save();

    res.status(201).json({ uniqueCode });
  } catch (error) {
    console.error("Error creating viva:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Get vivas created by the authenticated teacher
router.get("/teacher", authMiddleware, async (req, res) => {
  try {
    const vivas = await Viva.find({ teacherId: req.user.id }).sort({ createdAt: -1 });
    const vivasWithCounts = await Promise.all(
      vivas.map(async (viva) => {
        const submissions = await VivaSubmission.find({ viva: viva._id });
        return { ...viva.toObject(), submissionCount: submissions.length };
      })
    );
    res.json(vivasWithCounts);
  } catch (error) {
    console.error("Error fetching vivas:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:vivaId/submissions", authMiddleware, async (req, res) => {
  try {
    const { vivaId } = req.params;
    if (!vivaId || vivaId === "undefined") {
      return res.status(400).json({ message: "Invalid vivaId" });
    }
    if (!mongoose.Types.ObjectId.isValid(vivaId)) {
      return res.status(400).json({ message: "Invalid vivaId format" });
    }
    const submissions = await VivaSubmission.find({ viva: vivaId })
      .populate("student", "email")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching viva submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/:vivaId/evaluation", authMiddleware, async (req, res) => {
  try {
    const { vivaId } = req.params;
    const { feedback, score, marks, transcript } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vivaId)) {
      return res.status(400).json({ message: "Invalid viva ID" });
    }

    // Find or create submission
    let submission = await VivaSubmission.findOne({
      viva: vivaId,
      student: req.user.id
    });

    if (!submission) {
      submission = new VivaSubmission({
        viva: vivaId,
        student: req.user.id,
        answers: [],
        submittedAt: new Date()
      });
    }

    // Update with evaluation data
    submission.feedback = feedback;
    submission.score = score;
    submission.marks = marks;
    submission.transcript = transcript;
    submission.evaluatedAt = new Date();

    await submission.save();

    res.json({
      message: "Evaluation submitted successfully",
      submission
    });

  } catch (error) {
    console.error("Error saving evaluation:", error);
    res.status(500).json({ 
      message: "Failed to save evaluation",
      error: error.message
    });
  }
});


// Get student viva submissions
router.get("/student/submissions", authMiddleware, async (req, res) => {
  try {
    let submissions = await VivaSubmission.find({ student: req.user.id })
      .populate('viva', 'title topic difficulty status')
      .sort({ submittedAt: -1 });

    // Ensure marks.obtained and marks.max are always present with default values
    submissions = submissions.map(sub => {
      if (!sub.marks) {
        sub.marks = { obtained: 0, max: 0 };
      } else {
        if (typeof sub.marks.obtained !== 'number') sub.marks.obtained = 0;
        if (typeof sub.marks.max !== 'number') sub.marks.max = 0;
      }
      return sub;
    });

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching student viva submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Get viva by unique code for student viva giving route
router.get("/link/:uniqueCode", authMiddleware, async (req, res) => {
  try {
    const { uniqueCode } = req.params;

    if (!uniqueCode || typeof uniqueCode !== "string" || uniqueCode.trim().length === 0) {
      return res.status(400).json({ message: "Invalid unique code" });
    }

    const viva = await Viva.findOne({ uniqueCode: uniqueCode.trim().toUpperCase() }).lean();
    if (!viva) {
      return res.status(404).json({ message: "Viva not found" });
    }

    if (viva.status === "expired") {
      return res.status(403).json({ message: "This viva has expired" });
    }

    const existingSubmission = await VivaSubmission.findOne({
      viva: viva._id,
      student: req.user.id,
    });
    if (existingSubmission) {
      return res.status(403).json({ message: "You have already submitted this viva" });
    }

    res.json(viva);
  } catch (error) {
    console.error("Error fetching viva by unique code:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update viva status
router.patch("/:vivaId/status", authMiddleware, async (req, res) => {
  try {
    const { vivaId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(vivaId)) {
      return res.status(400).json({ message: "Invalid vivaId format" });
    }

    if (!["ongoing", "expired"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'ongoing' or 'expired'" });
    }

    const viva = await Viva.findById(vivaId);
    if (!viva) {
      return res.status(404).json({ message: "Viva not found" });
    }

    if (viva.teacherId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this viva" });
    }

    viva.status = status;
    await viva.save();

    res.json({ message: "Viva status updated successfully", status });
  } catch (error) {
    console.error("Error updating viva status:", error);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;