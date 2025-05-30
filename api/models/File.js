import mongoose from "mongoose";
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, default: "" },
  language: { type: String, default: "python" },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "CUser" },
  lastModified: { type: Date, default: Date.now },
});

export default mongoose.model("File", fileSchema);