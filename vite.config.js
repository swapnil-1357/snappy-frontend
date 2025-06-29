import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from "path"

export default defineConfig({
  plugins: [react(
    {
      tsDecorators: true,
      sourcemap: false,
    }
  )],
  build: {
    sourcemap: false,
  },
  esbuild: {
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
