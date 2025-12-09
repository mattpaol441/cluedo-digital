import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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