import type { OcrResultItem } from '@paddleocr/paddleocr-js'

export type OcrLine = {
  text: string
  score: number
  polygon: Array<{ x: number; y: number }>
}

export type OcrRecognition = {
  lines: OcrLine[]
  elapsedMs: number
  runtime: string
}

export type OcrMode = 'fast' | 'accurate'
export type OcrModelSource = 'site' | 'paddle' | 'custom'
export type OcrWasmSource = 'site' | 'jsdelivr' | 'custom'
export type OcrRuntimeConfig = { modelSource: OcrModelSource; wasmSource: OcrWasmSource; customModelBaseUrl: string; customWasmBaseUrl: string }

export const defaultOcrRuntimeConfig: OcrRuntimeConfig = { modelSource: 'site', wasmSource: 'site', customModelBaseUrl: '', customWasmBaseUrl: '' }
export const paddleModelCdnBaseUrl = 'https://paddle-model-ecology.bj.bcebos.com/paddlex/official_inference_model/paddle3.0.0/'
export const jsdelivrWasmCdnBaseUrl = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/'

export const ocrModes: Record<OcrMode, { name: string; description: string; detectionModel: string; recognitionModel: string }> = {
  fast: {
    name: '极速模式',
    description: 'PP-OCRv6 Tiny，适合清晰截图和普通印刷体，加载与识别更快。',
    detectionModel: 'PP-OCRv6_tiny_det',
    recognitionModel: 'PP-OCRv6_tiny_rec',
  },
  accurate: {
    name: '标准模式',
    description: 'PP-OCRv5 Mobile，适合更复杂的版面和较小文字。',
    detectionModel: 'PP-OCRv5_mobile_det',
    recognitionModel: 'PP-OCRv5_mobile_rec',
  },
}

type PaddleOcrInstance = {
  predict: (file: Blob) => Promise<Array<{ items: OcrResultItem[]; metrics: { totalMs: number }; runtime: { detProvider: string; recProvider: string } }>>
  dispose: () => Promise<void>
}

const instances = new Map<string, Promise<PaddleOcrInstance>>()

const getLocalAssetUrl = (relativePath: string) => {
  const currentPath = window.location.pathname
  const toolsStart = currentPath.lastIndexOf('/tools/')
  const sitePath = toolsStart >= 0 ? currentPath.slice(0, toolsStart + 1) : '/'
  return new URL(`${sitePath}${relativePath}`, window.location.origin).href
}

const getModelAssetUrl = (baseUrl: string | undefined, filename: string) => {
  if (!baseUrl?.trim()) return getLocalAssetUrl(`assets/ocr/models/${filename}`)
  return new URL(filename, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).href
}

const deploymentModelCdnBaseUrl = import.meta.env.VITE_OCR_MODEL_CDN_BASE_URL
const deploymentWasmCdnBaseUrl = import.meta.env.VITE_OCR_WASM_CDN_BASE_URL

const getModelCdnBaseUrl = (runtimeConfig: OcrRuntimeConfig) => {
  if (runtimeConfig.modelSource === 'paddle') return paddleModelCdnBaseUrl
  if (runtimeConfig.modelSource === 'custom') return runtimeConfig.customModelBaseUrl
  return deploymentModelCdnBaseUrl
}
const getWasmCdnBaseUrl = (runtimeConfig: OcrRuntimeConfig) => {
  if (runtimeConfig.wasmSource === 'jsdelivr') return jsdelivrWasmCdnBaseUrl
  if (runtimeConfig.wasmSource === 'custom') return runtimeConfig.customWasmBaseUrl
  return deploymentWasmCdnBaseUrl
}

/**
 * Shared browser-only OCR gateway. PDF tools can render a page to Blob and
 * call recognizeImage without knowing anything about PaddleOCR's runtime.
 */
const getPaddleOcr = async (mode: OcrMode, runtimeConfig: OcrRuntimeConfig) => {
  const cacheKey = `${mode}:${runtimeConfig.modelSource}:${runtimeConfig.wasmSource}:${runtimeConfig.customModelBaseUrl}:${runtimeConfig.customWasmBaseUrl}`
  const cached = instances.get(cacheKey)
  if (cached) return cached

  const config = ocrModes[mode]
  const modelCdnBaseUrl = getModelCdnBaseUrl(runtimeConfig)
  const wasmCdnBaseUrl = getWasmCdnBaseUrl(runtimeConfig)
  const instance = import('@paddleocr/paddleocr-js').then(async ({ PaddleOCR }) => {
      return PaddleOCR.create({
        textDetectionModelName: config.detectionModel,
        textDetectionModelAsset: { url: getModelAssetUrl(modelCdnBaseUrl, `${config.detectionModel}_onnx_infer.tar`) },
        textRecognitionModelName: config.recognitionModel,
        textRecognitionModelAsset: { url: getModelAssetUrl(modelCdnBaseUrl, `${config.recognitionModel}_onnx_infer.tar`) },
        ortOptions: { backend: 'wasm', simd: true, numThreads: 1, ...(wasmCdnBaseUrl ? { wasmPaths: wasmCdnBaseUrl } : {}) },
      }) as Promise<PaddleOcrInstance>
    })
  instances.set(cacheKey, instance)
  return instance
}

export const recognizeImage = async (image: Blob, mode: OcrMode, runtimeConfig: OcrRuntimeConfig): Promise<OcrRecognition> => {
  const ocr = await getPaddleOcr(mode, runtimeConfig)
  const [result] = await ocr.predict(image)
  if (!result) throw new Error('未获得识别结果，请重新上传图片。')

  return {
    lines: result.items.map((item) => ({
      text: item.text,
      score: item.score,
      polygon: item.poly.map(([x, y]) => ({ x, y })),
    })),
    elapsedMs: result.metrics.totalMs,
    runtime: `${result.runtime.detProvider} / ${result.runtime.recProvider}`,
  }
}

export const disposeOcrRuntime = async () => {
  await Promise.all([...instances.values()].map(async (instancePromise) => (await instancePromise).dispose()))
  instances.clear()
}
