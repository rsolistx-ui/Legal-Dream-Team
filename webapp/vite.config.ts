import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base path is /legal-dream-team/ for GitHub Pages by default.
// Set VITE_BASE=/ for local preview at the root if desired.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE ?? "/Legal-Dream-Team/",
  server: {
    fs: {
      // Allow Vite to read parent dir so we can import ../00_Panel/*.md as raw text.
      allow: [".."],
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode !== "production",
  },
}));
