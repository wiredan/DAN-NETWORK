import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 🛠️ FIX: Tells Vite to use the 'src' directory as the project root, 
  // where it expects to find index.html
  root: 'src', 
  server: {
    port: 5173,
    proxy: {
      // during local dev, forward API calls to worker dev server
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist"
  }
});
