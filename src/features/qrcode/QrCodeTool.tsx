import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Clipboard, Download, FileImage, FileVideo, Link2, QrCode, RefreshCw } from 'lucide-react'

type ContentType = 'text' | 'image' | 'video'

const typeContent = {
  text: { label: '文字或链接', placeholder: '输入文字、网址、联系方式或其他要编码的内容', hint: '文字和网址会直接写入二维码。' },
  image: { label: '图片公开链接', placeholder: 'https://example.com/photo.jpg', hint: '输入可公开访问的图片链接，扫码后将在设备上打开图片。' },
  video: { label: '视频公开链接', placeholder: 'https://example.com/video.mp4', hint: '输入可公开访问的视频链接，扫码后将在设备上打开视频。' },
} as const

export function QrCodeTool({ onBack }: { onBack: () => void }) {
  const [type, setType] = useState<ContentType>('text')
  const [content, setContent] = useState('https://tool.lstarr.xyz/')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    const value = content.trim()
    if (!value) return () => { active = false }
    QRCode.toDataURL(value, { errorCorrectionLevel: 'M', margin: 1, width: 640, color: { dark: '#14233F', light: '#FFFFFF' } })
      .then((url) => { if (active) { setImageUrl(url); setError('') } })
      .catch(() => { if (active) { setImageUrl(''); setError('内容过长，无法生成二维码。请缩短文字或使用更短的链接。') } })
    return () => { active = false }
  }, [content])

  const changeType = (nextType: ContentType) => {
    setType(nextType)
    setContent('')
    setImageUrl('')
    setError('')
  }
  const changeContent = (value: string) => {
    setContent(value)
    setImageUrl('')
    if (!value.trim()) setError('')
  }
  const download = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = 'lstar-qrcode.png'
    link.click()
  }
  const copyContent = async () => {
    try { await navigator.clipboard.writeText(content); setCopied(true); window.setTimeout(() => setCopied(false), 1500) } catch { setError('复制失败，请手动复制内容。') }
  }

  const detail = typeContent[type]
  const visibleError = error || (!content.trim() ? '请输入需要生成二维码的内容。' : '')
  return <section className="qrcode-workspace" aria-label="二维码生成工具">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">QR CODE GENERATOR</span><h1>二维码生成工具</h1><p>为文字、网址和公开媒体链接生成可下载的二维码。处理过程全部在当前浏览器完成。</p></div><button className="text-button" type="button" onClick={() => changeContent('')}><RefreshCw size={16} />清空内容</button></div>
    <div className="qrcode-layout">
      <article className="qrcode-input-card"><div className="simple-tool-heading"><span className="step-number">01</span><div><h2>输入内容</h2><p>选择二维码承载内容的类型。</p></div></div><div className="qrcode-tabs" role="tablist" aria-label="内容类型"><button type="button" className={type === 'text' ? 'active' : ''} onClick={() => changeType('text')}><QrCode size={16} />文字</button><button type="button" className={type === 'image' ? 'active' : ''} onClick={() => changeType('image')}><FileImage size={16} />图片链接</button><button type="button" className={type === 'video' ? 'active' : ''} onClick={() => changeType('video')}><FileVideo size={16} />视频链接</button></div><label className="qrcode-content-label" htmlFor="qrcode-content">{detail.label}<textarea id="qrcode-content" value={content} onChange={(event) => changeContent(event.target.value)} placeholder={detail.placeholder} spellCheck="false" /></label><p className="qrcode-hint"><Link2 size={15} />{detail.hint}</p>{(type === 'image' || type === 'video') && <p className="qrcode-limitation">二维码容量远小于普通图片或视频。本站不上传文件，因此请提供已经公开托管的媒体链接；本地文件不能被其他扫码设备访问。</p>}</article>
      <article className="qrcode-result-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>二维码预览</h2><p>生成后可保存为 PNG 图片。</p></div></div>{imageUrl && content.trim() ? <><div className="qrcode-image-wrap"><img src={imageUrl} alt="生成的二维码" /></div><div className="qrcode-actions"><button className="primary-button" type="button" onClick={download}><Download size={17} />下载 PNG</button><button className="secondary-button" type="button" onClick={copyContent}>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? '已复制' : '复制内容'}</button></div></> : <div className="qrcode-empty"><QrCode size={42} /><p>{visibleError || '输入内容后将在这里生成二维码。'}</p></div>}{error && imageUrl && <p className="simple-message error" role="alert">{error}</p>}</article>
    </div>
    <section className="tool-seo-content"><h2>在线二维码生成器</h2><p>二维码适合承载短文本、网址、联系方式和其他简短数据。输入内容会直接编码，生成和下载都只在你的浏览器中进行，无需注册。</p><h2>媒体二维码说明</h2><div className="faq-grid"><article><h3>能把图片直接放进二维码吗？</h3><p>不能用于普通图片。二维码最大只能容纳约数 KB 数据，无法承载常见图片；请把图片上传到可公开访问的位置，再把链接生成二维码。</p></article><article><h3>视频二维码如何使用？</h3><p>视频文件远超二维码容量。提供一个公开的视频页或视频文件链接，扫码设备即可通过二维码打开该链接。</p></article><article><h3>内容会上传或保存吗？</h3><p>不会。生成所需的文字或链接仅在当前浏览器中处理，刷新或关闭页面后不会由本站保留。</p></article></div></section>
  </section>
}
