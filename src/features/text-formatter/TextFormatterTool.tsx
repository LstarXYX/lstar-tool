import { useState } from 'react'
import { Clipboard, FileText, RotateCcw, WrapText } from 'lucide-react'
import { writeClipboardText } from '../../platform/clipboard'
import { escapeLineBreaks, restoreLineBreaks } from './utils'

export function TextFormatterTool({ onBack }: { onBack: () => void }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [message, setMessage] = useState('')

  const formatLineBreaks = () => {
    setOutput(escapeLineBreaks(input))
    setMessage('已将实际换行转换为 \\n。')
  }

  const restore = () => {
    setOutput(restoreLineBreaks(input))
    setMessage('已还原换行符。')
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
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">TEXT FORMATTER</span><h1>文本格式化</h1><p>将多行文本整理为带 <code>\n</code> 的单行文本，方便粘贴到提示词、配置或代码字符串中；内容只在当前浏览器处理。</p></div></div>
    <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><FileText size={16} /></span><div><h2>输入文本</h2><p>粘贴包含实际换行的内容；已有的 <code>\n</code> 不会被重复转义。</p></div></div><textarea value={input} onChange={(event) => { setInput(event.target.value); setMessage('') }} placeholder="在这里粘贴多行文本…" aria-label="待格式化文本" spellCheck="false" /><div className="actions"><button className="primary-button" type="button" onClick={formatLineBreaks}><WrapText size={16} />换行转 \n</button><button className="secondary-button" type="button" onClick={restore}>还原 \n</button><button className="secondary-button" type="button" onClick={clear}><RotateCcw size={16} />清空</button></div></article>
    <article className="simple-tool-card result-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>格式化结果</h2><p>结果中的 <code>\n</code> 是可见字符，复制后可直接用作文本转义。</p></div></div><textarea value={output} readOnly placeholder="点击“换行转 \n”后，结果会显示在这里" aria-label="文本格式化结果" spellCheck="false" wrap="off" /><div className="actions"><button className="secondary-button" type="button" onClick={copy} disabled={!output}><Clipboard size={16} />复制结果</button></div>{message && <p className="simple-message" role="status">{message}</p>}</article>
    <section className="tool-seo-content"><h2>在线文本换行格式化</h2><p>将实际换行转换为可见的 <code>\n</code>，可避免在单行输入框、JSON 字符串、提示词模板或配置项中丢失段落结构。工具会统一处理 Windows、macOS 和 Linux 的换行格式。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>已有的 <code>\n</code> 会变成 <code>\\n</code> 吗？</h3><p>不会。该操作只转换文本中真实存在的换行，不会修改已输入的反斜杠和 n。</p></article><article><h3>“还原 <code>\n</code>”会做什么？</h3><p>它会将 <code>\n</code>、<code>\r\n</code> 和 <code>\r</code> 还原为实际换行，其他转义字符会保留。</p></article><article><h3>文本会上传或保存吗？</h3><p>不会。格式化和复制均在本地浏览器完成，本站不会保存输入内容。</p></article></div></section>
  </section>
}
