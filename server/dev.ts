import { createServer } from "http";
import { createApp } from "./_core/index";
import { setupVite } from "./_core/vite";

const PORT = 3000;
const HOST = "0.0.0.0";

/** Starts the local development or production HTTP server. */
async function startServer() {
  const app = createApp();
  const server = createServer(app);

  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  }

  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}/`);
  });
}

startServer().catch(console.error);
