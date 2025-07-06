import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
      sourcemap: 'hidden', 
    }),
  ],
  build: {
    sourcemap: 'hidden', 
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    }
  }
  
})
