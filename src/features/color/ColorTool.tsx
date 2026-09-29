import { useMemo, useState } from 'react'
import { Check, Clipboard, Palette, RotateCcw } from 'lucide-react'
import { colorFormats, parseColor, toOpaqueHex, type RgbaColor } from './utils'

const initialColor: RgbaColor = { r: 40, g: 126, b: 243, a: 1 }

const labels = { hex: 'HEX / HEXA', rgb: 'RGB / RGBA', hsl: 'HSL / HSLA', hsv: 'HSV / HSVA', hwb: 'HWB' } as const

export function ColorTool({ onBack }: { onBack: () => void }) {
  const [color, setColor] = useState(initialColor)
  const [drafts, setDrafts] = useState(() => colorFormats(initialColor))
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const formats = useMemo(() => colorFormats(color), [color])

  const applyColor = (next: RgbaColor) => {
    setColor(next)
    setDrafts(colorFormats(next))
    setError('')
  }
  const updateFormat = (key: keyof typeof formats, value: string) => {
    setDrafts((current) => ({ ...current, [key]: value }))
    const parsed = parseColor(value)
    if (parsed) applyColor(parsed)
    else setError('颜色代码格式不正确，请检查后继续输入。')
  }
  const copy = async (key: keyof typeof formats) => {
    try { await navigator.clipboard.writeText(formats[key]); setCopied(key); window.setTimeout(() => setCopied(''), 1500) } catch { setError('复制失败，请手动复制颜色代码。') }
  }
  const reset = () => applyColor(initialColor)

  return <section className="color-workspace" aria-label="颜色转换工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">COLOR CONVERTER</span><h1>颜色取色与转换</h1><p>通过取色盘或直接输入代码选择颜色。支持 HEX、RGB、HSL、HSV 与 HWB，任一格式修改后都会同步更新。</p></div><button className="text-button" type="button" onClick={reset}><RotateCcw size={16} />恢复默认</button></div>
    <div className="color-layout">
      <article className="color-preview-card"><div className="simple-tool-heading"><span className="step-number"><Palette size={16} /></span><div><h2>选择颜色</h2><p>使用系统取色盘，或在右侧输入一种颜色代码。</p></div></div><div className="color-swatch" style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})` }}><span>{formats.hex}</span></div><label className="native-color-picker"><input type="color" value={toOpaqueHex(color)} onChange={(event) => applyColor({ ...parseColor(event.target.value)!, a: color.a })} aria-label="打开颜色取色盘" /><span>打开取色盘</span></label><div className="color-channel-list"><span>R <b>{color.r}</b></span><span>G <b>{color.g}</b></span><span>B <b>{color.b}</b></span><span>透明度 <b>{Math.round(color.a * 100)}%</b></span></div></article>
      <article className="color-formats-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>颜色代码</h2><p>可输入任意一行；有效内容会实时转换为其他格式。</p></div></div><div className="color-format-list">{(Object.keys(labels) as (keyof typeof formats)[]).map((key) => <label className="color-format-row" key={key}><span>{labels[key]}</span><div><input value={drafts[key]} onChange={(event) => updateFormat(key, event.target.value)} aria-label={labels[key]} spellCheck="false" /><button type="button" onClick={() => copy(key)} aria-label={`复制 ${labels[key]}`}>{copied === key ? <Check size={16} /> : <Clipboard size={16} />}</button></div></label>)}</div>{error && <p className="simple-message error" role="alert">{error}</p>}</article>
    </div>
    <section className="tool-seo-content"><h2>在线颜色转换与取色</h2><p>使用取色盘选择任意颜色，或粘贴常见的 CSS 和设计工具颜色值。透明度会随 HEXA、RGB、HSL、HSV、HWB 格式一起保留；RGB 同时支持 0–255 数值和百分比写法。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>支持哪些颜色代码？</h3><p>支持 #RGB、#RGBA、#RRGGBB、#RRGGBBAA，RGB(A)、HSL(A)、HSV(A) 与 HWB；HSL 的色相可使用 deg、rad、grad 或 turn。</p></article><article><h3>为什么选取色盘后透明度不变？</h3><p>浏览器原生取色盘仅选择不透明 RGB 颜色。工具会保留你已输入的透明度，方便继续调整。</p></article><article><h3>颜色数据会上传吗？</h3><p>不会。所有颜色解析和格式转换都在当前浏览器本地完成。</p></article></div></section>
  </section>
}
