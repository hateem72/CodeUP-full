import express from "express";
import Message from "../models/Message.js";
import Workspace from "../models/Workspace.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, async (req, res) => {
  const { content, workspaceId } = req.body;
  try {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.members.some(m => m.userId.toString() === req.user.id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const message = new Message({
      content,
      senderId: req.user.id,
      workspaceId,
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ workspaceId: req.params.workspaceId })
      .populate("senderId", "displayName");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;