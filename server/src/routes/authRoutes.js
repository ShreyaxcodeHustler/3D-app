const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { register, login, refresh, logout, me } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = { authRouter: router };

