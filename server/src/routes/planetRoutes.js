const express = require("express");
const { getPlanetsWithTopics } = require("../controllers/planetController");

const router = express.Router();

router.get("/", getPlanetsWithTopics);

module.exports = { planetRouter: router };

