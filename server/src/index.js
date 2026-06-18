const path = require("path");
const dotenv = require("dotenv");

// Load .env from server root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { connectMongo } = require("./config/db");
const { startServer } = require("./server");

async function main() {
  await connectMongo();
  await startServer();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error:", err);
  process.exit(1);
});

