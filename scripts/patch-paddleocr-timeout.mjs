import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const entryPath = resolve(root, 'node_modules/@paddleocr/paddleocr-js/dist/index.mjs')
const source = await readFile(entryPath, 'utf8')
const defaultTimeout = '6e4'
const extendedTimeout = '3e5'
const occurrences = source.split(defaultTimeout).length - 1

if (occurrences === 0) {
  if ((source.split(extendedTimeout).length - 1) === 2) process.exit(0)
  throw new Error('无法定位 PaddleOCR 的两个模型会话超时设置。请检查 SDK 版本。')
}

if (occurrences !== 2) throw new Error(`预期修改 2 个 PaddleOCR 超时设置，实际找到 ${occurrences} 个。`)
await writeFile(entryPath, source.replaceAll(defaultTimeout, extendedTimeout))
