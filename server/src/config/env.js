function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function getEnv({ requireJwt = true } = {}) {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  const MONGO_URI = requireEnv("MONGO_URI");

  const ACCESS_TOKEN_SECRET = requireJwt ? requireEnv("ACCESS_TOKEN_SECRET") : process.env.ACCESS_TOKEN_SECRET || "";
  const REFRESH_TOKEN_SECRET = requireJwt ? requireEnv("REFRESH_TOKEN_SECRET") : process.env.REFRESH_TOKEN_SECRET || "";

  const COOKIE_SECURE = process.env.COOKIE_SECURE === "true";
  return {
    PORT,
    FRONTEND_URL,
    MONGO_URI,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    COOKIE_SECURE,
  };
}

module.exports = { getEnv };

