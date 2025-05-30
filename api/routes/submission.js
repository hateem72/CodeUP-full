import express from 'express';
import Test from '../models/Test.js';
import Submission from '../models/Submission.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/test/link/:uniqueLink', authMiddleware, async (req, res) => {
  try {
    const { uniqueLink } = req.params;
    
    if (!uniqueLink) {
      return res.status(400).json({ message: 'Test link is required' });
    }

    const test = await Test.findOne({ uniqueLink })
      .select('title questions timeLimit startTime endTime status')
      .lean();
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found or has expired' });
    }

    if (test.status !== 'ongoing') {
      return res.status(403).json({ message: 'Test is Expired' });
    }

    res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ message: 'Server error' });
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
    const existingSubmission = await Submission.findOne({
      test: req.params.testId,
      student: req.session.user.id,
    });
    if (existingSubmission) {
      return res.status(403).json({ message: "You have already submitted this test" });
    }
    const validQuestionIds = test.questions.map(q => q._id.toString());
    const invalidAnswers = answers.filter(ans => !validQuestionIds.includes(ans.questionId));
    if (invalidAnswers.length > 0) {
      return res.status(400).json({ message: "Invalid question IDs in answers" });
    }

    const submission = new Submission({
      test: req.params.testId,
      student: req.session.user.id,
      answers: answers.map((ans) => ({
        questionId: ans.questionId,
        code: ans.code || "", 
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

router.get('/submissions', authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.session.user.id })
      
    .populate({
      path: 'test',
      select: 'title questions', 
    })
      .sort({ submittedAt: -1 })
      .lean();
    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;