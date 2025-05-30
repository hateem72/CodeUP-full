import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: "CUser", required: true },
  uniqueLink: { type: String, required: true, unique: true }, 
  questions: [
    {
      question: { type: String, required: true },
      marks: { type: Number, required: true },
    },
  ],
  timeLimit: { type: Number, required: true }, 
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["ongoing", "expired"], default: "ongoing" },
});

export default mongoose.model("Test", testSchema);