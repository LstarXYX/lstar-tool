import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Clipboard, Copy, FileImage, ImageUp, LoaderCircle, RefreshCw, ScanText } from 'lucide-react'
import { disposeOcrRuntime, recognizeImage, type OcrRecognition } from './core/paddleOcr'

type Notice = { text: string; type: 'success' | 'error' } | null

const bytesToLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export function OcrTool({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState<OcrRecognition | null>(null)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  useEffect(() => () => { void disposeOcrRuntime() }, [])

  const chooseFile = (nextFile: File) => {
    if (!nextFile.type.startsWith('image/')) {
      setNotice({ text: '请选择 PNG、JPG、WebP 等图片文件。', type: 'error' })
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(nextFile)
    setPreviewUrl(URL.createObjectURL(nextFile))
    setResult(null)
    setNotice(null)
  }

  const recognize = async () => {
    if (!file || loading) return
    setLoading(true)
    setNotice(null)
    try {
      setResult(await recognizeImage(file))
    } catch (error) {
      setNotice({ text: error instanceof Error ? `识别失败：${error.message}` : '识别失败，请重试。', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const text = result?.lines.map((line) => line.text).join('\n') ?? ''
  const copyResult = async () => {
    if (!text) return
    try { await navigator.clipboard.writeText(text); setNotice({ text: '识别文本已复制。', type: 'success' }) } catch { setNotice({ text: '复制失败，请手动选择文本。', type: 'error' }) }
  }
  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null); setPreviewUrl(''); setResult(null); setNotice(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return <section className="ocr-workspace" aria-label="图片文字识别工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">PADDLEOCR · WASM</span><h1>图片 OCR 文字识别</h1><p>使用 PaddleOCR PP-OCRv5 模型在当前浏览器本地识别图片文字。模型与 WASM 运行时均由本站按需加载，之后会复用已加载的运行时。</p></div><button className="text-button" type="button" onClick={reset}><RefreshCw size={16} />清空内容</button></div>
    <div className="ocr-layout">
      <article className="ocr-card"><div className="card-heading"><span className="step-number">01</span><div><h2>上传图片</h2><p>支持拖拽，图片不会上传到本站服务器。</p></div></div>
        <div className="dropzone ocr-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const dropped = event.dataTransfer.files?.[0]; if (dropped) chooseFile(dropped) }} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}><input ref={inputRef} type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0]; if (selected) chooseFile(selected) }} /><span className="upload-icon"><ImageUp size={24} /></span><strong>拖拽图片到这里，或点击上传</strong><span>PNG、JPG、WebP、BMP 等常见图片格式</span></div>
        {file && <div className="file-meta"><FileImage size={18} /><span>{file.name}</span><small>{bytesToLabel(file.size)}</small></div>}
        {previewUrl && <img className="ocr-preview" src={previewUrl} alt="待识别图片预览" />}
        <button className="primary-button ocr-run-button" type="button" disabled={!file || loading} onClick={() => void recognize()}>{loading ? <LoaderCircle className="spin" size={17} /> : <ScanText size={17} />}{loading ? '正在加载模型并识别…' : '开始识别'}</button>
      </article>
      <article className="ocr-card"><div className="card-heading"><span className="step-number">02</span><div><h2>识别结果</h2><p>{result ? `识别到 ${result.lines.length} 行文字，用时 ${(result.elapsedMs / 1000).toFixed(2)} 秒。` : '上传图片并开始识别后，文本会显示在这里。'}</p></div></div>
        {result ? <><textarea className="ocr-result" value={text} readOnly aria-label="OCR 识别文本" /><div className="ocr-result-footer"><span>推理：{result.runtime}</span><button className="secondary-button" type="button" onClick={() => void copyResult()}><Clipboard size={16} />复制文本</button></div></> : <div className="ocr-empty"><ScanText size={31} /><h2>等待识别图片</h2><p>为获得更准确结果，请上传清晰、文字方向正常的图片。</p></div>}
      </article>
    </div>
    <div className="privacy-note"><Copy size={16} /><span>图片、识别结果、PaddleOCR 模型和 WASM 运行时均由本站加载或在当前浏览器内存中处理。</span></div>
    <section className="tool-seo-content"><h2>图片 OCR 使用说明</h2><p>上传图片后，工具会在浏览器本地运行 PaddleOCR 的文字检测与识别模型。适合提取截图、扫描件和照片中的中英文文本；不需要创建账号，也不会把你的图片提交给本站。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>首次使用为什么较慢？</h3><p>首次运行需要从本站按需加载并初始化约 21 MB 的 OCR 模型与 WASM 推理环境；同一次页面会复用已加载的资源。</p></article><article><h3>哪些图片识别得更好？</h3><p>请使用清晰、对比度高、文字未明显倾斜的图片。过小、模糊或遮挡文字会影响结果。</p></article><article><h3>之后能识别 PDF 吗？</h3><p>OCR 核心已独立封装，未来 PDF 工具将把页面渲染为图片后复用同一套识别能力。</p></article></div></section>
    {notice && <div className={`toast ${notice.type}`} role="status">{notice.text}</div>}
  </section>
}
