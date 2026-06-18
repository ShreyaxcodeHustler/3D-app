const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },

    // Store only the current session refresh token hash.
    refreshTokenHash: { type: String, default: null },

    // Denormalized quick access.
    completedTopics: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Topic", default: [] },
    ],

    // Per-planet completion % (0..100).
    progressByPlanet: {
      type: Map,
      of: Number,
      default: {},
    },

    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

