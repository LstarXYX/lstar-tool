import type { LucideIcon } from 'lucide-react'
import { Image, Braces, QrCode, Palette } from 'lucide-react'

export type ToolDefinition = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  available: boolean
}

export const tools: ToolDefinition[] = [
  {
    id: 'image-base64',
    name: '图片 / Base64',
    description: '在图片和 Base64 文本之间快速转换',
    icon: Image,
    available: true,
  },
  { id: 'json', name: 'JSON 格式化', description: '整理、校验和美化 JSON 数据', icon: Braces, available: false },
  { id: 'qrcode', name: '二维码工具', description: '生成及解析常用二维码', icon: QrCode, available: false },
  { id: 'color', name: '颜色转换', description: '在 HEX、RGB 与 HSL 间切换', icon: Palette, available: false },
]
