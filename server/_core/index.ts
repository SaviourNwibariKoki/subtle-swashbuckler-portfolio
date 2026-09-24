import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";

/**
 * Build the Express application used by both local development and Vercel.
 * Local Vite HMR is attached by `server/dev.ts`, not inside this reusable factory.
 */
export function createApp() {
  const app = express();

  // Configure body parsing with a larger limit for future media/form uploads.
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use((req, res, next) => {
    if (
      req.path === "/admin" ||
      req.path.startsWith("/admin/") ||
      req.path === "/api" ||
      req.path.startsWith("/api/")
    ) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
    }
    next();
  });

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // All typed application procedures are available under the same API prefix.
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Vercel and Manus production serve the already-built client files.
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  return app;
}
