const app = require("./app");

const { getEnv } = require("./config/env");

function startServer() {
  const { PORT } = getEnv({ requireJwt: false });
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
}

module.exports = { startServer };

