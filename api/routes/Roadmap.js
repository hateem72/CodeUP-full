import express from "express";
import Roadmap from "../models/Roadmap.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import File from "../models/File.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, async (req, res) => {
  const { interest, nodes } = req.body;
  console.log("POST /api/roadmap/generate - Request body:", { interest, nodes });
  if (!interest || !nodes) return res.status(400).json({ message: "Interest and nodes are required" });

  try {
    // Check roadmap limit
    const userRoadmapCount = await Roadmap.countDocuments({ user: req.user.id });
    if (userRoadmapCount >= 3) {
      return res.status(400).json({ message: "You can only create up to 3 roadmaps." });
    }

    let roadmap = await Roadmap.findOne({ user: req.user.id, interest });
    if (roadmap) return res.status(400).json({ message: "A roadmap for this interest already exists. Use /update to modify." });

    // Validate practice questions
    const updatedNodes = nodes.map((node) => {
      if (!node.practiceQuestions || node.practiceQuestions.length !== 3) {
        throw new Error(`Node ${node.id} must have exactly 3 practice questions`);
      }
      return {
        ...node,
        status: "not_started",
        practiceQuestions: node.practiceQuestions.map((q) => ({
          question: q.question,
          fileId: null, // Will be set after file creation
        })),
      };
    });

    // Create new workspace for this roadmap
    const workspaceName = `${interest} Practice`;
    let workspace = await Workspace.findOne({ name: workspaceName, "members.userId": req.user.id });
    if (!workspace) {
      workspace = new Workspace({
        name: workspaceName,
        isPublic: false,
        members: [{ userId: req.user.id, role: "owner" }],
      });
      await workspace.save();
    }

    roadmap = new Roadmap({
      user: req.user.id,
      interest,
      nodes: updatedNodes,
      practiceWorkspaceId: workspace._id,
    });
    await roadmap.save();
    console.log("Roadmap saved:", roadmap);

    // Create practice files for each question
    for (const node of roadmap.nodes) {
      for (let i = 0; i < node.practiceQuestions.length; i++) {
        const question = node.practiceQuestions[i];
        const fileName = `${node.id}_Q${i + 1}.cpp`;
        const fileContent = `// ${question.question}\n`;
        const file = new File({
          name: fileName,
          workspaceId: workspace._id,
          content: fileContent,
          createdBy: req.user.id,
          language: "cpp",
        });
        await file.save();
        node.practiceQuestions[i].fileId = file._id;
      }
    }
    await roadmap.save();

    const user = await User.findById(req.user.id);
    nodes.forEach((node) => user.progress.set(node.id, "not_started"));
    await user.save();
    console.log("User progress updated:", user.progress);

    res.status(201).json({ roadmap, workspaceId: workspace._id });
  } catch (error) {
    console.error("Generate roadmap error:", error);
    res.status(500).json({ message: error.message || "Failed to generate roadmap" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/roadmap - Starting request');
    console.log('User ID from token:', req.user?.id);

    if (!req.user?.id) {
      console.log('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const roadmaps = await Roadmap.find({ user: req.user.id });
    console.log('Roadmap query result:', roadmaps.length > 0 ? 'Found' : 'Not found');

    if (!roadmaps || roadmaps.length === 0) {
      return res.status(404).json({ 
        message: "No roadmaps found. Please generate a roadmap first.",
        userId: req.user.id 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ roadmaps, progress: user.progress });
  } catch (error) {
    console.error("Fetch roadmap error:", error);
    res.status(500).json({ 
      message: "Failed to fetch roadmaps",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/roadmap/:id - Starting request', req.params.id);
    console.log('User ID from token:', req.user?.id);

    if (!req.user?.id) {
      console.log('No user ID found in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const roadmap = await Roadmap.findOne({ _id: req.params.id, user: req.user.id });
    console.log('Roadmap query result:', roadmap ? 'Found' : 'Not found');

    if (!roadmap) {
      return res.status(404).json({ 
        message: "Roadmap not found.",
        userId: req.user.id 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ roadmap, progress: user.progress });
  } catch (error) {
    console.error("Fetch roadmap error:", error);
    res.status(500).json({ 
      message: "Failed to fetch roadmap",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.put("/progress", authMiddleware, async (req, res) => {
  const { nodeId, status } = req.body;
  if (!nodeId || !["not_started", "in_progress", "completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid nodeId or status" });
  }

  try {
    const roadmap = await Roadmap.findOne({ user: req.user.id, "nodes.id": nodeId });
    if (!roadmap) return res.status(404).json({ message: "No roadmap found" });

    const node = roadmap.nodes.find((n) => n.id === nodeId);
    if (!node) return res.status(404).json({ message: "Node not found" });

    node.status = status;
    await roadmap.save();

    const user = await User.findById(req.user.id);
    user.progress.set(nodeId, status);
    await user.save();

    res.json({ message: "Progress updated", node });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Failed to update progress" });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  const { interest, nodes } = req.body;
  if (!interest || !nodes) return res.status(400).json({ message: "Interest and nodes are required" });

  try {
    let roadmap = await Roadmap.findOne({ user: req.user.id, interest });
    if (!roadmap) return res.status(404).json({ message: "No roadmap to update" });

    // Validate practice questions
    const updatedNodes = nodes.map((node) => {
      if (!node.practiceQuestions || node.practiceQuestions.length !== 3) {
        throw new Error(`Node ${node.id} must have exactly 3 practice questions`);
      }
      return {
        ...node,
        status: "not_started",
        practiceQuestions: node.practiceQuestions.map((q) => ({
          question: q.question,
          fileId: null,
        })),
      };
    });

    // Create or find workspace for this roadmap
    const workspaceName = `${interest} Practice`;
    let workspace = await Workspace.findOne({ name: workspaceName, "members.userId": req.user.id });
    if (!workspace) {
      workspace = new Workspace({
        name: workspaceName,
        isPublic: false,
        members: [{ userId: req.user.id, role: "owner" }],
      });
      await workspace.save();
    }

    // Create practice files for new questions
    for (const node of updatedNodes) {
      for (let i = 0; i < node.practiceQuestions.length; i++) {
        const question = node.practiceQuestions[i];
        const fileName = `${node.id}_Q${i + 1}.cpp`;
        const fileContent = `// ${question.question}\n`;
        const file = new File({
          name: fileName,
          workspaceId: workspace._id,
          content: fileContent,
          createdBy: req.user.id,
          language: "cpp",
        });
        await file.save();
        node.practiceQuestions[i].fileId = file._id;
      }
    }

    roadmap.interest = interest;
    roadmap.nodes = updatedNodes;
    roadmap.practiceWorkspaceId = workspace._id;
    await roadmap.save();

    const user = await User.findById(req.user.id);
    user.progress.clear();
    nodes.forEach((node) => user.progress.set(node.id, "not_started"));
    await user.save();

    res.json({ roadmap, workspaceId: workspace._id });
  } catch (error) {
    console.error("Update roadmap error:", error);
    res.status(500).json({ message: error.message || "Failed to update roadmap" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const roadmapId = req.params.id;

  try {
    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user.id });
    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    // Delete all practice files in the workspace
    if (roadmap.practiceWorkspaceId) {
      const files = await File.find({ workspaceId: roadmap.practiceWorkspaceId });
      for (const file of files) {
        await File.deleteOne({ _id: file._id });
      }

      // Delete the workspace
      await Workspace.deleteOne({ _id: roadmap.practiceWorkspaceId, "members.userId": req.user.id });
    }

    // Delete the roadmap
    await Roadmap.deleteOne({ _id: roadmapId, user: req.user.id });

    // Clear user progress for this roadmap's nodes
    const user = await User.findById(req.user.id);
    roadmap.nodes.forEach((node) => user.progress.delete(node.id));
    await user.save();

    res.json({ message: "Roadmap and associated resources deleted successfully" });
  } catch (error) {
    console.error("Delete roadmap error:", error);
    res.status(500).json({ message: error.message || "Failed to delete roadmap" });
  }
});

export default router;