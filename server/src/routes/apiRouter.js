const express = require("express");
const { authRouter } = require("./authRoutes");
const { topicRouter } = require("./topicRoutes");
const { progressRouter } = require("./progressRoutes");
const { planetRouter } = require("./planetRoutes");

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/topics", topicRouter);
apiRouter.use("/progress", progressRouter);
apiRouter.use("/planets", planetRouter);

module.exports = { apiRouter };

