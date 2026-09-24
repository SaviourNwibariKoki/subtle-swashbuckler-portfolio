import path from "node:path";
import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config";

/**
 * Vercel serves files from the root `public` directory. The normal Manus build
 * continues to use `dist/public`, so this config changes only the Vercel output location.
 */
export default defineConfig(
  mergeConfig(baseConfig, {
    build: {
      outDir: path.resolve(import.meta.dirname, "public"),
      emptyOutDir: true,
    },
  }),
);
