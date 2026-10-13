import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

/** Desktop bundles have one HTML entry; SEO-only pages remain web-build assets. */
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 1420,
    strictPort: true,
  },
  build: {
    outDir: 'dist-desktop',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(projectRoot, 'desktop.html'),
    },
  },
})
