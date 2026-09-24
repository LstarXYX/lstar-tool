import { useMemo, useState } from 'react'
import { Braces, ChevronDown, ChevronRight, CodeXml, Expand, Minimize2, Sparkles, Unplug, WandSparkles } from 'lucide-react'
import { compactJson, escapeJsonText, formatJson, getContainerPaths, parseEditedValue, parseJson, type JsonValue, unescapeJsonText, updateAtPath } from './utils'

const starterJson = `{
  "project": "Lstar Tools",
  "enabled": true,
  "tools": [
    { "name": "图片 / Base64", "status": "ready" },
    { "name": "JSON 格式化", "status": "ready" }
  ],
  "version": 1
}`

type TreeNodeProps = {
  label?: string
  value: JsonValue
  path: (string | number)[]
  collapsed: Set<string>
  onToggle: (path: string) => void
  onEdit: (path: (string | number)[], previous: JsonValue, text: string) => void
}

function TreeNode({ label, value, path, collapsed, onToggle, onEdit }: TreeNodeProps) {
  const nodePath = path.join('.')
  const isContainer = value !== null && typeof value === 'object'
  const isCollapsed = collapsed.has(nodePath)
  const type = Array.isArray(value) ? 'array' : typeof value
  if (!isContainer) {
    const display = value === null ? 'null' : String(value)
    return <div className="json-leaf"><span className="json-key">{label}</span><span className="json-colon">:</span><input aria-label={`${label ?? '根节点'} 的值`} className={`json-value ${type}`} value={display} onChange={(event) => onEdit(path, value, event.target.value)} /></div>
  }
  const entries = Array.isArray(value) ? value.map((item, index) => [String(index), item] as const) : Object.entries(value)
  return <div className="json-node"><div className="json-node-header"><button type="button" className="tree-toggle" aria-label={isCollapsed ? `展开 ${label ?? '根节点'}` : `折叠 ${label ?? '根节点'}`} onClick={() => onToggle(nodePath)}>{isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}</button>{label !== undefined && <span className="json-key">{label}</span>}{label !== undefined && <span className="json-colon">:</span>}<span className="json-bracket">{Array.isArray(value) ? '[' : '{'}</span>{isCollapsed && <button className="collapsed-summary" type="button" onClick={() => onToggle(nodePath)}>{Array.isArray(value) ? `${value.length} 项` : `${entries.length} 个字段`}</button>}</div>{!isCollapsed && <div className="json-children">{entries.map(([key, child]) => <TreeNode key={key} label={Array.isArray(value) ? `[${key}]` : key} value={child} path={[...path, Array.isArray(value) ? Number(key) : key]} collapsed={collapsed} onToggle={onToggle} onEdit={onEdit} />)}</div>}{!isCollapsed && <div className="json-node-footer"><span className="tree-spacer" /><span className="json-bracket">{Array.isArray(value) ? ']' : '}'}</span></div>}</div>
}

export function JsonFormatterTool({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState(starterJson)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const parsed = useMemo(() => {
    try { return { value: parseJson(text), error: '' } } catch (error) { return { value: null, error: error instanceof Error ? error.message : 'JSON 格式无效。' } }
  }, [text])

  const runTextAction = (action: 'format' | 'compact' | 'escape' | 'unescape') => {
    try {
      const handlers = { format: formatJson, compact: compactJson, escape: escapeJsonText, unescape: unescapeJsonText }
      setText(handlers[action](text))
      setMessage(action === 'escape' ? '已将左侧文本转义为 JSON 字符串。' : action === 'unescape' ? '已移除一层 JSON 转义。' : 'JSON 内容已更新。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '操作失败，请检查输入。') }
  }

  const editNode = (path: (string | number)[], previous: JsonValue, nextText: string) => {
    if (parsed.error) return
    const nextValue = updateAtPath(parsed.value, path, parseEditedValue(nextText, previous))
    setText(JSON.stringify(nextValue, null, 2))
    setMessage('结构化修改已同步到左侧。')
  }
  const toggle = (path: string) => setCollapsed((current) => { const next = new Set(current); if (next.has(path)) next.delete(path); else next.add(path); return next })
  const collapseAll = () => { if (!parsed.error) setCollapsed(new Set(getContainerPaths(parsed.value))) }

  return <section className="json-workspace" aria-label="JSON 格式化工具">
    <div className="tool-intro json-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">JSON WORKBENCH</span><h1>JSON 格式化与结构编辑</h1><p>编辑左侧 JSON，右侧会实时呈现结构节点；在节点中修改数值或文本，也会同步更新原始内容。</p></div></div>
    <div className="json-workbench">
      <article className="json-panel source-panel"><div className="json-panel-heading"><div><span className="step-number">01</span><h2>JSON 内容</h2></div><span>本地处理</span></div><div className="json-toolbar"><button type="button" onClick={collapseAll}><Minimize2 size={15} />折叠</button><button type="button" onClick={() => setCollapsed(new Set())}><Expand size={15} />展开</button><button type="button" onClick={() => runTextAction('format')}><WandSparkles size={15} />格式化</button><button type="button" onClick={() => runTextAction('compact')}><Minimize2 size={15} />紧凑</button><button type="button" onClick={() => runTextAction('escape')}><CodeXml size={15} />转义</button><button type="button" onClick={() => runTextAction('unescape')}><Unplug size={15} />移除转义</button></div><textarea className="json-textarea" value={text} onChange={(event) => { setText(event.target.value); setMessage('') }} spellCheck="false" aria-label="JSON 原始内容" />{parsed.error && <p className="json-error" role="alert">{parsed.error}</p>}{message && !parsed.error && <p className="json-message"><Sparkles size={14} />{message}</p>}</article>
      <article className="json-panel tree-panel"><div className="json-panel-heading"><div><span className="step-number">02</span><h2>结构化视图</h2></div><span>{parsed.error ? '等待有效 JSON' : '可编辑节点'}</span></div>{parsed.error ? <div className="json-empty"><Braces size={26} /><h2>等待有效 JSON</h2><p>修正左侧内容后，即可查看和编辑树状节点。</p></div> : <div className="json-tree"><TreeNode value={parsed.value} path={[]} collapsed={collapsed} onToggle={toggle} onEdit={editNode} /></div>}</article>
    </div>
    <div className="privacy-note"><Sparkles size={16} /><span>所有 JSON 解析、格式化与编辑均在当前浏览器内完成，不会上传你的内容。</span></div>
  </section>
}
