const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true, index: true },

    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress", index: true },
    lastStepIndex: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", ProgressSchema);

