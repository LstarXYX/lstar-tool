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

const instances = new Map<OcrMode, Promise<PaddleOcrInstance>>()

const getLocalAssetUrl = (relativePath: string) => {
  const currentPath = window.location.pathname
  const toolsStart = currentPath.lastIndexOf('/tools/')
  const sitePath = toolsStart >= 0 ? currentPath.slice(0, toolsStart + 1) : '/'
  return new URL(`${sitePath}${relativePath}`, window.location.origin).href
}

/**
 * Shared browser-only OCR gateway. PDF tools can render a page to Blob and
 * call recognizeImage without knowing anything about PaddleOCR's runtime.
 */
const getPaddleOcr = async (mode: OcrMode) => {
  const cached = instances.get(mode)
  if (cached) return cached

  const config = ocrModes[mode]
  const instance = import('@paddleocr/paddleocr-js').then(async ({ PaddleOCR }) => {
      return PaddleOCR.create({
        textDetectionModelName: config.detectionModel,
        textDetectionModelAsset: { url: getLocalAssetUrl(`assets/ocr/models/${config.detectionModel}_onnx_infer.tar`) },
        textRecognitionModelName: config.recognitionModel,
        textRecognitionModelAsset: { url: getLocalAssetUrl(`assets/ocr/models/${config.recognitionModel}_onnx_infer.tar`) },
        ortOptions: { backend: 'wasm', simd: true, numThreads: 1 },
      }) as Promise<PaddleOcrInstance>
    })
  instances.set(mode, instance)
  return instance
}

export const recognizeImage = async (image: Blob, mode: OcrMode): Promise<OcrRecognition> => {
  const ocr = await getPaddleOcr(mode)
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
