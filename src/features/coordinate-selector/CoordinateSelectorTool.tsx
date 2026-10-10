import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type PointerEvent, type WheelEvent } from 'react'
import { Check, Clipboard, Crosshair, ImageUp, MousePointer2, RefreshCw, Trash2, ZoomIn, ZoomOut } from 'lucide-react'
import { clamp, createRectBox, formatBoxes, rectToStyle, type Point, type RectBox } from './utils'

type ImageInfo = { url: string; name: string; width: number; height: number }
type Notice = { text: string; type: 'success' | 'error' } | null

const minScale = 0.1
const maxScale = 8

export function CoordinateSelectorTool({ onBack }: { onBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<ImageInfo | null>(null)
  const [boxes, setBoxes] = useState<RectBox[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [draft, setDraft] = useState<{ start: Point; end: Point } | null>(null)
  const [panning, setPanning] = useState<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 2200)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url) }, [image])

  useEffect(() => {
    if (!image || !viewportRef.current) return
    const { width, height } = viewportRef.current.getBoundingClientRect()
    const fittedScale = Math.min(1, (width - 24) / image.width, (height - 24) / image.height)
    setScale(fittedScale)
    setPan({ x: (width - image.width * fittedScale) / 2, y: (height - image.height * fittedScale) / 2 })
  }, [image])

  useEffect(() => {
    const deleteSelected = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select') || selectedIndex === null) return
      if (event.key !== 'Delete' && event.key !== 'Backspace') return
      event.preventDefault()
      setBoxes((current) => current.filter((_, index) => index !== selectedIndex))
      setSelectedIndex(null)
    }
    window.addEventListener('keydown', deleteSelected)
    return () => window.removeEventListener('keydown', deleteSelected)
  }, [selectedIndex])

  const showNotice = (text: string, type: 'success' | 'error') => setNotice({ text, type })

  const resetCanvas = (nextImage: ImageInfo) => {
    setImage(nextImage)
    setBoxes([])
    setSelectedIndex(null)
    setDraft(null)
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const readFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotice('请选择图片文件。', 'error')
      return
    }
    const url = URL.createObjectURL(file)
    const preview = new Image()
    preview.onload = () => {
      resetCanvas({ url, name: file.name, width: preview.naturalWidth, height: preview.naturalHeight })
      showNotice('图片已载入，可开始框选。', 'success')
    }
    preview.onerror = () => {
      URL.revokeObjectURL(url)
      showNotice('图片读取失败，请更换文件后重试。', 'error')
    }
    preview.src = url
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) readFile(file)
  }

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  const pointFromEvent = (event: PointerEvent<HTMLDivElement> | WheelEvent<HTMLDivElement>): Point | null => {
    if (!image || !viewportRef.current) return null
    const bounds = viewportRef.current.getBoundingClientRect()
    return {
      x: clamp((event.clientX - bounds.left - pan.x) / scale, 0, image.width),
      y: clamp((event.clientY - bounds.top - pan.y) / scale, 0, image.height),
    }
  }

  const removeBox = (index: number) => {
    setBoxes((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setSelectedIndex((current) => current === index ? null : current !== null && current > index ? current - 1 : current)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!image) return
    if (event.button === 1) {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      setPanning({ startX: event.clientX, startY: event.clientY, panX: pan.x, panY: pan.y })
      return
    }
    if (event.button !== 0) return
    const point = pointFromEvent(event)
    if (!point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedIndex(null)
    setDraft({ start: point, end: point })
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (panning) {
      setPan({ x: panning.panX + event.clientX - panning.startX, y: panning.panY + event.clientY - panning.startY })
      return
    }
    if (!draft) return
    const point = pointFromEvent(event)
    if (point) setDraft((current) => current ? { ...current, end: point } : null)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (panning) {
      setPanning(null)
      return
    }
    if (!draft || !image) return
    const point = pointFromEvent(event) ?? draft.end
    const box = createRectBox(draft.start, point, image.width, image.height)
    setDraft(null)
    if (!box) return
    setSelectedIndex(boxes.length)
    setBoxes((current) => [...current, box])
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!image) return
    event.preventDefault()
    const anchor = pointFromEvent(event)
    if (!anchor || !viewportRef.current) return
    const bounds = viewportRef.current.getBoundingClientRect()
    const nextScale = clamp(scale * (event.deltaY < 0 ? 1.12 : 0.88), minScale, maxScale)
    const pointerX = event.clientX - bounds.left
    const pointerY = event.clientY - bounds.top
    setScale(nextScale)
    setPan({ x: pointerX - anchor.x * nextScale, y: pointerY - anchor.y * nextScale })
  }

  const changeScale = (factor: number) => {
    if (!image || !viewportRef.current) return
    const bounds = viewportRef.current.getBoundingClientRect()
    const anchor = { x: (bounds.width / 2 - pan.x) / scale, y: (bounds.height / 2 - pan.y) / scale }
    const nextScale = clamp(scale * factor, minScale, maxScale)
    setScale(nextScale)
    setPan({ x: bounds.width / 2 - anchor.x * nextScale, y: bounds.height / 2 - anchor.y * nextScale })
  }

  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }) }
  const copyBoxes = async () => {
    if (!boxes.length) return
    try {
      await navigator.clipboard.writeText(formatBoxes(boxes))
      showNotice('完整坐标数据已复制。', 'success')
    } catch { showNotice('复制失败，请手动复制。', 'error') }
  }

  const clearBoxes = () => { setBoxes([]); setSelectedIndex(null) }
  const draftStyle = draft && image ? rectToStyle(createRectBox(draft.start, draft.end, image.width, image.height) ?? { type: 'rect', box: [draft.start.x, draft.start.y, draft.end.x, draft.end.y].map(Math.round) as RectBox['box'] }) : null

  return <section className="coordinate-workspace" aria-label="坐标框选工具">
    <div className="tool-intro">
      <div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">IMAGE ANNOTATION</span><h1>坐标框选工具</h1><p>上传图片后用矩形框选区域。坐标按原图像素记录，缩放、平移不会影响导出结果。</p></div>
      {image && <button className="text-button" type="button" onClick={resetView}><RefreshCw size={16} />重置视图</button>}
    </div>

    {!image ? <div className="coordinate-upload dropzone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} />
      <span className="upload-icon"><ImageUp size={25} /></span><strong>拖拽图片到这里，或点击上传</strong><span>图片只在当前浏览器中读取和处理</span>
    </div> : <div className="coordinate-layout">
      <article className="coordinate-canvas-card">
        <div className="coordinate-card-heading"><div><h2>{image.name}</h2><p>{image.width} × {image.height} px · 左键框选，中键拖动，滚轮缩放</p></div><span>{Math.round(scale * 100)}%</span></div>
        <div className={`coordinate-viewport ${panning ? 'is-panning' : ''}`} ref={viewportRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}>
          <div className="coordinate-stage" style={{ width: image.width, height: image.height, transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}>
            <img src={image.url} alt="待框选图片" draggable="false" />
            {boxes.map((box, index) => <button key={`${box.box.join('-')}-${index}`} className={`coordinate-box ${selectedIndex === index ? 'selected' : ''}`} type="button" style={rectToStyle(box)} onPointerDown={(event) => { event.stopPropagation(); setSelectedIndex(index) }} onClick={(event) => event.stopPropagation()} aria-label={`选择框选 ${index + 1}`}><span>{index + 1}</span></button>)}
            {draftStyle && <div className="coordinate-box draft" style={draftStyle} />}
          </div>
        </div>
        <div className="coordinate-canvas-controls"><button type="button" onClick={() => changeScale(.8)} aria-label="缩小"><ZoomOut size={16} /></button><button type="button" onClick={() => changeScale(1.25)} aria-label="放大"><ZoomIn size={16} /></button><span><MousePointer2 size={15} />框选后可点击选中，按 Delete 或 Backspace 删除</span></div>
      </article>
      <aside className="coordinate-output-card">
        <div className="coordinate-card-heading"><div><h2>框选坐标</h2><p>{boxes.length ? `共 ${boxes.length} 个矩形` : '尚未框选区域'}</p></div><Crosshair size={20} /></div>
        <div className="coordinate-box-list">{boxes.length ? boxes.map((box, index) => <div className={`coordinate-box-row ${selectedIndex === index ? 'selected' : ''}`} key={`${box.box.join('-')}-${index}`}><button type="button" onClick={() => setSelectedIndex(index)}><b>矩形 {index + 1}</b><code>[{box.box.join(', ')}]</code></button><button type="button" onClick={() => removeBox(index)} aria-label={`删除矩形 ${index + 1}`}><Trash2 size={15} /></button></div>) : <div className="coordinate-empty"><Crosshair size={26} /><p>在左侧图片上拖动鼠标，即可创建矩形框。</p></div>}</div>
        <textarea className="coordinate-json" value={formatBoxes(boxes)} readOnly aria-label="完整坐标数据" />
        <div className="coordinate-actions"><button className="primary-button" type="button" onClick={copyBoxes} disabled={!boxes.length}><Clipboard size={16} />复制完整数据</button><button className="secondary-button" type="button" onClick={clearBoxes} disabled={!boxes.length}><Trash2 size={16} />清空</button></div>
        <p className="coordinate-format-note"><Check size={15} />导出保留 <code>type</code> 字段，后续可兼容圆形、多边形和掩码类型。</p>
      </aside>
    </div>}
    <section className="tool-seo-content coordinate-seo"><h2>图片坐标框选说明</h2><p>选择图片后，左键拖动可建立多个矩形框。坐标使用原图像素，因此即使放大、缩小或中键平移，导出的 x1、y1、x2、y2 也保持准确。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>坐标格式是什么？</h3><p>完整复制内容是矩形对象数组，每项为 <code>{'{"type":"rect","box":[x1,y1,x2,y2]}'}</code>。</p></article><article><h3>如何删除框选？</h3><p>点击矩形或右侧列表选中后，按 Delete 或 Backspace；也可以点击每项右侧的删除按钮。</p></article><article><h3>图片会上传吗？</h3><p>不会。图片预览、框选与坐标生成均在当前浏览器本地完成。</p></article></div></section>
    {notice && <div className={`toast ${notice.type}`} role="status">{notice.text}</div>}
  </section>
}
