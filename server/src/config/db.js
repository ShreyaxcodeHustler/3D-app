const mongoose = require("mongoose");
const { getEnv } = require("./env");

let connected = false;

async function connectMongo() {
  if (connected) return;
  const { MONGO_URI } = getEnv({ requireJwt: false });

  mongoose.set("strictQuery", true);

  await mongoose.connect(MONGO_URI, {
    autoIndex: true,
  });

  connected = true;
  // eslint-disable-next-line no-console
  console.log("MongoDB connected");
}

module.exports = { connectMongo };

