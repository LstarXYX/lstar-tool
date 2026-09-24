import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Box, CheckCircle2, ChevronLeft, ChevronRight, Code2, Heart, LockKeyhole, Search, Sparkles } from 'lucide-react'
import { tools, type ToolDefinition } from './data/tools'
import { ImageBase64Tool } from './features/image-base64/ImageBase64Tool'
import { JsonFormatterTool } from './features/json-formatter/JsonFormatterTool'
import { UrlCodecTool } from './features/url-codec/UrlCodecTool'
import { Md5Tool } from './features/md5/Md5Tool'
import { TimestampTool } from './features/timestamp/TimestampTool'

type View = 'home' | 'toolbox' | 'image-base64' | 'json' | 'url-codec' | 'md5' | 'timestamp'
type Category = '全部' | ToolDefinition['category'] | '我的收藏'

const categories: Category[] = ['全部', '图片处理', '编码/解码', '开发辅助', '效率工具', '我的收藏']
const favouritesKey = 'lstar-tools:favourites'
const appBase = import.meta.env.BASE_URL

const getViewFromLocation = (): View => {
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.endsWith('/tools/image-base64')) return 'image-base64'
  if (path.endsWith('/tools/json-formatter')) return 'json'
  if (path.endsWith('/tools/url-codec')) return 'url-codec'
  if (path.endsWith('/tools/md5')) return 'md5'
  if (path.endsWith('/tools/timestamp')) return 'timestamp'
  if (path.endsWith('/tools')) return 'toolbox'
  return 'home'
}

const getPathForView = (view: View) => ({
  home: appBase,
  toolbox: `${appBase}tools/`,
  'image-base64': `${appBase}tools/image-base64/`,
  json: `${appBase}tools/json-formatter/`,
  'url-codec': `${appBase}tools/url-codec/`,
  md5: `${appBase}tools/md5/`,
  timestamp: `${appBase}tools/timestamp/`,
}[view])

function ToolCard({ tool, favourite, onOpen, onToggleFavourite }: { tool: ToolDefinition; favourite: boolean; onOpen: (id: string) => void; onToggleFavourite: (id: string) => void }) {
  const Icon = tool.icon
  return (
    <article className={`tool-card ${tool.available ? 'available' : 'disabled'}`}>
      <button className="favourite-button" type="button" aria-label={favourite ? `取消收藏 ${tool.name}` : `收藏 ${tool.name}`} aria-pressed={favourite} onClick={() => onToggleFavourite(tool.id)}><Heart size={17} fill={favourite ? 'currentColor' : 'none'} /></button>
      <button className="tool-card-main" type="button" onClick={() => tool.available && onOpen(tool.id)} disabled={!tool.available}>
        <span className="tool-icon"><Icon size={22} /></span>
        <span className="tool-card-content"><strong>{tool.name}</strong><small>{tool.description}</small><em>{tool.category}</em></span>
        {tool.available ? <ChevronRight className="tool-arrow" size={20} /> : <span className="soon">即将推出</span>}
      </button>
    </article>
  )
}

function App() {
  const [view, setView] = useState<View>(getViewFromLocation)
  const [favourites, setFavourites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(favouritesKey) ?? '[]') as string[] } catch { return [] }
  })
  const [category, setCategory] = useState<Category>('全部')
  const [query, setQuery] = useState('')
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => { localStorage.setItem(favouritesKey, JSON.stringify(favourites)) }, [favourites])
  useEffect(() => {
    document.title = view === 'json' ? 'JSON 格式化工具 · Lstar Tools' : view === 'image-base64' ? '图片与 Base64 互转 · Lstar Tools' : view === 'url-codec' ? 'URL 编码解码 · Lstar Tools' : view === 'md5' ? 'MD5 加密 · Lstar Tools' : view === 'timestamp' ? '时间戳转换 · Lstar Tools' : view === 'toolbox' ? '工具箱 · Lstar Tools' : 'Lstar Tools · 轻巧的开发工具箱'
  }, [view])
  useEffect(() => {
    const handlePopState = () => setView(getViewFromLocation())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextView: View, scroll = true) => {
    const nextPath = getPathForView(nextView)
    if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath)
    setView(nextView)
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openTool = (id: string) => {
    if (id === 'image-base64' || id === 'json' || id === 'url-codec' || id === 'md5' || id === 'timestamp') {
      navigate(id)
    }
  }
  const showToolbox = () => navigate('toolbox')
  const showAbout = () => { navigate('home', false); window.setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 0) }
  const toggleFavourite = (id: string) => setFavourites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const filteredTools = useMemo(() => tools.filter((tool) => {
    const matchCategory = category === '全部' || (category === '我的收藏' ? favourites.includes(tool.id) : tool.category === category)
    const text = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase()
    return matchCategory && text.includes(query.trim().toLowerCase())
  }), [category, favourites, query])
  const scrollCarousel = (direction: number) => carouselRef.current?.scrollBy({ left: direction * 300, behavior: 'smooth' })

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" type="button" onClick={() => navigate('home')} aria-label="返回首页"><span className="brand-mark"><Sparkles size={18} /></span><span>Lstar <b>Tools</b></span></button>
        <nav aria-label="主导航"><button className={view === 'toolbox' ? 'active' : ''} type="button" onClick={showToolbox}>工具箱</button><button type="button" onClick={showAbout}>关于我们</button></nav>
        <a className="github-link" href="https://github.com/LstarXYX/lstar-tool" target="_blank" rel="noreferrer"><Code2 size={17} />GitHub</a>
      </header>

      <main>
        {view === 'image-base64' && <ImageBase64Tool onBack={showToolbox} />}
        {view === 'json' && <JsonFormatterTool onBack={showToolbox} />}
        {view === 'url-codec' && <UrlCodecTool onBack={showToolbox} />}
        {view === 'md5' && <Md5Tool onBack={showToolbox} />}
        {view === 'timestamp' && <TimestampTool onBack={showToolbox} />}
        {view === 'home' && <>
          <section className="hero">
            <div className="hero-copy"><span className="hero-badge"><Sparkles size={14} />为开发者而生</span><h1>简单工具，<br /><em>专注创造。</em></h1><p>一组快速、可靠且尊重隐私的在线小工具。没有冗余步骤，帮你把时间留给真正重要的工作。</p><button className="hero-button" type="button" onClick={showToolbox}>探索工具 <ArrowRight size={18} /></button></div>
            <div className="hero-art" aria-hidden="true"><div className="orb orb-one" /><div className="orb orb-two" /><div className="code-window"><div className="window-top"><i /><i /><i /><span>image.ts</span></div><pre><code><span>const</span> image = <b>await</b> convert(file);<br />save(image.<span>base64</span>);</code></pre><div className="window-status"><CheckCircle2 size={14} />本地安全处理</div></div></div>
          </section>
          <section className="tools-section home-tools"><div className="section-heading"><div><span className="eyebrow">TOOLBOX</span><h2>为下一项工作选个工具</h2></div><button className="show-all-button" type="button" onClick={showToolbox}>查看全部 <ArrowRight size={16} /></button></div><div className="tool-carousel-wrap"><button className="carousel-control previous" type="button" aria-label="查看上一组工具" onClick={() => scrollCarousel(-1)}><ChevronLeft size={19} /></button><div className="tool-carousel" ref={carouselRef}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} favourite={favourites.includes(tool.id)} onOpen={openTool} onToggleFavourite={toggleFavourite} />)}</div><button className="carousel-control next" type="button" aria-label="查看下一组工具" onClick={() => scrollCarousel(1)}><ChevronRight size={19} /></button></div><p className="carousel-hint">工具会持续更新；此处预留横向浏览体验。</p></section>
          <section className="values" id="about"><div><span className="value-icon"><LockKeyhole size={20} /></span><h3>隐私优先</h3><p>处理过程留在你的设备中，数据无需上传。</p></div><div><span className="value-icon"><Code2 size={20} /></span><h3>轻巧直接</h3><p>打开即用，减少不必要的配置与等待。</p></div><div><span className="value-icon"><Box size={20} /></span><h3>持续扩展</h3><p>围绕实际需求，逐步加入更多实用工具。</p></div></section>
        </>}
        {view === 'toolbox' && <section className="toolbox-page"><div className="toolbox-hero"><button className="back-button" type="button" onClick={() => navigate('home')}><ArrowLeft size={16} />返回首页</button><span className="eyebrow">ALL TOOLS</span><h1>找到适合你的工具</h1><p>按类别筛选、搜索名称或描述；点击心形即可收藏，收藏信息仅保存在当前浏览器。</p></div><div className="toolbox-controls"><label className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索工具，例如 Base64、JSON…" /></label><div className="category-tabs" aria-label="工具分类">{categories.map((item) => <button className={category === item ? 'active' : ''} type="button" key={item} onClick={() => setCategory(item)}>{item}{item === '我的收藏' && favourites.length > 0 ? ` · ${favourites.length}` : ''}</button>)}</div></div><div className="toolbox-results"><p>{filteredTools.length ? `共找到 ${filteredTools.length} 个工具` : '没有找到匹配的工具'}</p><div className="tool-grid all-tools">{filteredTools.map((tool) => <ToolCard key={tool.id} tool={tool} favourite={favourites.includes(tool.id)} onOpen={openTool} onToggleFavourite={toggleFavourite} />)}</div>{!filteredTools.length && <div className="empty-state"><Heart size={24} /><h2>这里还没有工具</h2><p>试试切换分类、修改搜索内容，或先收藏喜欢的工具。</p></div>}</div></section>}
      </main>
      <footer><span>© 2026 Lstar Tools</span><span>Built for focused work.</span></footer>
    </div>
  )
}

export default App
