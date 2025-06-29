import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
      sourcemap: 'hidden', // Disable sourcemaps for React plugin
    }),
  ],
  build: {
    sourcemap: 'hidden', // Disable sourcemaps for production build
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // server: {
  //   proxy: {
  //     '/api': 'http://localhost:3000', // Proxy API requests to backend
  //   },
  // },
})
