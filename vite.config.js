import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use BASE env var when hosting under a subpath (e.g. /repo/)
const base = process.env.BASE || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
