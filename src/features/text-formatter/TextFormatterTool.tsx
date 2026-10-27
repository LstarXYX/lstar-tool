import { useState } from 'react'
import { Clipboard, FileText, RotateCcw, WrapText } from 'lucide-react'
import { writeClipboardText } from '../../platform/clipboard'
import { escapeText, restoreTextEscapes } from './utils'

export function TextFormatterTool({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [message, setMessage] = useState('')

  const escape = () => {
    setOutput(escapeText(input))
    setMessage('已完成文本转义。')
  }

  const restore = () => {
    setOutput(restoreTextEscapes(input))
    setMessage('已还原常用转义字符。')
  }

  const copy = async () => {
    if (!output) return
    try {
      await writeClipboardText(output)
      setMessage('结果已复制到剪贴板。')
    } catch {
      setMessage('复制失败，请手动复制。')
    }
  }

  const clear = () => {
    setInput('')
    setOutput('')
    setMessage('已清空内容。')
  }

  return <section className="simple-tool-workspace" aria-label="文本格式化工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">TEXT FORMATTER</span><h1>文本格式化</h1><p>将文本整理为可安全粘贴到提示词、配置或代码字符串的转义文本；内容只在当前浏览器处理。</p></div></div>
    <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><FileText size={16} /></span><div><h2>输入文本</h2><p>会转义双引号、反斜杠、实际换行和制表符。</p></div></div><textarea value={input} onChange={(event) => { setInput(event.target.value); setMessage('') }} placeholder="在这里粘贴文本…" aria-label="待格式化文本" spellCheck="false" /><div className="actions"><button className="primary-button" type="button" onClick={escape}><WrapText size={16} />文本转义</button><button className="secondary-button" type="button" onClick={restore}>还原转义</button><button className="secondary-button" type="button" onClick={clear}><RotateCcw size={16} />清空</button></div></article>
    <article className="simple-tool-card result-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>格式化结果</h2><p>例如双引号会变成 <code>\"</code>，换行会变成 <code>\n</code>。</p></div></div><textarea value={output} readOnly placeholder="点击“文本转义”后，结果会显示在这里" aria-label="文本格式化结果" spellCheck="false" wrap="off" /><div className="actions"><button className="secondary-button" type="button" onClick={copy} disabled={!output}><Clipboard size={16} />复制结果</button></div>{message && <p className="simple-message" role="status">{message}</p>}</article>
    <section className="tool-seo-content"><h2>在线文本转义与格式化</h2><p>将双引号转换为 <code>\"</code>、反斜杠转换为 <code>\\</code>、实际换行转换为 <code>\n</code>，可直接用于 JSON 字符串、提示词模板或配置项。工具会统一处理 Windows、macOS 和 Linux 的换行格式。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>哪些字符会被转义？</h3><p>双引号、反斜杠、实际换行和制表符会分别转换为 <code>\"</code>、<code>\\</code>、<code>\n</code> 和 <code>\t</code>。</p></article><article><h3>“还原转义”会做什么？</h3><p>它会还原 <code>\"</code>、<code>\\</code>、<code>\n</code>、<code>\r</code> 和 <code>\t</code>；无法识别的转义字符会保留。</p></article><article><h3>文本会上传或保存吗？</h3><p>不会。格式化和复制均在本地浏览器完成，本站不会保存输入内容。</p></article></div></section>
  </section>
}
