const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getMyProgress, upsertProgress, completeTopic } = require("../controllers/progressController");

const router = express.Router();

router.get("/", requireAuth, getMyProgress);
router.post("/:topicId", requireAuth, upsertProgress);
router.post("/:topicId/complete", requireAuth, completeTopic);

module.exports = { progressRouter: router };

