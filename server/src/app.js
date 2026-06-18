const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const { getEnv } = require("./config/env");
const { apiRouter } = require("./routes/apiRouter");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

const { FRONTEND_URL } = getEnv({ requireJwt: false });
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// Basic protection against brute-force abuse at the HTTP layer.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", apiRouter);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

module.exports = app;

