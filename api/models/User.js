import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  displayName: { type: String },
  authProvider: { type: String, default: "email" },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  invites: [{ type: String }],
  role: { type: String, enum: ["student", "teacher"], default: "student" },
  progress: { type: Map, of: String, default: {"no": "not_started"} }, 
});

export default mongoose.model("CUser", userSchema);