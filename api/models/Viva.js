import mongoose from "mongoose";

const vivaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  topic: { type: String, required: true },
  numberOfQuestions: { type: Number, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  uniqueCode: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["ongoing", "expired"], default: "ongoing" },
  createdAt: { type: Date, default: Date.now },
});

const Viva = mongoose.model("Viva", vivaSchema);

export default Viva;