import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { Check, Clipboard, Download, FileImage, ImageUp, Maximize2, RefreshCw, Trash2, Upload, X } from 'lucide-react'
import { base64ToBlob, base64ToDataUrl, isValidBase64 } from './utils'

type Notice = { text: string; type: 'success' | 'error' } | null

const bytesToLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ImageBase64Tool({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [base64, setBase64] = useState('')
  const [imageName, setImageName] = useState('')
  const [imageSize, setImageSize] = useState(0)
  const [imagePreview, setImagePreview] = useState('')
  const [resultPreview, setResultPreview] = useState('')
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 2600)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsViewerOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const showNotice = (text: string, type: Notice extends null ? never : 'success' | 'error') => setNotice({ text, type })

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotice('请选择图片文件。', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const value = String(reader.result)
      setBase64(value)
      setImagePreview(value)
      setImageName(file.name)
      setImageSize(file.size)
      showNotice('图片已转换为 Base64。', 'success')
    }
    reader.onerror = () => showNotice('读取图片失败，请重试。', 'error')
    reader.readAsDataURL(file)
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) readFile(file)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  const convertBase64 = () => {
    const { payload } = base64ToDataUrl(base64)
    if (!isValidBase64(payload)) {
      setResultPreview('')
      showNotice('Base64 内容无效，请检查后重试。', 'error')
      return
    }
    const { dataUrl } = base64ToDataUrl(base64)
    setResultPreview(dataUrl)
    showNotice('已生成图片预览。', 'success')
  }

  const copyBase64 = async () => {
    if (!base64) return
    try {
      await navigator.clipboard.writeText(base64)
      showNotice('Base64 已复制到剪贴板。', 'success')
    } catch {
      showNotice('复制失败，请手动复制。', 'error')
    }
  }

  const downloadImage = () => {
    const { payload, mimeType } = base64ToDataUrl(base64)
    if (!isValidBase64(payload)) return
    const blob = base64ToBlob(payload, mimeType)
    const extension = mimeType.split('/')[1] || 'jpg'
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `lstar-image.${extension === 'jpeg' ? 'jpg' : extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearAll = () => {
    setBase64('')
    setImageName('')
    setImageSize(0)
    setImagePreview('')
    setResultPreview('')
    setIsViewerOpen(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="tool-workspace" aria-label="图片与 Base64 转换器">
      <div className="tool-intro">
        <div>
          <button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button>
          <span className="eyebrow">IMAGE CONVERTER</span>
          <h1>图片与 Base64 互转</h1>
          <p>完全在本地浏览器中处理。Base64 可直接粘贴，缺少数据前缀时默认按 JPG 图片解析。</p>
        </div>
        <button className="text-button" type="button" onClick={clearAll}><RefreshCw size={16} />清空内容</button>
      </div>

      <div className="converter-grid">
        <article className="converter-card">
          <div className="card-heading"><span className="step-number">01</span><div><h2>图片转 Base64</h2><p>上传图片，获取可直接使用的数据 URL。</p></div></div>
          <div className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}>
            <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} />
            <span className="upload-icon"><ImageUp size={24} /></span>
            <strong>拖拽图片到这里，或点击上传</strong>
            <span>支持 PNG、JPG、WebP、GIF 等图片格式</span>
          </div>
          {imageName && <div className="file-meta"><FileImage size={18} /><span>{imageName}</span><small>{bytesToLabel(imageSize)}</small></div>}
          {imagePreview && <img className="source-preview" src={imagePreview} alt="已上传的图片预览" />}
        </article>

        <article className="converter-card">
          <div className="card-heading"><span className="step-number">02</span><div><h2>Base64 转图片</h2><p>粘贴 Base64 文本并生成图片预览。</p></div></div>
          <textarea value={base64} onChange={(event) => { setBase64(event.target.value); setResultPreview('') }} placeholder="粘贴 Base64 内容（可省略 data:image/...;base64, 前缀）" aria-label="Base64 内容" />
          <div className="actions">
            <button className="primary-button" type="button" onClick={convertBase64}><Upload size={17} />生成图片</button>
            <button className="secondary-button" type="button" onClick={copyBase64} disabled={!base64}><Clipboard size={16} />复制</button>
          </div>
          {resultPreview && <div className="result-area"><button className="preview-image-button" type="button" onClick={() => setIsViewerOpen(true)} aria-label="在线查看大图"><img src={resultPreview} alt="由 Base64 生成的图片" /><span><Maximize2 size={16} />查看大图</span></button><div><span><Check size={16} />转换成功</span><button className="download-button" type="button" onClick={downloadImage}><Download size={16} />下载图片</button></div></div>}
        </article>
      </div>

      <div className="privacy-note"><Trash2 size={16} /><span>你的文件和文本不会离开当前设备；刷新或关闭页面后，数据即被清除。</span></div>
      {notice && <div className={`toast ${notice.type}`} role="status">{notice.text}</div>}
      {isViewerOpen && resultPreview && <div className="image-viewer" role="dialog" aria-modal="true" aria-label="图片大图预览" onMouseDown={() => setIsViewerOpen(false)}><div className="image-viewer-content" onMouseDown={(event) => event.stopPropagation()}><div className="image-viewer-header"><span>图片大图预览</span><button type="button" onClick={() => setIsViewerOpen(false)} aria-label="关闭大图预览"><X size={20} /></button></div><img src={resultPreview} alt="由 Base64 生成的大图" /><button className="download-button viewer-download" type="button" onClick={downloadImage}><Download size={16} />下载图片</button></div></div>}
    </section>
  )
}
