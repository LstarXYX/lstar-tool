import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, History, KeyRound, RefreshCw, Save, Trash2 } from 'lucide-react'
import { characterGroups, createPasswords, getPasswordStrength, uniqueCharacters, type CharacterGroup } from './utils'

type SavedPassword = { id: string; value: string; savedAt: string }

const storageKey = 'lstar-tools:password-generator:saved'
const groups: { id: CharacterGroup; label: string; hint: string }[] = [
  { id: 'numbers', label: '数字', hint: '0–9' },
  { id: 'lowercase', label: '小写字母', hint: 'a–z' },
  { id: 'uppercase', label: '大写字母', hint: 'A–Z' },
  { id: 'symbols', label: '特殊符号', hint: '~!@#$…' },
]
const defaultCharacters = Object.values(characterGroups).join('')

const readSavedPasswords = (): SavedPassword[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(stored) ? stored.filter((item): item is SavedPassword => typeof item?.id === 'string' && typeof item?.value === 'string' && typeof item?.savedAt === 'string') : []
  } catch { return [] }
}

const formatSavedAt = (value: string) => new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))

function StrengthBadge({ password }: { password: string }) {
  const strength = getPasswordStrength(password)
  return <span className={`password-strength level-${strength.level}`} title={strength.description}><i aria-hidden="true"><b /><b /><b /><b /></i>{strength.label}</span>
}

export function PasswordGeneratorTool({ onBack }: { onBack: () => void }) {
  const [length, setLength] = useState(10)
  const [characters, setCharacters] = useState(defaultCharacters)
  const [selectedGroups, setSelectedGroups] = useState<CharacterGroup[]>(groups.map((group) => group.id))
  const [passwords, setPasswords] = useState<string[]>(() => createPasswords(10, defaultCharacters))
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>(readSavedPasswords)
  const [copied, setCopied] = useState('')
  const [message, setMessage] = useState('')

  const characterCount = useMemo(() => Array.from(uniqueCharacters(characters)).length, [characters])

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(savedPasswords)) }, [savedPasswords])

  const generate = () => {
    try {
      setPasswords(createPasswords(length, characters))
      setMessage('')
    } catch (error) { setMessage(error instanceof Error ? error.message : '生成失败，请检查设置。') }
  }

  const toggleGroup = (groupId: CharacterGroup) => {
    const groupCharacters = characterGroups[groupId]
    const isSelected = selectedGroups.includes(groupId)
    setSelectedGroups((current) => isSelected ? current.filter((item) => item !== groupId) : [...current, groupId])
    setCharacters((current) => isSelected
      ? Array.from(current).filter((character) => !groupCharacters.includes(character)).join('')
      : uniqueCharacters(`${current}${groupCharacters}`))
  }

  const copy = async (password: string, id: string) => {
    try { await navigator.clipboard.writeText(password); setCopied(id); window.setTimeout(() => setCopied(''), 1500) } catch { setMessage('复制失败，请手动复制密码。') }
  }

  const save = (password: string) => {
    setSavedPasswords((current) => [{ id: crypto.randomUUID(), value: password, savedAt: new Date().toISOString() }, ...current])
    setMessage('已保存到当前浏览器。')
  }

  const clearSaved = () => setSavedPasswords([])

  return <section className="password-workspace" aria-label="随机密码生成器">
    <div className="tool-intro"><div><button className="back-button" type="button" onClick={onBack}>← 返回工具箱</button><span className="eyebrow">PASSWORD GENERATOR</span><h1>随机密码生成器</h1><p>按你的字符池生成 10 个随机密码。保存记录仅留在当前浏览器，清除浏览器缓存后会消失。</p></div><button className="text-button" type="button" onClick={generate}><RefreshCw size={16} />重新生成</button></div>
    <div className="password-layout">
      <article className="password-settings-card"><div className="simple-tool-heading"><span className="step-number">01</span><div><h2>设置字符</h2><p>默认启用全部类别，也可以直接修改下方字符池。</p></div></div>
        <label className="password-length-label" htmlFor="password-length"><span>密码长度</span><input id="password-length" className="tool-input" type="number" min="1" max="256" value={length} onChange={(event) => setLength(Math.min(256, Math.max(1, Number(event.target.value) || 1)))} /></label>
        <fieldset className="password-group-list"><legend>快速选择</legend>{groups.map((group) => <label key={group.id}><input type="checkbox" checked={selectedGroups.includes(group.id)} onChange={() => toggleGroup(group.id)} /><span><b>{group.label}</b><small>{group.hint}</small></span></label>)}</fieldset>
        <label className="password-characters-label" htmlFor="password-characters"><span>可选字符 <small>已去重 {characterCount} 个</small></span><textarea id="password-characters" value={characters} onChange={(event) => setCharacters(event.target.value)} spellCheck="false" aria-describedby="password-characters-hint" /></label>
        <p id="password-characters-hint" className="password-hint">可手动添加、删除任意字符；生成的密码只会从这里选择。</p>
        <button className="primary-button password-generate-button" type="button" onClick={generate}><KeyRound size={17} />生成 10 个密码</button>
        {message && <p className="simple-message" role="status">{message}</p>}
      </article>
      <article className="password-results-card"><div className="simple-tool-heading"><span className="step-number">02</span><div><h2>可选密码</h2><p>复制后可直接使用，或保存到本机浏览器。</p></div></div><div className="password-results">{passwords.map((password, index) => <div className="password-result" key={`${password}-${index}`}><div className="password-result-value"><code>{password}</code><StrengthBadge password={password} /></div><div><button type="button" aria-label={`复制密码 ${index + 1}`} onClick={() => copy(password, `result-${index}`)}>{copied === `result-${index}` ? <Check size={16} /> : <Clipboard size={16} />}</button><button type="button" aria-label={`保存密码 ${index + 1}`} onClick={() => save(password)}><Save size={16} /></button></div></div>)}</div></article>
    </div>
    <section className="password-history" aria-label="已保存密码"><div className="password-history-heading"><div><History size={18} /><div><h2>已保存密码</h2><p>仅保存在此浏览器的本地存储中。</p></div></div>{savedPasswords.length > 0 && <button className="text-button" type="button" onClick={clearSaved}><Trash2 size={16} />清空记录</button>}</div>{savedPasswords.length ? <div className="saved-password-list">{savedPasswords.map((item) => <div className="saved-password" key={item.id}><div><code>{item.value}</code><div className="saved-password-meta"><StrengthBadge password={item.value} /><time dateTime={item.savedAt}>保存于 {formatSavedAt(item.savedAt)}</time></div></div><div><button type="button" aria-label="复制已保存密码" onClick={() => copy(item.value, item.id)}>{copied === item.id ? <Check size={16} /> : <Clipboard size={16} />}</button><button type="button" aria-label="删除已保存密码" onClick={() => setSavedPasswords((current) => current.filter((saved) => saved.id !== item.id))}><Trash2 size={16} /></button></div></div>)}</div> : <div className="password-history-empty"><History size={30} /><p>暂未保存密码。点击候选密码右侧的保存图标即可在这里查看。</p></div>}</section>
    <section className="tool-seo-content"><h2>在线随机密码生成器</h2><p>设置长度和可选字符后，一次生成 10 个随机密码。可直接编辑字符池，适合匹配不同网站或系统的密码规则。</p><h2>常见问题</h2><div className="faq-grid"><article><h3>密码会上传吗？</h3><p>不会。生成、复制和保存均在当前浏览器本地完成，本站不会接收密码。</p></article><article><h3>保存记录会一直保留吗？</h3><p>记录仅写入浏览器本地存储；清除浏览器缓存或本地网站数据后，记录会消失。</p></article><article><h3>如何生成更强的密码？</h3><p>建议增加密码长度，并同时使用数字、大小写字母和特殊符号。</p></article></div></section>
  </section>
}
