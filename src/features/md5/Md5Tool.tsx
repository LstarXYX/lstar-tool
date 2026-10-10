import { type ChangeEvent, type DragEvent, useMemo, useRef, useState } from 'react'
import { Check, Clipboard, FileUp, Fingerprint, RotateCcw } from 'lucide-react'
import { getMd5Variants, md5File } from './utils'

const labels = [
  ['lower32', '32 位小写'], ['upper32', '32 位大写'], ['lower16', '16 位小写'], ['upper16', '16 位大写'],
] as const

export function Md5Tool({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('Lstar Tools')
  const [copied, setCopied] = useState('')
  const [fileResult, setFileResult] = useState<{ name: string; size: number; hash: string } | null>(null)
  const [fileProgress, setFileProgress] = useState<number | null>(null)
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const calculationId = useRef(0)
  const results = useMemo(() => getMd5Variants(input), [input])
  const copy = async (id: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(id); window.setTimeout(() => setCopied(''), 1500) } catch { setCopied('copy-error') }
  }
  const selectFile = async (file: File) => {
    const currentCalculation = ++calculationId.current
    setFileResult(null); setFileError(''); setFileProgress(0)
    try {
      const hash = await md5File(file, (progress) => { if (currentCalculation === calculationId.current) setFileProgress(progress) })
      if (currentCalculation === calculationId.current) setFileResult({ name: file.name, size: file.size, hash })
    } catch {
      if (currentCalculation === calculationId.current) setFileError('文件读取失败，请重新选择文件。')
    } finally {
      if (currentCalculation === calculationId.current) setFileProgress(null)
    }
  }
  return <section className="simple-tool-workspace" aria-label="MD5 加密工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">MD5 HASH</span><h1>MD5 加密</h1><p>输入文本或选择本地文件，生成 MD5 摘要并一键复制。文件不会上传。</p></div></div>
    <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><Fingerprint size={16} /></span><div><h2>待加密文本</h2><p>支持中文、换行及任意 UTF-8 文本。</p></div></div><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入需要生成 MD5 的文本" aria-label="待 MD5 加密的文本" /><div className="actions"><button className="secondary-button" type="button" onClick={() => setInput('')}><RotateCcw size={16} />清空</button></div></article>
    <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><FileUp size={16} /></span><div><h2>文件 MD5</h2><p>拖拽任意文件到下方，或点击选择文件；大文件将分块在浏览器本地计算。</p></div></div><div className="md5-file-dropzone" role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') fileInputRef.current?.click() }} onDragOver={(event) => event.preventDefault()} onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const file = event.dataTransfer.files?.[0]; if (file) void selectFile(file) }}><input ref={fileInputRef} className="visually-hidden" type="file" onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void selectFile(file) }} /><FileUp size={24} /><strong>{fileProgress === null ? '拖拽或选择任意文件' : '正在计算文件 MD5…'}</strong><small>文件仅在当前浏览器中读取</small></div>{fileProgress !== null && <div className="md5-file-progress" aria-label="文件 MD5 计算进度"><span style={{ width: `${Math.round(fileProgress * 100)}%` }} /></div>}{fileResult && <div className="md5-file-result"><div><span>{fileResult.name} · {(fileResult.size / 1024 / 1024).toFixed(2)} MB</span><code>{fileResult.hash}</code></div><button className="secondary-button" type="button" onClick={() => copy('file', fileResult.hash)}>{copied === 'file' ? <Check size={16} /> : <Clipboard size={16} />}{copied === 'file' ? '已复制' : '复制 MD5'}</button></div>}{fileError && <p className="simple-message error" role="alert">{fileError}</p>}</article>
    <section className="hash-results" aria-label="MD5 结果">{labels.map(([key, label]) => <article className="hash-result" key={key}><div><span>{label}</span><code>{results[key]}</code></div><button className="secondary-button" type="button" onClick={() => copy(key, results[key])}>{copied === key ? <Check size={16} /> : <Clipboard size={16} />}{copied === key ? '已复制' : '复制'}</button></article>)}</section>
    {copied === 'copy-error' && <p className="simple-message error" role="alert">复制失败，请手动复制结果。</p>}
    <section className="tool-seo-content"><h2>在线 MD5 加密工具</h2><p>MD5 是常见的消息摘要算法，可将文本或文件生成固定长度字符串。文本会同步显示 32 位、16 位以及大小写结果；文件使用标准 32 位小写格式，便于校验下载文件是否完整。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>文件会上传吗？</h3><p>不会。文件分块读取并在当前浏览器内计算，内容不会上传到服务器。</p></article><article><h3>MD5 能用于保存密码吗？</h3><p>不能。MD5 已不适合密码保护；新系统应使用 bcrypt、scrypt 或 Argon2。</p></article><article><h3>16 位 MD5 如何生成？</h3><p>16 位结果取自标准 32 位 MD5 的中间 16 个字符。</p></article></div></section>
  </section>
}
