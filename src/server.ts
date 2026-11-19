import app from "./app";

const port = Number.parseInt(process.env.PORT ?? "4000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port between 1 and 65535.");
}

const server = app.listen(port, () => {
  console.log(`Novels-Twines API listening on port ${port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received. Closing HTTP server...`);
  server.close((error) => {
    if (error) {
      console.error("Error while closing HTTP server:", error);
      process.exitCode = 1;
    }
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
