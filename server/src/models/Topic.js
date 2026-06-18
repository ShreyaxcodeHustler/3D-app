const mongoose = require("mongoose");

const TopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: "" },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
      index: true,
    },

    category: { type: String, default: "", index: true },

    // Planet/domain this topic belongs to (DSA, Frontend, Backend, Database)
    planet: { type: mongoose.Schema.Types.ObjectId, ref: "Planet", required: true, index: true },

    // Markdown for the learning panel.
    content: { type: String, default: "" },

    // Optional main code snippet for the topic (shown in code editor panel).
    code: { type: String, default: "" },

    // Visualization metadata for 3D/2D renderers.
    visualization: {
      type: {
        type: String,
        default: "none",
      },
      config: { type: Object, default: {} },
    },
    quiz: {
      type: [
        {
          question: { type: String },
          options: [{ type: String }],
          answerIndex: { type: Number },
          explanation: { type: String },
        },
      ],
      default: [],
    },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", TopicSchema);

