import { useMemo, useState } from 'react'
import { Check, Clipboard, Fingerprint, RotateCcw } from 'lucide-react'
import { getMd5Variants } from './utils'

const labels = [
  ['lower32', '32 位小写'], ['upper32', '32 位大写'], ['lower16', '16 位小写'], ['upper16', '16 位大写'],
] as const

export function Md5Tool({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('Lstar Tools')
  const [copied, setCopied] = useState('')
  const results = useMemo(() => getMd5Variants(input), [input])
  const copy = async (id: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(id); window.setTimeout(() => setCopied(''), 1500) } catch { setCopied('copy-error') }
  }
  return <section className="simple-tool-workspace" aria-label="MD5 加密工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">MD5 HASH</span><h1>MD5 加密</h1><p>输入任意文本，实时生成 32 位与 16 位的大小写 MD5 摘要，并可一键复制每个结果。</p></div></div>
    <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><Fingerprint size={16} /></span><div><h2>待加密文本</h2><p>支持中文、换行及任意 UTF-8 文本。</p></div></div><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入需要生成 MD5 的文本" aria-label="待 MD5 加密的文本" /><div className="actions"><button className="secondary-button" type="button" onClick={() => setInput('')}><RotateCcw size={16} />清空</button></div></article>
    <section className="hash-results" aria-label="MD5 结果">{labels.map(([key, label]) => <article className="hash-result" key={key}><div><span>{label}</span><code>{results[key]}</code></div><button className="secondary-button" type="button" onClick={() => copy(key, results[key])}>{copied === key ? <Check size={16} /> : <Clipboard size={16} />}{copied === key ? '已复制' : '复制'}</button></article>)}</section>
    {copied === 'copy-error' && <p className="simple-message error" role="alert">复制失败，请手动复制结果。</p>}
    <section className="tool-seo-content"><h2>在线 MD5 加密工具</h2><p>MD5 是常见的消息摘要算法，可将任意长度文本生成固定长度字符串。本工具会同步显示 32 位、16 位以及大小写结果，便于与不同系统的格式对接。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>MD5 能用于保存密码吗？</h3><p>不能。MD5 已不适合密码保护；新系统应使用 bcrypt、scrypt 或 Argon2。</p></article><article><h3>16 位 MD5 如何生成？</h3><p>16 位结果取自标准 32 位 MD5 的中间 16 个字符。</p></article><article><h3>文本会上传吗？</h3><p>不会。摘要计算完全在当前浏览器本地进行。</p></article></div></section>
  </section>
}
