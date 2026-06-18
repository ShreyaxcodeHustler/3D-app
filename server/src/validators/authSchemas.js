const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

module.exports = { registerSchema, loginSchema };

