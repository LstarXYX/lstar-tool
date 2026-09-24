import { useMemo, useState } from 'react'
import { Check, Clipboard, Clock3, RotateCcw } from 'lucide-react'
import { dateToLocalInput, dateToTimestamp, getDateFormats, timestampToDate, type TimestampUnit } from './utils'

const unitLabel: Record<TimestampUnit, string> = { milliseconds: '毫秒级（默认）', seconds: '秒级' }

export function TimestampTool({ onBack }: { onBack: () => void }) {
  const now = new Date()
  const [timestamp, setTimestamp] = useState(String(now.getTime()))
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('milliseconds')
  const [dateInput, setDateInput] = useState(dateToLocalInput(now))
  const [dateUnit, setDateUnit] = useState<TimestampUnit>('milliseconds')
  const [copied, setCopied] = useState('')
  const timestampResult = useMemo(() => {
    try { return { date: timestampToDate(timestamp, timestampUnit), error: '' } } catch (error) { return { date: null, error: error instanceof Error ? error.message : '转换失败。' } }
  }, [timestamp, timestampUnit])
  const dateResult = useMemo(() => {
    try { return { value: dateToTimestamp(dateInput, dateUnit), error: '' } } catch (error) { return { value: null, error: error instanceof Error ? error.message : '转换失败。' } }
  }, [dateInput, dateUnit])
  const copy = async (id: string, value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(id); window.setTimeout(() => setCopied(''), 1500) } catch { setCopied('copy-error') }
  }
  const resetNow = () => {
    const current = new Date()
    setTimestamp(String(current.getTime()))
    setTimestampUnit('milliseconds')
    setDateInput(dateToLocalInput(current))
    setDateUnit('milliseconds')
  }
  const formats = timestampResult.date ? getDateFormats(timestampResult.date) : []
  return <section className="timestamp-workspace" aria-label="时间戳转换工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">TIMESTAMP CONVERTER</span><h1>时间戳转换</h1><p>支持时间戳与年月日时分秒双向转换，可选择秒级或毫秒级（默认），并复制多种日期格式。</p></div><button className="text-button" type="button" onClick={resetNow}><RotateCcw size={16} />使用当前时间</button></div>
    <div className="timestamp-grid"><article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number"><Clock3 size={16} /></span><div><h2>时间戳转日期</h2><p>输入 Unix 时间戳，结果按当前设备时区显示。</p></div></div><div className="unit-selector" aria-label="时间戳精度">{(Object.keys(unitLabel) as TimestampUnit[]).map((unit) => <button type="button" className={timestampUnit === unit ? 'active' : ''} key={unit} onClick={() => setTimestampUnit(unit)}>{unitLabel[unit]}</button>)}</div><input className="tool-input" value={timestamp} inputMode="numeric" onChange={(event) => setTimestamp(event.target.value)} aria-label="待转换的时间戳" />{timestampResult.error ? <p className="simple-message error" role="alert">{timestampResult.error}</p> : <div className="date-format-list">{formats.map(([label, value]) => <div className="date-format" key={label}><div><span>{label}</span><code>{value}</code></div><button type="button" aria-label={`复制${label}`} onClick={() => copy(`date-${label}`, value)}>{copied === `date-${label}` ? <Check size={16} /> : <Clipboard size={16} />}</button></div>)}</div>}</article>
      <article className="simple-tool-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>日期转时间戳</h2><p>选择完整日期和时分秒，实时取得对应时间戳。</p></div></div><div className="unit-selector" aria-label="输出时间戳精度">{(Object.keys(unitLabel) as TimestampUnit[]).map((unit) => <button type="button" className={dateUnit === unit ? 'active' : ''} key={unit} onClick={() => setDateUnit(unit)}>{unitLabel[unit]}</button>)}</div><input className="tool-input" type="datetime-local" step="1" value={dateInput} onChange={(event) => setDateInput(event.target.value)} aria-label="待转换的日期和时间" />{dateResult.error ? <p className="simple-message error" role="alert">{dateResult.error}</p> : <div className="timestamp-result"><span>{dateUnit === 'milliseconds' ? '毫秒级时间戳' : '秒级时间戳'}</span><code>{dateResult.value}</code><button className="secondary-button" type="button" onClick={() => copy('timestamp', String(dateResult.value))}>{copied === 'timestamp' ? <Check size={16} /> : <Clipboard size={16} />}{copied === 'timestamp' ? '已复制' : '复制'}</button></div>}</article></div>
    {copied === 'copy-error' && <p className="simple-message error" role="alert">复制失败，请手动复制结果。</p>}
    <section className="tool-seo-content"><h2>在线时间戳转换工具</h2><p>Unix 时间戳通常以 1970 年 1 月 1 日起经过的秒数或毫秒数表示。工具默认使用 JavaScript 常见的毫秒级时间戳，也可随时切换为秒级。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>默认是秒还是毫秒？</h3><p>默认毫秒级。13 位通常是毫秒级，10 位通常是秒级。</p></article><article><h3>日期按哪个时区转换？</h3><p>输入日期和标准格式结果均按当前设备的本地时区处理；ISO 8601 结果使用 UTC。</p></article><article><h3>日期格式可以复制吗？</h3><p>可以。每种结果右侧都有独立复制按钮。</p></article></div></section>
  </section>
}
