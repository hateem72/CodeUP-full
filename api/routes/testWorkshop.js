import express from "express";
import { Router } from "express";
import TestWorkshop from "../models/Test.js";
import Submission from "../models/Submission.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();


const ensureTeacher = (req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Only teachers can perform this action" });
  }
  next();
};

router.post("/create", authMiddleware, ensureTeacher, async (req, res) => {
  const { title, description, workspaceId, questions, deadline } = req.body;

  try {
    if (!title || !workspaceId || !questions) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const testWorkshop = new TestWorkshop({
      title,
      description,
      teacherId: req.user.id,
      workspaceId,
      questions,
      deadline,
      status: 'active'
    });

    await testWorkshop.save();
    res.status(201).json(testWorkshop);
  } catch (error) {
    console.error('Create test workshop error:', error);
    res.status(500).json({ message: "Failed to create test workshop" });
  }
});

router.get("/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const testWorkshops = await TestWorkshop.find({ 
      workspaceId: req.params.workspaceId,
      $or: [
        { teacherId: req.user.id },
        { status: 'active' }
      ]
    }).sort({ createdAt: -1 });

    res.json(testWorkshops);
  } catch (error) {
    console.error('Get test workshops error:', error);
    res.status(500).json({ message: "Failed to fetch test workshops" });
  }
});

router.post("/submit", authMiddleware, async (req, res) => {
  const { testWorkshopId, answers } = req.body;

  try {
    const testWorkshop = await TestWorkshop.findById(testWorkshopId);
    if (!testWorkshop) {
      return res.status(404).json({ message: "Test workshop not found" });
    }

    if (testWorkshop.status !== 'active') {
      return res.status(403).json({ message: "Test workshop is not active" });
    }

    const submission = new Submission({
      testWorkshopId,
      studentId: req.user.id,
      answers,
      submittedAt: new Date()
    });

    await submission.save();
    res.status(201).json(submission);
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ message: "Failed to submit test" });
  }
});

router.get("/submissions/:testWorkshopId", authMiddleware, ensureTeacher, async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      testWorkshopId: req.params.testWorkshopId 
    })
    .populate("studentId", "displayName email")
    .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

router.put("/evaluate/:submissionId", authMiddleware, ensureTeacher, async (req, res) => {
  const { score, feedback } = req.body;

  try {
    if (!score) {
      return res.status(400).json({ message: "Score is required" });
    }

    const submission = await Submission.findByIdAndUpdate(
      req.params.submissionId,
      { 
        score, 
        feedback,
        status: 'evaluated',
        evaluatedAt: new Date()
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    console.error('Evaluate submission error:', error);
    res.status(500).json({ message: "Failed to evaluate submission" });
  }
});

export default router;