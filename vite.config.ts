import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is '/craft-bio/' for the production build (GitHub Pages project site)
// but '/' during dev so the local preview + OAuth redirect stay at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/craft-bio/' : '/',
  plugins: [react()],
  server: {
    port: 5188,
    host: true,
  },
}))
