const mongoose = require("mongoose");

const PlanetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    themeColor: { type: String, default: "#22c55e" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Planet", PlanetSchema);

