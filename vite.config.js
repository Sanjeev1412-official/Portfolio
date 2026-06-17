import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//server.allowedHosts add this "https://54c10b06f3fc4c.lhr.life" in the dev section.

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', 'ducal-krystina-unphilosophic.ngrok-free.dev']
  }
})
