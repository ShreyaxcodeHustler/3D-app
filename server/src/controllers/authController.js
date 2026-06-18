const bcrypt = require("bcrypt");
const User = require("../models/User");
const { registerSchema, loginSchema } = require("../validators/authSchemas");
const { asyncHandler } = require("../utils/asyncHandler");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/tokens");

function setRefreshCookie(res, refreshToken, cookieOptions) {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: "/api/auth/refresh",
    maxAge: cookieOptions.maxAge,
  });
}

function getCookieOptions() {
  const secure = process.env.COOKIE_SECURE === "true";
  return {
    secure,
    sameSite: secure ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.parse(req.body);
  const { name, email, password } = parsed;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    name,
    email,
    passwordHash,
    completedTopics: [],
    progressByPlanet: {},
  });

  return res.status(201).json({
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.parse(req.body);
  const { email, password } = parsed;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken({ userId: user._id.toString() });
  const refreshToken = signRefreshToken({ userId: user._id.toString() });

  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
  user.refreshTokenHash = refreshTokenHash;
  user.lastActiveAt = new Date();
  await user.save();

  const cookieOptions = getCookieOptions();
  setRefreshCookie(res, refreshToken, cookieOptions);

  return res.status(200).json({
    accessToken,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Missing refresh token" });

  const payload = verifyRefreshToken(refreshToken);
  const userId = payload.sub;

  const user = await User.findById(userId);
  if (!user || !user.refreshTokenHash) {
    return res.status(401).json({ error: "Invalid session" });
  }

  const match = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!match) return res.status(401).json({ error: "Invalid session" });

  // Rotate refresh token
  const newRefreshToken = signRefreshToken({ userId: user._id.toString() });
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);
  user.lastActiveAt = new Date();
  await user.save();

  const accessToken = signAccessToken({ userId: user._id.toString() });

  const cookieOptions = getCookieOptions();
  setRefreshCookie(res, newRefreshToken, cookieOptions);

  return res.status(200).json({ accessToken });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    return res.status(200).json({ ok: true });
  }

  // Best-effort: clear cookie and remove refresh token hash.
  try {
    const payload = verifyRefreshToken(refreshToken);
    const userId = payload.sub;
    const user = await User.findById(userId);
    if (user) {
      user.refreshTokenHash = null;
      await user.save();
    }
  } catch (_) {
    // ignore verification failures
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  return res.status(200).json({ ok: true });
});

const me = asyncHandler(async (req, res) => {
  const user = req.user;

  const completedTopics = user.completedTopics;
  const progressByPlanet =
    typeof user.progressByPlanet?.toObject === "function"
      ? user.progressByPlanet.toObject()
      : Object.fromEntries(user.progressByPlanet?.entries?.() || []);

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      completedTopics,
      progressByPlanet,
      lastActiveAt: user.lastActiveAt,
    },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};

