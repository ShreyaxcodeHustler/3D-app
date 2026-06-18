const mongoose = require("mongoose");
const User = require("../models/User");
const Topic = require("../models/Topic");
const Progress = require("../models/Progress");
const Planet = require("../models/Planet");
const { asyncHandler } = require("../utils/asyncHandler");
const { updateProgressSchema } = require("../validators/progressSchemas");

function computePlanetProgressPercent({ completedCount, totalCount }) {
  if (!totalCount) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

const getMyProgress = asyncHandler(async (req, res) => {
  const user = req.user;

  const progresses = await Progress.find({ userId: user._id })
    .populate("topicId", "title category difficulty content code visualization quiz planet")
    .populate({
      path: "topicId",
      populate: { path: "planet", select: "slug name" },
    })
    .sort({ updatedAt: -1 });

  const completedTopicIds = progresses
    .filter((p) => p.status === "completed")
    .map((p) => p.topicId._id);

  const byPlanet = new Map(); // slug -> { completedCount, totalCount }

  for (const prog of progresses) {
    const planet = prog.topicId?.planet;
    const slug = planet?.slug;
    if (!slug) continue;
    if (!byPlanet.has(slug)) byPlanet.set(slug, { completedCount: 0, totalCount: 0 });
    if (prog.status === "completed") byPlanet.get(slug).completedCount += 1;
  }

  // Fill totals per planet from Topic collection (active only).
  const planets = await Planet.find({}).select("slug _id");
  const activeTotals = await Topic.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$planet", count: { $sum: 1 } } },
  ]);

  const totalByPlanetId = new Map(activeTotals.map((t) => [String(t._id), t.count]));
  for (const p of planets) {
    const existing = byPlanet.get(p.slug);
    const totalCount = totalByPlanetId.get(String(p._id)) || 0;
    byPlanet.set(p.slug, {
      completedCount: existing?.completedCount || 0,
      totalCount,
    });
  }

  const progressByPlanet = {};
  for (const [slug, stats] of byPlanet.entries()) {
    progressByPlanet[slug] = computePlanetProgressPercent(stats);
  }

  return res.status(200).json({
    completedTopicIds,
    progressByPlanet,
    progresses: progresses.map((p) => ({
      topicId: p.topicId._id,
      status: p.status,
      lastStepIndex: p.lastStepIndex,
      attempts: p.attempts,
      completedAt: p.completedAt,
      topic: {
        title: p.topicId.title,
        category: p.topicId.category,
        difficulty: p.topicId.difficulty,
        content: p.topicId.content,
        code: p.topicId.code,
        visualization: p.topicId.visualization,
        quiz: p.topicId.quiz,
        planet: p.topicId.planet ? { slug: p.topicId.planet.slug, name: p.topicId.planet.name } : null,
      },
    })),
  });
});

const upsertProgress = asyncHandler(async (req, res) => {
  const user = req.user;
  const { topicId } = req.params;

  if (!mongoose.isValidObjectId(topicId)) return res.status(400).json({ error: "Invalid topicId" });
  const parsed = updateProgressSchema.parse(req.body);

  const topic = await Topic.findById(topicId).populate("planet", "slug name");
  if (!topic || !topic.isActive) return res.status(404).json({ error: "Topic not found" });

  const patch = {};
  if (typeof parsed.status !== "undefined") patch.status = parsed.status;
  if (typeof parsed.lastStepIndex !== "undefined") patch.lastStepIndex = parsed.lastStepIndex;
  if (typeof parsed.attempts !== "undefined") patch.attempts = parsed.attempts;

  let progress = await Progress.findOneAndUpdate(
    { userId: user._id, topicId },
    {
      $set: {
        ...patch,
        ...(patch.status === "completed" ? { completedAt: new Date() } : {}),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (patch.status === "completed") {
    // Denormalize completion for faster dashboard UX.
    if (!user.completedTopics.some((id) => String(id) === String(topicId))) {
      user.completedTopics.push(topicId);
    }
    await user.save();

    // Update user's planet progress percent.
    const activeTotal = await Topic.countDocuments({ planet: topic.planet._id, isActive: true });

    // We count completed topics for this planet using Progress->Topic join (2 queries, safe + simple).
    const completedTopicIds = await Progress.find({
      userId: user._id,
      status: "completed",
    })
      .select("topicId")
      .lean();
    const completedIds = completedTopicIds.map((d) => d.topicId);
    const completedForPlanet = await Topic.countDocuments({
      _id: { $in: completedIds },
      planet: topic.planet._id,
      isActive: true,
    });

    const percent = computePlanetProgressPercent({ completedCount: completedForPlanet, totalCount: activeTotal });
    user.progressByPlanet.set(topic.planet.slug, percent);
    await user.save();
  }

  return res.status(200).json({ progress });
});

const completeTopic = asyncHandler(async (req, res) => {
  const user = req.user;
  const { topicId } = req.params;

  if (!mongoose.isValidObjectId(topicId)) return res.status(400).json({ error: "Invalid topicId" });
  const topic = await Topic.findById(topicId).populate("planet", "slug name");
  if (!topic || !topic.isActive) return res.status(404).json({ error: "Topic not found" });

  const progress = await Progress.findOneAndUpdate(
    { userId: user._id, topicId },
    {
      $set: { status: "completed", completedAt: new Date(), lastStepIndex: 999 },
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!user.completedTopics.some((id) => String(id) === String(topicId))) {
    user.completedTopics.push(topicId);
    await user.save();
  }

  const activeTotal = await Topic.countDocuments({ planet: topic.planet._id, isActive: true });

  const completedTopicIds = await Progress.find({
    userId: user._id,
    status: "completed",
  })
    .select("topicId")
    .lean();
  const completedIds = completedTopicIds.map((d) => d.topicId);
  const completedForPlanet = await Topic.countDocuments({
    _id: { $in: completedIds },
    planet: topic.planet._id,
    isActive: true,
  });

  const percent = computePlanetProgressPercent({ completedCount: completedForPlanet, totalCount: activeTotal });
  user.progressByPlanet.set(topic.planet.slug, percent);
  await user.save();

  return res.status(200).json({ progress });
});

module.exports = { getMyProgress, upsertProgress, completeTopic };

