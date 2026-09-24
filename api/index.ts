import { createApp } from "../server/_core/index";

/**
 * Vercel imports this default export as the serverless Express function.
 * The shared app factory keeps the public routes, admin routes, OAuth, and tRPC behavior unchanged.
 */
const app = createApp();

export default app;
