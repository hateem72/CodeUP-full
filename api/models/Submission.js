import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  viva: { type: mongoose.Schema.Types.ObjectId, ref: "Viva" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "CUser", required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    code: { type: String, default: "" },
    marks: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  }],
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Submission", submissionSchema);