import express from "express";
import Test from "../models/Test.js";
import Submission from "../models/Submission.js";
import authMiddleware from "../middleware/authMiddleware.js"; 
import { nanoid } from "nanoid";

const router = express.Router();

const ensureTeacher = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "teacher") {
    return res.status(403).json({ message: "Access denied: Teachers only" });
  }
  next();
};



router.get("/tests", authMiddleware, ensureTeacher, async (req, res) => {
  try {
    const tests = await Test.find({ teacher: req.session.user.id });
    res.json({ message: "Tests retrieved successfully", tests });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/test/:testId/submissions", authMiddleware, ensureTeacher, async (req, res) => {
  try {
    const submissions = await Submission.find({ test: req.params.testId })
      .populate("student", "email") 
      .populate("test", "title questions") 
      .lean();
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/submission/:submissionId/evaluate", authMiddleware, ensureTeacher, async (req, res) => {
  const { answers } = req.body; 

  try {
    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

   
    submission.answers = submission.answers.map((ans) => {
      const updatedAnswer = answers.find((a) => a.questionId.toString() === ans.questionId.toString());
      if (updatedAnswer) {
        return {
          ...ans,
          marks: updatedAnswer.marks || ans.marks,
          feedback: updatedAnswer.feedback || ans.feedback,
        };
      }
      return ans;
    });

    await submission.save();
    res.json({ message: "Evaluation saved successfully", submission });
  } catch (error) {
    console.error("Error evaluating submission:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/submission/:submissionId", authMiddleware, ensureTeacher, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate("student", "email")
      .populate("test", "title questions")
      .lean();
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/tests/:testId/leaderboard", authMiddleware, ensureTeacher, async (req, res) => {
  try {
    const submissions = await Submission.find({ test: req.params.testId }).populate(
      "student",
      "displayName"
    );
    const leaderboard = submissions
      .map((sub) => ({
        studentName: sub.student.displayName,
        totalMarks: sub.answers.reduce((sum, ans) => sum + (ans.marks || 0), 0),
      }))
      .sort((a, b) => b.totalMarks - a.totalMarks);
    res.json({ message: "Leaderboard retrieved successfully", leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: error.message });
  }
});
router.post("/tests", authMiddleware, ensureTeacher, async (req, res) => {
  const { title, questions, timeLimit } = req.body;

  if (!title || !questions || !Array.isArray(questions) || !timeLimit) {
    return res.status(400).json({ message: "Please provide title, questions array, and time limit" });
  }
  if (questions.some((q) => !q.question || !q.marks)) {
    return res.status(400).json({ message: "Each question must have a question text and marks" });
  }

  try {
    const uniqueLink = nanoid(10);
    const test = new Test({
      title,
      teacher: req.session.user.id,
      uniqueLink,
      questions,
      timeLimit, 
    });
    await test.save();
    res.status(201).json({ message: "Test created successfully", test });
  } catch (error) {
    console.error("Test creation error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/test/link/:uniqueLink", authMiddleware, async (req, res) => {
  try {
    const test = await Test.findOne({ uniqueLink: req.params.uniqueLink });
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("Error fetching test by link:", error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/tests/:testId/submit", authMiddleware, async (req, res) => {
  const { answers } = req.body; 

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Answers must be an array" });
  }

  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const submission = new Submission({
      test: req.params.testId, 
      student: req.session.user.id,
      answers: answers.map((ans) => ({
        questionId: ans.questionId,
        code: ans.code,
        marks: 0, 
        feedback: "",
      })),
      submittedAt: new Date(),
    });

    await submission.save();
    res.status(201).json({ message: "Test submitted successfully", submission });
  } catch (error) {
    console.error("Test submission error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/tests", authMiddleware, ensureTeacher, async (req, res) => {
  try {
    const tests = await Test.find({ creator: req.session.user.id }).lean();
    const testsWithCounts = await Promise.all(
      tests.map(async (test) => {
        const submissionCount = await Submission.countDocuments({ test: test._id });
        return { ...test, submissionCount };
      })
    );
    res.json({ tests: testsWithCounts });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/test/:testId/status", authMiddleware, ensureTeacher, async (req, res) => {
  const { status } = req.body; 
  if (!["ongoing", "expired"].includes(status)) {
    return res.status(400).json({ message: "Invalid status. Must be 'ongoing' or 'expired'" });
  }

  try {
    const test = await Test.findById(req.params.testId);
    
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    if (test.teacher.toString() !== req.session.user.id) {
      return res.status(403).json({ message: "Unauthorized: You don't own this test" });
    }

    test.status = status;
    await test.save();
    
    const submissionCount = await Submission.countDocuments({ test: test._id });
    res.json({ ...test.toJSON(), submissionCount });

  } catch (error) {
    console.error("Error updating test status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;