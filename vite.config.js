import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "frontend", // 👈 points to the correct location of index.html
  build: {
    outDir: "../dist", // output folder one level above frontend
    emptyOutDir: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});