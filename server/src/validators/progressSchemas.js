const { z } = require("zod");

const updateProgressSchema = z.object({
  status: z.enum(["in_progress", "completed"]).optional(),
  lastStepIndex: z.number().int().nonnegative().optional(),
  attempts: z.number().int().nonnegative().optional(),
});

module.exports = { updateProgressSchema };

