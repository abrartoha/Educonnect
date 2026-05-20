import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy /api calls to the backend so the SPA uses same-origin cookies.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: false,
        secure: false,
      },
      // Socket.io upgrades from HTTP → WS; ws:true forwards both.
      '/socket.io': {
        target: 'http://localhost:5050',
        changeOrigin: false,
        secure: false,
        ws: true,
      },
    },
  },
})
