import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { FileText, FileUp, RefreshCw, Upload } from 'lucide-react'
import { documentConversions, type ConversionDefinition, type DocumentFormat } from './converters'

const sourceFormats: Array<{ format: Extract<DocumentFormat, 'markdown' | 'docx'>; label: string; description: string }> = [
  { format: 'markdown', label: 'Markdown 文件', description: '选择 .md 文档' },
  { format: 'docx', label: 'Word 文件', description: '选择 .docx 文档' },
]
const formatLabels: Record<DocumentFormat, string> = { markdown: 'Markdown', docx: 'Word', pdf: 'PDF', html: 'HTML' }
const download = (blob: Blob, filename: string) => { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) }

export function DocumentConverterTool({ onBack }: { onBack: () => void }) {
  const [sourceFormat, setSourceFormat] = useState<Extract<DocumentFormat, 'markdown' | 'docx'>>('markdown')
  const [targetFormat, setTargetFormat] = useState<DocumentFormat>('docx')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const availableTargets = documentConversions.filter((item) => item.from === sourceFormat && item.available)
  const conversion = (availableTargets.find((item) => item.to === targetFormat) ?? availableTargets[0]) as ConversionDefinition

  const clearFile = () => { setFile(null); setMessage(''); if (inputRef.current) inputRef.current.value = '' }
  const chooseSource = (format: Extract<DocumentFormat, 'markdown' | 'docx'>) => { setSourceFormat(format); setTargetFormat(documentConversions.find((item) => item.from === format)?.to ?? 'docx'); clearFile() }
  const chooseTarget = (format: DocumentFormat) => { setTargetFormat(format); clearFile() }
  const selectFile = (nextFile: File) => {
    const extension = sourceFormat === 'markdown' ? /\.(md|markdown|txt)$/i : /\.docx$/i
    if (!extension.test(nextFile.name)) { setMessage(`请选择 ${sourceFormat === 'markdown' ? '.md' : '.docx'} 文件。`); return }
    setFile(nextFile); setMessage('')
  }
  const run = async () => {
    if (!conversion.available || !conversion.run) return
    if (!file) { setMessage(`请先上传 ${sourceFormat === 'markdown' ? 'Markdown' : 'Word'} 文件。`); return }
    setWorking(true); setMessage('')
    try { const output = await conversion.run(file); download(output.blob, output.filename); setMessage('转换完成，文件已开始下载。') } catch (error) { setMessage(error instanceof Error ? `转换失败：${error.message}` : '转换失败，请重试。') } finally { setWorking(false) }
  }

  return <section className="document-workspace" aria-label="文件转换工具"><div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">DOCUMENT CONVERTER</span><h1>文件转换</h1><p>上传文件，选择目标格式后即可开始转换。</p></div><button className="text-button" type="button" onClick={clearFile}><RefreshCw size={16} />清空文件</button></div>
    <div className="document-layout"><article className="document-card"><div className="card-heading"><span className="step-number">01</span><div><h2>选择源文件格式</h2><p>先选择要上传的文件类型。</p></div></div><div className="format-choice-list">{sourceFormats.map((item) => <button key={item.format} className={sourceFormat === item.format ? 'active' : ''} type="button" onClick={() => chooseSource(item.format)}><FileText size={18} /><span><b>{item.label}</b><small>{item.description}</small></span></button>)}</div><div className="card-heading document-target-heading"><span className="step-number">02</span><div><h2>选择转换格式</h2><p>选择要导出的文件格式。</p></div></div><div className="format-choice-list target-list">{availableTargets.map((item) => <button key={item.id} className={targetFormat === item.to ? 'active' : ''} type="button" onClick={() => chooseTarget(item.to)}><span><b>转换为 {formatLabels[item.to]}</b><small>可立即转换</small></span></button>)}</div></article>
      <article className="document-card"><div className="card-heading"><span className="step-number">03</span><div><h2>上传并转换</h2><p>拖拽文件到此处，或点击选择文件。</p></div></div><div className="document-dropzone" role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }} onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const dropped = event.dataTransfer.files?.[0]; if (dropped) selectFile(dropped) }}><input ref={inputRef} className="visually-hidden" type="file" accept={conversion.accept} onChange={(event: ChangeEvent<HTMLInputElement>) => { const nextFile = event.target.files?.[0]; if (nextFile) selectFile(nextFile) }} /><span className="upload-icon"><FileUp size={24} /></span><strong>{file ? file.name : `拖拽或选择 ${sourceFormat === 'markdown' ? 'Markdown' : 'Word'} 文件`}</strong><small>{file ? `${formatLabels[sourceFormat]} → ${formatLabels[conversion.to]}` : conversion.inputLabel}</small></div><button className="primary-button document-run" type="button" onClick={() => void run()} disabled={!conversion.available || working || !file}><Upload size={16} />{working ? '正在转换…' : conversion.available ? `转换为 ${formatLabels[conversion.to]}` : '该转换即将推出'}</button>{message && <p className="document-message">{message}</p>}</article></div>
    <section className="tool-seo-content"><h2>文件转换说明</h2><p>Markdown 可转换为可编辑的 Word 文档，Word 文档可转换为 Markdown。文件会在当前浏览器中处理。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>支持哪些文件？</h3><p>目前可上传 Markdown 文件或 DOCX Word 文件。</p></article><article><h3>文件会上传吗？</h3><p>不会。转换在当前浏览器中完成，文件不会提交至本站服务器。</p></article><article><h3>转换后文件在哪里？</h3><p>转换完成后，浏览器会自动开始下载生成的文件。</p></article></div></section></section>
}
