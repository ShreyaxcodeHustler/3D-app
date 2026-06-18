const { z } = require("zod");

const upsertTopicSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional().default("Easy"),
  category: z.string().max(80).optional().default(""),
  planetId: z.string().min(1),
  content: z.string().optional().default(""),
  code: z.string().optional().default(""),
  visualization: z
    .object({
      type: z.string().default("none"),
      config: z.record(z.any()).default({}),
    })
    .optional(),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        answerIndex: z.number(),
        explanation: z.string().optional(),
      })
    )
    .optional(),
  isActive: z.boolean().optional().default(true),
});

module.exports = { upsertTopicSchema };

