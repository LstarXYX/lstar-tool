import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Clipboard, FileImage, ImageUp, LoaderCircle, RefreshCw, ScanText } from 'lucide-react'
import { defaultOcrRuntimeConfig, disposeOcrRuntime, ocrModes, recognizeImage, type OcrModelSource, type OcrMode, type OcrRecognition, type OcrRuntimeConfig, type OcrWasmSource } from './core/paddleOcr'

type Notice = { text: string; type: 'success' | 'error' } | null
const runtimeConfigKey = 'lstar-tools:ocr-runtime-config'

const getSavedRuntimeConfig = (): OcrRuntimeConfig => {
  try {
    const saved = JSON.parse(localStorage.getItem(runtimeConfigKey) ?? '') as Partial<OcrRuntimeConfig>
    if ((saved.modelSource === 'site' || saved.modelSource === 'paddle' || saved.modelSource === 'custom') && (saved.wasmSource === 'site' || saved.wasmSource === 'jsdelivr' || saved.wasmSource === 'custom')) return { ...defaultOcrRuntimeConfig, ...saved }
  } catch { /* Use the site default when storage is unavailable or malformed. */ }
  return defaultOcrRuntimeConfig
}

const bytesToLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

export function OcrTool({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [result, setResult] = useState<OcrRecognition | null>(null)
  const [mode, setMode] = useState<OcrMode>('fast')
  const [runtimeConfig, setRuntimeConfig] = useState<OcrRuntimeConfig>(getSavedRuntimeConfig)
  const [switchingRuntime, setSwitchingRuntime] = useState(false)
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
      setResult(await recognizeImage(file, mode, runtimeConfig))
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
  const changeRuntimeConfig = async (key: keyof OcrRuntimeConfig, value: OcrModelSource | OcrWasmSource) => {
    if (switchingRuntime || runtimeConfig[key] === value) return
    setSwitchingRuntime(true)
    try {
      await disposeOcrRuntime()
      const next = { ...runtimeConfig, [key]: value } as OcrRuntimeConfig
      setRuntimeConfig(next)
      localStorage.setItem(runtimeConfigKey, JSON.stringify(next))
      setResult(null)
      setNotice({ text: '资源配置已更新，将在下次识别时生效。', type: 'success' })
    } finally {
      setSwitchingRuntime(false)
    }
  }
  const saveCustomUrl = async (key: 'customModelBaseUrl' | 'customWasmBaseUrl', value: string) => {
    const trimmed = value.trim()
    if (trimmed && !/^(https?:\/\/|\/)/i.test(trimmed)) {
      setNotice({ text: '自定义资源地址请填写 HTTP、HTTPS 或以 / 开头的相对路径。', type: 'error' })
      return
    }
    if (switchingRuntime || runtimeConfig[key] === trimmed) return
    setSwitchingRuntime(true)
    try {
      await disposeOcrRuntime()
      const next = { ...runtimeConfig, [key]: trimmed }
      setRuntimeConfig(next)
      localStorage.setItem(runtimeConfigKey, JSON.stringify(next))
      setResult(null)
      setNotice({ text: '自定义地址已保存，将在下次识别时生效。', type: 'success' })
    } finally {
      setSwitchingRuntime(false)
    }
  }

  return <section className="ocr-workspace" aria-label="图片文字识别工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">PADDLEOCR · WASM</span><h1>图片 OCR 文字识别</h1><p>选择识别模式后上传图片。极速模式适合大多数清晰截图；复杂版面或小字号可切换标准模式。</p></div><button className="text-button" type="button" onClick={reset}><RefreshCw size={16} />清空内容</button></div>
    <div className="ocr-layout">
      <article className="ocr-card"><div className="card-heading"><span className="step-number">01</span><div><h2>上传图片</h2><p>支持拖拽，图片不会上传到本站服务器。</p></div></div>
        <div className="dropzone ocr-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const dropped = event.dataTransfer.files?.[0]; if (dropped) chooseFile(dropped) }} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}><input ref={inputRef} type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => { const selected = event.target.files?.[0]; if (selected) chooseFile(selected) }} /><span className="upload-icon"><ImageUp size={24} /></span><strong>拖拽图片到这里，或点击上传</strong><span>PNG、JPG、WebP、BMP 等常见图片格式</span></div>
        <fieldset className="ocr-mode-selector"><legend>识别模式</legend>{(Object.keys(ocrModes) as OcrMode[]).map((item) => <label key={item}><input type="radio" name="ocr-mode" value={item} checked={mode === item} onChange={() => { setMode(item); setResult(null) }} disabled={loading || switchingRuntime} /><span><b>{ocrModes[item].name}</b><small>{ocrModes[item].description}</small></span></label>)}</fieldset>
        <fieldset className="ocr-runtime-selector"><legend>资源加载配置</legend><label>模型来源<select value={runtimeConfig.modelSource} disabled={loading || switchingRuntime} onChange={(event) => void changeRuntimeConfig('modelSource', event.target.value as OcrModelSource)}><option value="site">本站资源</option><option value="paddle">Paddle 官方 CDN</option><option value="custom">自定义 CDN</option></select></label><label>WASM 来源<select value={runtimeConfig.wasmSource} disabled={loading || switchingRuntime} onChange={(event) => void changeRuntimeConfig('wasmSource', event.target.value as OcrWasmSource)}><option value="site">本站资源</option><option value="jsdelivr">jsDelivr CDN</option><option value="custom">自定义 CDN</option></select></label>{runtimeConfig.modelSource === 'custom' && <label className="ocr-custom-url">模型 CDN 基址<input type="url" inputMode="url" placeholder="https://cdn.example.com/ocr/ 或 /ocr-assets/" defaultValue={runtimeConfig.customModelBaseUrl} disabled={loading || switchingRuntime} onBlur={(event) => void saveCustomUrl('customModelBaseUrl', event.target.value)} /></label>}{runtimeConfig.wasmSource === 'custom' && <label className="ocr-custom-url">WASM CDN 基址<input type="url" inputMode="url" placeholder="https://cdn.example.com/ort/ 或 /ort-assets/" defaultValue={runtimeConfig.customWasmBaseUrl} disabled={loading || switchingRuntime} onBlur={(event) => void saveCustomUrl('customWasmBaseUrl', event.target.value)} /></label>}{switchingRuntime && <small>正在切换资源配置…</small>}</fieldset>
        {file && <div className="file-meta"><FileImage size={18} /><span>{file.name}</span><small>{bytesToLabel(file.size)}</small></div>}
        {previewUrl && <img className="ocr-preview" src={previewUrl} alt="待识别图片预览" />}
        <button className="primary-button ocr-run-button" type="button" disabled={!file || loading} onClick={() => void recognize()}>{loading ? <LoaderCircle className="spin" size={17} /> : <ScanText size={17} />}{loading ? '正在加载模型并识别…' : '开始识别'}</button>
      </article>
      <article className="ocr-card"><div className="card-heading"><span className="step-number">02</span><div><h2>识别结果</h2><p>{result ? `识别到 ${result.lines.length} 行文字，用时 ${(result.elapsedMs / 1000).toFixed(2)} 秒。` : '上传图片并开始识别后，文本会显示在这里。'}</p></div></div>
        {result ? <><textarea className="ocr-result" value={text} readOnly aria-label="OCR 识别文本" /><div className="ocr-result-footer"><span>推理：{result.runtime}</span><button className="secondary-button" type="button" onClick={() => void copyResult()}><Clipboard size={16} />复制文本</button></div></> : <div className="ocr-empty"><ScanText size={31} /><h2>等待识别图片</h2><p>为获得更准确结果，请上传清晰、文字方向正常的图片。</p></div>}
      </article>
    </div>
    <section className="tool-seo-content"><h2>图片 OCR 使用说明</h2><p>上传图片后，工具会在浏览器本地运行 PaddleOCR 的文字检测与识别模型。适合提取截图、扫描件和照片中的中英文文本；不需要创建账号，也不会把你的图片提交给本站。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>极速和标准模式有什么区别？</h3><p>极速模式使用体积更小的 PP-OCRv6 Tiny，适合清晰图片；标准模式使用 PP-OCRv5 Mobile，适合复杂版面与小字号文字。</p></article><article><h3>哪些图片识别得更好？</h3><p>请使用清晰、对比度高、文字未明显倾斜的图片。过小、模糊或遮挡文字会影响结果。</p></article><article><h3>之后能识别 PDF 吗？</h3><p>OCR 核心已独立封装，未来 PDF 工具将把页面渲染为图片后复用同一套识别能力。</p></article></div></section>
    {notice && <div className={`toast ${notice.type}`} role="status">{notice.text}</div>}
  </section>
}
