const Planet = require("../models/Planet");
const Topic = require("../models/Topic");
const { asyncHandler } = require("../utils/asyncHandler");

const getPlanetsWithTopics = asyncHandler(async (req, res) => {
  const planets = await Planet.find({}).sort({ order: 1, name: 1 });
  const topics = await Topic.find({ isActive: true }).populate("planet", "slug name themeColor");

  const byPlanet = new Map();
  for (const p of planets) byPlanet.set(String(p._id), []);

  for (const t of topics) {
    const pid = String(t.planet?._id || t.planet);
    if (!byPlanet.has(pid)) byPlanet.set(pid, []);
    byPlanet.get(pid).push(t);
  }

  const response = planets.map((p) => {
    const planetTopics = (byPlanet.get(String(p._id)) || []).sort((a, b) =>
      (a.category || "").localeCompare(b.category || "")
    );
    return {
      planet: {
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        themeColor: p.themeColor,
      },
      topics: planetTopics.map((t) => ({
        id: t._id,
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        category: t.category,
        content: t.content,
        code: t.code,
        visualization: t.visualization,
        quiz: t.quiz,
      })),
    };
  });

  return res.status(200).json({ planets: response });
});

module.exports = { getPlanetsWithTopics };

