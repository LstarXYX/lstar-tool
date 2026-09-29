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

type PaddleOcrInstance = {
  predict: (file: Blob) => Promise<Array<{ items: OcrResultItem[]; metrics: { totalMs: number }; runtime: { detProvider: string; recProvider: string } }>>
  dispose: () => Promise<void>
}

let instancePromise: Promise<PaddleOcrInstance> | null = null

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
const getPaddleOcr = async () => {
  if (!instancePromise) {
    instancePromise = import('@paddleocr/paddleocr-js').then(async ({ PaddleOCR }) => {
      return PaddleOCR.create({
        textDetectionModelName: 'PP-OCRv5_mobile_det',
        textDetectionModelAsset: { url: getLocalAssetUrl('assets/ocr/models/PP-OCRv5_mobile_det_onnx_infer.tar') },
        textRecognitionModelName: 'PP-OCRv5_mobile_rec',
        textRecognitionModelAsset: { url: getLocalAssetUrl('assets/ocr/models/PP-OCRv5_mobile_rec_onnx_infer.tar') },
        ortOptions: { backend: 'wasm', simd: true, numThreads: 1 },
      }) as Promise<PaddleOcrInstance>
    })
  }
  return instancePromise
}

export const recognizeImage = async (image: Blob): Promise<OcrRecognition> => {
  const ocr = await getPaddleOcr()
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
  if (!instancePromise) return
  const instance = await instancePromise
  await instance.dispose()
  instancePromise = null
}
