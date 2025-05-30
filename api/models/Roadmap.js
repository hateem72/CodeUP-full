import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "CUser", required: true },
  interest: { type: String, required: true },
  nodes: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      resources: [{ type: String }],
      task: { type: String },
      status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
      practiceQuestions: [
        {
          question: { type: String, required: true },
          fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File" },
        },
      ],
    },
  ],
  practiceWorkspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

roadmapSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Roadmap", roadmapSchema);