import express from "express";
import File from "../models/File.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/workspace/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const files = await File.find({ workspaceId: req.params.workspaceId });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create", authMiddleware, async (req, res) => {
  const { name, workspaceId, content } = req.body;
  try {
    const file = new File({ name, workspaceId, content, createdBy: req.user.id });
    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.id, 
      { content: req.body.content },
      { new: true }
    );
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });
    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;