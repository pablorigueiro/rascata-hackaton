import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa: la build funciona en cualquier hosting estático (Netlify Drop, GitHub Pages…)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true },
})
