import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, displayName, role } = req.body;
  
  
  if (!email || !password || !displayName) {
    return res.status(400).json({ 
      message: "Please provide email, password, and display name" 
    });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      displayName,
      role: role || "student",
      isVerified: true,
    });

    await user.save();
    req.session.user = { 
      id: user._id, 
      role: user.role, 
      email: user.email, 
      displayName: user.displayName 
    };
    res.status(201).json({ 
      message: "User registered successfully", 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    req.session.user = { id: user._id, role: user.role, email: user.email, displayName: user.displayName };
    res.json({ message: "Logged in", user: req.session.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie("connect.sid"); 
    res.json({ message: "Logged out" });
  });
});


router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: req.session.user });
});

router.post("/liveblocks-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.json({
    id: user.id, 
    info: { name: user.displayName, email: user.email }, 
  });
});

export default router;