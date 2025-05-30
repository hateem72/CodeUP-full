
import mongoose from "mongoose";

const vivaSubmissionSchema = new mongoose.Schema({
  viva: { type: mongoose.Schema.Types.ObjectId, ref: "Viva", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "CUser", required: true },
  answers: [{
    question: { type: String, required: true },
    response: { type: String, default: "" },
    marks: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  }],
  feedback: { type: String },
  score: { type: Number },
  marks: {
    obtained: { type: Number },
    max: { type: Number }
  },
  transcript: { type: String },
  submittedAt: { type: Date, default: Date.now },
  evaluatedAt: { type: Date }
});

export default mongoose.model("VivaSubmission", vivaSubmissionSchema);