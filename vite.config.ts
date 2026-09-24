import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  base: '/lstar-tool/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(projectRoot, 'index.html'),
        toolbox: resolve(projectRoot, 'tools/index.html'),
        imageBase64: resolve(projectRoot, 'tools/image-base64/index.html'),
        jsonFormatter: resolve(projectRoot, 'tools/json-formatter/index.html'),
        urlCodec: resolve(projectRoot, 'tools/url-codec/index.html'),
        md5: resolve(projectRoot, 'tools/md5/index.html'),
        timestamp: resolve(projectRoot, 'tools/timestamp/index.html'),
      },
    },
  },
})
