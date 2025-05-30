import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "CUser", required: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);