import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "CUser" },
    role: { type: String, enum: ['owner', 'member', 'admin'], default: "contributor" },
  }],
});

export default mongoose.model("Workspace", workspaceSchema);