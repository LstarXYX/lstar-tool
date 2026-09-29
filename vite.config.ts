import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile } from 'node:fs/promises'
import { siteHostname, siteUrl } from './src/data/siteConfig.ts'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const publicFilesWithSiteUrls = ['sitemap.xml', 'robots.txt', 'llms.txt']

const replaceSitePlaceholders = (content: string) => content
  .replaceAll('{{SITE_URL}}', siteUrl)
  .replaceAll('{{SITE_HOSTNAME}}', siteHostname)

const siteUrlPlugin = () => ({
  name: 'site-url-placeholders',
  transformIndexHtml: (html: string) => replaceSitePlaceholders(html),
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'CNAME', source: siteHostname })
  },
  closeBundle: async () => {
    await Promise.all(publicFilesWithSiteUrls.map(async (file) => {
      const outputPath = resolve(projectRoot, 'dist', file)
      const content = await readFile(outputPath, 'utf8')
      await writeFile(outputPath, replaceSitePlaceholders(content))
    }))
  },
})

export default defineConfig({
  // Relative asset URLs let the same bundle work at the domain root or in a subdirectory.
  base: './',
  plugins: [react(), siteUrlPlugin()],
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
        qrcode: resolve(projectRoot, 'tools/qrcode/index.html'),
        color: resolve(projectRoot, 'tools/color/index.html'),
        ocr: resolve(projectRoot, 'tools/ocr/index.html'),
        documentConverter: resolve(projectRoot, 'tools/document-converter/index.html'),
      },
    },
  },
})
