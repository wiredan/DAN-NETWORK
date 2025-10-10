export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8787"
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false
  }
});