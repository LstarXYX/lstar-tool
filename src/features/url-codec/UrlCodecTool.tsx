import { useState } from 'react'
import { Clipboard, Link2, RotateCcw } from 'lucide-react'
import { decodeUrlText, encodeUrlText } from './utils'

export function UrlCodecTool({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('https://example.com/search?q=你好世界&sort=new')
  const [output, setOutput] = useState('')
  const [message, setMessage] = useState('')
  const run = (action: 'encode' | 'decode') => {
    try {
      setOutput(action === 'encode' ? encodeUrlText(input) : decodeUrlText(input))
      setMessage(action === 'encode' ? '已完成 URL 编码。' : '已完成 URL 解码。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '处理失败，请检查输入。') }
  }
  const copy = async () => {
    if (!output) return
    try { await navigator.clipboard.writeText(output); setMessage('结果已复制到剪贴板。') } catch { setMessage('复制失败，请手动复制。') }
  }
  return <section className="simple-tool-workspace" aria-label="URL 编码解码工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">URL CODEC</span><h1>URL 编码解码</h1><p>将 URL、查询参数或任意文本进行百分号编码与解码，所有内容仅在当前浏览器中处理。</p></div></div>
    <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><Link2 size={16} /></span><div><h2>输入内容</h2><p>可粘贴完整 URL、查询参数或任意文字。</p></div></div><textarea value={input} onChange={(event) => { setInput(event.target.value); setMessage('') }} aria-label="待编码或解码的 URL 内容" /><div className="actions"><button className="primary-button" type="button" onClick={() => run('encode')}>URL 编码</button><button className="secondary-button" type="button" onClick={() => run('decode')}>URL 解码</button><button className="secondary-button" type="button" onClick={() => { setInput(''); setOutput(''); setMessage('已清空内容。') }}><RotateCcw size={16} />清空</button></div></article>
    <article className="simple-tool-card result-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>处理结果</h2><p>复制结果后可直接粘贴到代码或地址栏。</p></div></div><textarea value={output} readOnly placeholder="点击上方按钮后，结果会显示在这里" aria-label="URL 编码解码结果" /><div className="actions"><button className="secondary-button" type="button" onClick={copy} disabled={!output}><Clipboard size={16} />复制结果</button></div>{message && <p className="simple-message" role="status">{message}</p>}</article>
    <section className="tool-seo-content"><h2>在线 URL 编码与解码</h2><p>URL 编码会将空格、中文和特殊字符转换为 URL 可安全传输的百分号形式；解码会把编码文本还原为可读内容。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>完整 URL 也可以编码吗？</h3><p>可以。工具会编码全部输入内容，适合传递参数值或嵌套 URL。</p></article><article><h3>加号会如何处理？</h3><p>解码时会将查询字符串常见的加号还原为空格。</p></article><article><h3>内容会上传吗？</h3><p>不会。编码、解码和复制都在本地浏览器完成。</p></article></div></section>
  </section>
}
