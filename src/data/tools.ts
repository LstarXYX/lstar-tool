import type { LucideIcon } from 'lucide-react'
import { Image, Braces, QrCode, Palette, Link2, Fingerprint, Clock3, ScanText, FileOutput, KeyRound, ScanLine } from 'lucide-react'

export type ToolDefinition = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  category: '图片处理' | '文件转换' | '编码/解码' | '开发辅助' | '效率工具'
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
  { id: 'coordinate-selector', name: '坐标框选', description: '在图片上框选多个矩形区域并复制原图坐标', icon: ScanLine, category: '图片处理', available: true },
  { id: 'json', name: 'JSON 格式化', description: '整理、校验、编辑与查看 JSON 结构', icon: Braces, category: '开发辅助', available: true },
  { id: 'url-codec', name: 'URL 编码解码', description: '快速编码或还原 URL 与查询参数文本', icon: Link2, category: '编码/解码', available: true },
  { id: 'md5', name: 'MD5 加密', description: '生成 32 位、16 位及大小写 MD5 摘要', icon: Fingerprint, category: '编码/解码', available: true },
  { id: 'timestamp', name: '时间戳转换', description: '在时间戳与日期时间格式之间快速转换', icon: Clock3, category: '开发辅助', available: true },
  { id: 'qrcode', name: '二维码工具', description: '为文字与公开媒体链接生成二维码', icon: QrCode, category: '效率工具', available: true },
  { id: 'color', name: '颜色转换', description: '取色并同步转换 HEX、RGB、HSL、HSV、HWB', icon: Palette, category: '图片处理', available: true },
  { id: 'ocr', name: '图片 OCR 识别', description: '基于 PaddleOCR WASM 在浏览器本地提取图片文字', icon: ScanText, category: '图片处理', available: true },
  { id: 'document-converter', name: 'Markdown / Word 转换', description: '在浏览器本地转换 Markdown 与 Word 文档', icon: FileOutput, category: '文件转换', available: true },
  { id: 'password-generator', name: '随机密码生成器', description: '自定义字符池，批量生成并本地保存密码', icon: KeyRound, category: '效率工具', available: true },
]
