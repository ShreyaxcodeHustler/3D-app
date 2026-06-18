const User = require("../models/User");
const { verifyAccessToken } = require("../utils/tokens");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);
    const userId = payload.sub;

    const user = await User.findById(userId).select("-passwordHash -refreshTokenHash");
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { requireAuth };

