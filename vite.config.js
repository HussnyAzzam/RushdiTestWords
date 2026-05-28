import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/*.md',
        '**/CADViewer*',
        '**/TextShare*',
        '**/InvoiceBuilder*',
        '**/vite.config.js',
        '**/.env.local',
        '**/.env*.local'
      ]
    },
    hmr: {
      overlay: true,
      timeout: 120000
    }
  }
})