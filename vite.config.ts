import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages serves the app from /task_manager/; the dev server stays at /
  base: command === 'build' ? '/task_manager/' : '/',
  plugins: [react(), tailwindcss()],
}))
