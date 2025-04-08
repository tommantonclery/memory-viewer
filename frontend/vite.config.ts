import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// No wasm plugin needed — we're manually importing built files
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Optional: if you want to clean up import paths
      '@pkg': '/src/pkg',
    },
  },
  build: {
    target: 'esnext', // Ensures WASM support in modern browsers
  },
})
