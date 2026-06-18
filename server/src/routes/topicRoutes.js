const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { getTopics, getTopicById, createTopic, updateTopic, deleteTopic } = require("../controllers/topicController");

const router = express.Router();

router.get("/", getTopics);
router.get("/:id", getTopicById);

router.post("/", requireAuth, createTopic);
router.put("/:id", requireAuth, updateTopic);
router.delete("/:id", requireAuth, deleteTopic);

module.exports = { topicRouter: router };

