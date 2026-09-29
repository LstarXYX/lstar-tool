import { useRef, useState, type ChangeEvent } from 'react'
import { FileUp, RefreshCw, WandSparkles } from 'lucide-react'
import { documentConversions, type ConversionDefinition } from './converters'

const download = (blob: Blob, filename: string) => { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) }

export function DocumentConverterTool({ onBack }: { onBack: () => void }) {
  const [conversionId, setConversionId] = useState('markdown-docx')
  const [markdown, setMarkdown] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const conversion = documentConversions.find((item) => item.id === conversionId) as ConversionDefinition
  const isMarkdownInput = conversion.from === 'markdown'

  const changeConversion = (id: string) => { setConversionId(id); setFile(null); setMessage(''); if (inputRef.current) inputRef.current.value = '' }
  const selectFile = async (nextFile: File) => { setFile(nextFile); setMessage(''); if (isMarkdownInput) setMarkdown(await nextFile.text()) }
  const run = async () => {
    if (!conversion.available || !conversion.run) return
    if (isMarkdownInput && !markdown.trim()) { setMessage('请输入 Markdown 内容，或上传 .md 文件。'); return }
    if (!isMarkdownInput && !file) { setMessage('请先上传 Word 文件。'); return }
    setWorking(true); setMessage('')
    try { const output = await conversion.run(isMarkdownInput ? markdown : file as File); download(output.blob, output.filename); setMessage('转换完成，文件已开始下载。') } catch (error) { setMessage(error instanceof Error ? `转换失败：${error.message}` : '转换失败，请重试。') } finally { setWorking(false) }
  }
  return <section className="document-workspace" aria-label="文件转换工具"><div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">DOCUMENT CONVERTER</span><h1>Markdown 与 Word 转换</h1><p>选择转换方向后在浏览器本地处理。转换能力由注册表统一管理，后续可继续接入 PDF、HTML 等格式。</p></div><button className="text-button" type="button" onClick={() => { setMarkdown(''); setFile(null); setMessage(''); if (inputRef.current) inputRef.current.value = '' }}><RefreshCw size={16} />清空内容</button></div>
    <div className="document-layout"><article className="document-card"><h2>选择转换类型</h2><div className="conversion-options">{documentConversions.map((item) => <button key={item.id} type="button" className={item.id === conversionId ? 'active' : ''} onClick={() => changeConversion(item.id)}><span>{item.label}</span>{item.available ? <small>可用</small> : <small>即将推出</small>}</button>)}</div><div className="document-tip"><WandSparkles size={17} /><span>当前选择：{conversion.label}</span></div></article>
      <article className="document-card"><h2>添加内容</h2>{isMarkdownInput && <textarea className="document-markdown" value={markdown} onChange={(event) => setMarkdown(event.target.value)} placeholder="# 标题&#10;&#10;粘贴 Markdown 内容，或上传 .md 文件" aria-label="Markdown 内容" />}<button className="document-upload" type="button" onClick={() => inputRef.current?.click()}><FileUp size={19} />{file ? file.name : conversion.inputLabel}</button><input ref={inputRef} className="visually-hidden" type="file" accept={conversion.accept} onChange={(event: ChangeEvent<HTMLInputElement>) => { const nextFile = event.target.files?.[0]; if (nextFile) void selectFile(nextFile) }} />
        <button className="primary-button document-run" type="button" onClick={() => void run()} disabled={!conversion.available || working}>{working ? '正在转换…' : conversion.available ? '开始转换并下载' : '该转换即将推出'}</button>{message && <p className="document-message">{message}</p>}</article></div>
    <section className="tool-seo-content"><h2>文件转换说明</h2><p>Markdown 转 Word 会生成可编辑的 DOCX 文件，并保留常见标题与无序列表结构；Word 转 Markdown 会从 DOCX 中提取正文并生成 Markdown 文本。文档内容不经由本站服务器。</p><h2>格式路线图</h2><div className="faq-grid"><article><h3>Markdown → Word</h3><p>现已可用，支持直接粘贴内容或上传 .md 文件。</p></article><article><h3>Word → Markdown</h3><p>现已可用，上传 DOCX 后自动下载转换后的 .md 文件。</p></article><article><h3>PDF 和其他格式</h3><p>转换注册表已预留 Markdown/Word 到 PDF、HTML 等接口，待引入完整的浏览器端排版与导出能力后开放。</p></article></div></section></section>
}
