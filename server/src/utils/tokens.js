const jwt = require("jsonwebtoken");
const { getEnv } = require("../config/env");

function signAccessToken({ userId }) {
  const { ACCESS_TOKEN_SECRET } = getEnv();
  return jwt.sign({ sub: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

function signRefreshToken({ userId }) {
  const { REFRESH_TOKEN_SECRET } = getEnv();
  return jwt.sign({ sub: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });
}

function verifyAccessToken(token) {
  const { ACCESS_TOKEN_SECRET } = getEnv();
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
  const { REFRESH_TOKEN_SECRET } = getEnv();
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};

