import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@cluedo-digital/shared': path.resolve(__dirname, './shared/dist/index.js'),
    },
  },

  server: {
    proxy: {
      // Reindirizza le chiamate socket.io al server boardgame.io locale
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
})