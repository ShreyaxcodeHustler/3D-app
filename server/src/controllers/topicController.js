const mongoose = require("mongoose");
const Topic = require("../models/Topic");
const Planet = require("../models/Planet");
const Progress = require("../models/Progress");
const { asyncHandler } = require("../utils/asyncHandler");
const { upsertTopicSchema } = require("../validators/topicSchemas");

const getTopics = asyncHandler(async (req, res) => {
  const { planet, category, difficulty, isActive } = req.query;

  const filter = {};
  if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
  else filter.isActive = true;

  if (planet) {
    const planets = await Planet.find({ slug: planet }).select("_id");
    filter.planet = { $in: planets.map((p) => p._id) };
  }
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;

  const topics = await Topic.find(filter)
    .sort({ category: 1, title: 1 })
    .populate("planet", "slug name");
  return res.status(200).json({ topics });
});

const getTopicById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid topic id" });

  const topic = await Topic.findById(id).populate("planet", "slug name");
  if (!topic) return res.status(404).json({ error: "Topic not found" });
  return res.status(200).json({ topic });
});

const createTopic = asyncHandler(async (req, res) => {
  const parsed = upsertTopicSchema.parse(req.body);
  const planetId = parsed.planetId;

  if (!mongoose.isValidObjectId(planetId)) return res.status(400).json({ error: "Invalid planetId" });
  const planet = await Planet.findById(planetId);
  if (!planet) return res.status(404).json({ error: "Planet not found" });

  const topic = await Topic.create({
    title: parsed.title,
    description: parsed.description,
    difficulty: parsed.difficulty,
    category: parsed.category,
    planet: planetId,
    content: parsed.content,
    code: parsed.code,
    visualization: parsed.visualization,
    quiz: parsed.quiz || [],
    isActive: parsed.isActive,
  });

  return res.status(201).json({ topic });
});

const updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid topic id" });

  const parsed = upsertTopicSchema.parse(req.body);
  const planetId = parsed.planetId;
  if (!mongoose.isValidObjectId(planetId)) return res.status(400).json({ error: "Invalid planetId" });

  const topic = await Topic.findByIdAndUpdate(
    id,
    {
      title: parsed.title,
      description: parsed.description,
      difficulty: parsed.difficulty,
      category: parsed.category,
      planet: planetId,
      content: parsed.content,
      code: parsed.code,
      visualization: parsed.visualization,
      quiz: parsed.quiz || [],
      isActive: parsed.isActive,
    },
    { new: true, runValidators: true }
  );

  if (!topic) return res.status(404).json({ error: "Topic not found" });
  return res.status(200).json({ topic });
});

const deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid topic id" });

  const topic = await Topic.findByIdAndDelete(id);
  if (!topic) return res.status(404).json({ error: "Topic not found" });

  // Cleanup related progress rows.
  await Progress.deleteMany({ topicId: id });

  return res.status(200).json({ ok: true });
});

module.exports = { getTopics, getTopicById, createTopic, updateTopic, deleteTopic };

