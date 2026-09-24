import { useState } from 'react'
import { ArrowRight, Box, CheckCircle2, ChevronRight, Code2, LockKeyhole, Sparkles } from 'lucide-react'
import { tools } from './data/tools'
import { ImageBase64Tool } from './features/image-base64/ImageBase64Tool'

function App() {
  const [activeTool, setActiveTool] = useState('home')
  const isToolView = activeTool === 'image-base64'

  const openTool = (id: string) => {
    if (id === 'image-base64') {
      setActiveTool(id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <button className="brand" type="button" onClick={() => setActiveTool('home')} aria-label="返回首页"><span className="brand-mark"><Sparkles size={18} /></span><span>Lstar <b>Tools</b></span></button>
        <nav aria-label="主导航"><button className={!isToolView ? 'active' : ''} type="button" onClick={() => setActiveTool('home')}>工具箱</button><a href="#about">关于我们</a></nav>
        <a className="github-link" href="https://github.com" target="_blank" rel="noreferrer"><Code2 size={17} />GitHub</a>
      </header>

      <main>
        {isToolView ? <ImageBase64Tool /> : <>
          <section className="hero">
            <div className="hero-copy"><span className="hero-badge"><Sparkles size={14} />为开发者而生</span><h1>简单工具，<br /><em>专注创造。</em></h1><p>一组快速、可靠且尊重隐私的在线小工具。没有冗余步骤，帮你把时间留给真正重要的工作。</p><button className="hero-button" type="button" onClick={() => openTool('image-base64')}>探索工具 <ArrowRight size={18} /></button></div>
            <div className="hero-art" aria-hidden="true"><div className="orb orb-one" /><div className="orb orb-two" /><div className="code-window"><div className="window-top"><i /><i /><i /><span>image.ts</span></div><pre><code><span>const</span> image = <b>await</b> convert(file);<br />save(image.<span>base64</span>);</code></pre><div className="window-status"><CheckCircle2 size={14} />本地安全处理</div></div></div>
          </section>

          <section className="tools-section" id="tools"><div className="section-heading"><div><span className="eyebrow">TOOLBOX</span><h2>选一个工具开始</h2></div><p>持续收录开发与日常工作中真正好用的小工具。</p></div><div className="tool-grid">{tools.map((tool) => { const Icon = tool.icon; return <button className={`tool-card ${tool.available ? 'available' : 'disabled'}`} type="button" key={tool.id} onClick={() => openTool(tool.id)} disabled={!tool.available}><span className="tool-icon"><Icon size={22} /></span><span className="tool-card-content"><strong>{tool.name}</strong><small>{tool.description}</small></span>{tool.available ? <ChevronRight className="tool-arrow" size={20} /> : <span className="soon">即将推出</span>}</button> })}</div></section>

          <section className="values" id="about"><div><span className="value-icon"><LockKeyhole size={20} /></span><h3>隐私优先</h3><p>处理过程留在你的设备中，数据无需上传。</p></div><div><span className="value-icon"><Code2 size={20} /></span><h3>轻巧直接</h3><p>打开即用，减少不必要的配置与等待。</p></div><div><span className="value-icon"><Box size={20} /></span><h3>持续扩展</h3><p>围绕实际需求，逐步加入更多实用工具。</p></div></section>
        </>}
      </main>
      <footer><span>© 2026 Lstar Tools</span><span>Built for focused work.</span></footer>
    </div>
  )
}

export default App
