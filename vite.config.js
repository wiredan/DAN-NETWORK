import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'frontend', // use the folder with index.html
  build: {
    outDir: '../dist',
  },
  server: {
    port: 5173,
  },
})