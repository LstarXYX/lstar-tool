import type { LucideIcon } from 'lucide-react'
import { Image, Braces, QrCode, Palette, Link2, Fingerprint, Clock3 } from 'lucide-react'

export type ToolDefinition = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: '图片处理' | '编码/解码' | '开发辅助' | '效率工具'
  available: boolean
}

export const tools: ToolDefinition[] = [
  {
    id: 'image-base64',
    name: '图片 / Base64',
    description: '在图片和 Base64 文本之间快速转换',
    icon: Image,
    category: '图片处理',
    available: true,
  },
  { id: 'json', name: 'JSON 格式化', description: '整理、校验、编辑与查看 JSON 结构', icon: Braces, category: '开发辅助', available: true },
  { id: 'url-codec', name: 'URL 编码解码', description: '快速编码或还原 URL 与查询参数文本', icon: Link2, category: '编码/解码', available: true },
  { id: 'md5', name: 'MD5 加密', description: '生成 32 位、16 位及大小写 MD5 摘要', icon: Fingerprint, category: '编码/解码', available: true },
  { id: 'timestamp', name: '时间戳转换', description: '在时间戳与日期时间格式之间快速转换', icon: Clock3, category: '开发辅助', available: true },
  { id: 'qrcode', name: '二维码工具', description: '生成及解析常用二维码', icon: QrCode, category: '效率工具', available: false },
  { id: 'color', name: '颜色转换', description: '在 HEX、RGB 与 HSL 间切换', icon: Palette, category: '图片处理', available: false },
]
