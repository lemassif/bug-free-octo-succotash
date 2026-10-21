import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@bfb/shared": fileURLToPath(new URL("../shared/src/index.ts", import.meta.url)) },
  },
  server: { port: 5173, host: true, fs: { allow: [".."] } },
  build: { target: "es2022", chunkSizeWarningLimit: 1200 },
});
