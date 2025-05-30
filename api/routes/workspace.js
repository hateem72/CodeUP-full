import express from "express";
import Workspace from "../models/Workspace.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  const { name, isPublic } = req.body;
  try {
    const workspace = new Workspace({
      name,
      isPublic,
      members: [{ userId: req.user.id, role: "owner" }],
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { "members.userId": req.user.id },
        { isPublic: true },
      ],
    }).populate("members.userId", "displayName email");
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/invite", authMiddleware, async (req, res) => {
  const { workspaceId, email } = req.body;
  try {
    const workspace = await Workspace.findById(workspaceId).populate("members.userId", "displayName email");
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.members.some(
      (m) => m.userId._id.toString() === req.user.id && m.role === "owner"
    );
    if (!isOwner) {
      return res.status(403).json({ message: "Only owners can invite" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (workspace.members.some(m => m.userId.toString() === user._id.toString())) {
      return res.status(400).json({ message: "User is already a member" });
    }

    workspace.members.push({ userId: user._id, role: "member" });
    await workspace.save();

    if (!user.invites.includes(workspaceId)) {
      user.invites.push(workspaceId);
      await user.save();
    }

    res.json({ 
      message: "User invited successfully",
      workspace: await workspace.populate("members.userId", "displayName email")
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate("members.userId", "displayName email");
    if (!workspace || (!workspace.isPublic && !workspace.members.some(m => m.userId.toString() === req.user.id))) {
      return res.status(403).json({ message: "Unauthorized or workspace not found" });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/user/:userId/workspaces", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized to view these workspaces" });
    }

    const workspaces = await Workspace.find({
      "members": {
        $elemMatch: {
          userId: userId,
          role: "owner"
        }
      }
    }).populate("members.userId", "displayName email");
    
    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching user workspaces:", error);
    res.status(500).json({ message: error.message });
  }
});


router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.members.some(m => m.userId.toString() === req.user.id && m.role === "owner")) {
      return res.status(403).json({ message: "Only owners can update workspace" });
    }

    const { name, isPublic } = req.body;
    workspace.name = name || workspace.name;
    workspace.isPublic = isPublic !== undefined ? isPublic : workspace.isPublic;

    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id });
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (!workspace.members.some(m => m.userId.toString() === req.user.id && m.role === "owner")) {
      return res.status(403).json({ message: "Only owners can delete workspace" });
    }

    await Workspace.deleteOne({ _id: req.params.id });
    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id/members/:userId", authMiddleware, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.members.some(m => m.userId.toString() === req.user.id && m.role === "owner");
    const isSelfRemoval = req.params.userId === req.user.id;

    if (!isOwner && !isSelfRemoval) {
      return res.status(403).json({ message: "Unauthorized to remove members" });
    }

    const memberToRemove = workspace.members.find(m => m.userId.toString() === req.params.userId);
    if (memberToRemove && memberToRemove.role === "owner") {
      return res.status(403).json({ message: "Cannot remove workspace owner" });
    }

    workspace.members = workspace.members.filter(m => m.userId.toString() !== req.params.userId);
    await workspace.save();

    res.json({ message: "Member removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;