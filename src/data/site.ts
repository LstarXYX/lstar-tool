import { siteUrl } from './siteConfig'

export { siteUrl }

export type PageMetadata = {
  title: string
  description: string
  keywords: string
  canonical: string
  structuredData: Record<string, unknown>
}

const organization = {
  '@type': 'Organization',
  name: 'Lstar Tools',
  url: siteUrl,
}

const applicationSchema = (name: string, url: string, description: string, featureList: string[]) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name,
  url,
  description,
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  inLanguage: 'zh-CN',
  isAccessibleForFree: true,
  featureList,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY',
  },
  publisher: organization,
})

export const pageMetadata = {
  home: {
    title: 'Lstar Tools · 轻巧的开发工具箱',
    description: 'Lstar Tools 是一组为开发者打造的轻量在线工具，隐私优先，数据不上传，打开即用。',
    keywords: '开发者工具,在线工具,隐私优先,轻量工具,Lstar Tools',
    canonical: siteUrl,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Lstar Tools',
      url: siteUrl,
      description: '为开发者打造的轻量在线工具箱，所有处理均在浏览器本地完成。',
      inLanguage: 'zh-CN',
      publisher: organization,
    },
  },
  toolbox: {
    title: '开发者工具箱 · Lstar Tools',
    description: '浏览 Lstar Tools 的本地在线工具：图片 OCR、Markdown 与 Word 转换、图片与 Base64 互转、二维码、颜色转换、JSON 格式化等。',
    keywords: '开发者工具箱,在线工具,图片OCR,PaddleOCR,Markdown转Word,Word转Markdown,二维码生成,颜色转换,JSON格式化',
    canonical: `${siteUrl}tools/`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Lstar Tools 开发者工具箱',
      url: `${siteUrl}tools/`,
      description: '隐私优先、在浏览器本地运行的开发工具集合。',
      inLanguage: 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: 'Lstar Tools', url: siteUrl },
    },
  },
  'image-base64': {
    title: '图片与 Base64 互转 · Lstar Tools',
    description: '免费的在线图片与 Base64 互转工具。图片和 Base64 均在浏览器本地处理，支持预览、复制和下载。',
    keywords: '图片转Base64,Base64转图片,在线Base64工具,图片编码',
    canonical: `${siteUrl}tools/image-base64/`,
    structuredData: applicationSchema('图片与 Base64 互转 · Lstar Tools', `${siteUrl}tools/image-base64/`, '在浏览器本地将图片转换为 Base64，或将 Base64 转换为图片。', ['图片转 Base64', 'Base64 转图片', '本地处理', '预览与下载']),
  },
  json: {
    title: 'JSON 格式化与结构编辑 · Lstar Tools',
    description: '免费的在线 JSON 格式化、压缩、转义和结构化编辑工具，在浏览器本地完成所有处理。',
    keywords: 'JSON格式化,JSON在线解析,JSON压缩,JSON转义,JSON编辑器',
    canonical: `${siteUrl}tools/json-formatter/`,
    structuredData: applicationSchema('JSON 格式化与结构编辑 · Lstar Tools', `${siteUrl}tools/json-formatter/`, '在浏览器本地格式化、压缩、转义和结构化编辑 JSON。', ['JSON 格式化', 'JSON 压缩', 'JSON 转义', '树状结构编辑']),
  },
  'url-codec': {
    title: 'URL 编码解码 · Lstar Tools',
    description: '免费的在线 URL 编码解码工具，支持中文、查询参数和特殊字符，在浏览器本地完成处理。',
    keywords: 'URL编码,URL解码,在线URL编码,百分号编码,query参数编码',
    canonical: `${siteUrl}tools/url-codec/`,
    structuredData: applicationSchema('URL 编码解码 · Lstar Tools', `${siteUrl}tools/url-codec/`, '在浏览器本地快速编码或还原 URL、查询参数和文本。', ['URL 编码', 'URL 解码', '查询参数处理', '中文与特殊字符支持']),
  },
  md5: {
    title: 'MD5 加密 · Lstar Tools',
    description: '免费的在线 MD5 加密工具，可生成大写、小写、32 位和 16 位摘要，并支持一键复制。',
    keywords: 'MD5加密,MD5在线加密,32位MD5,16位MD5,MD5大写',
    canonical: `${siteUrl}tools/md5/`,
    structuredData: applicationSchema('MD5 加密 · Lstar Tools', `${siteUrl}tools/md5/`, '在浏览器本地生成 32 位、16 位及大小写 MD5 摘要。', ['MD5 摘要', '32 位 MD5', '16 位 MD5', '一键复制']),
  },
  timestamp: {
    title: '时间戳转换 · Lstar Tools',
    description: '免费的在线时间戳转换工具，支持秒级和毫秒级时间戳与年月日时分秒双向转换，多种日期格式一键复制。',
    keywords: '时间戳转换,Unix时间戳,秒级时间戳,毫秒级时间戳,日期转时间戳',
    canonical: `${siteUrl}tools/timestamp/`,
    structuredData: applicationSchema('时间戳转换 · Lstar Tools', `${siteUrl}tools/timestamp/`, '在浏览器本地转换秒级、毫秒级时间戳与日期时间。', ['秒级时间戳', '毫秒级时间戳', '日期转时间戳', '多格式日期复制']),
  },
  qrcode: {
    title: '二维码生成工具 · Lstar Tools',
    description: '免费的在线二维码生成工具，可为文字、网址、公开图片或视频链接生成并下载 PNG 二维码，所有内容均在浏览器本地处理。',
    keywords: '二维码生成,二维码在线生成,文字二维码,链接二维码,图片二维码,视频二维码',
    canonical: `${siteUrl}tools/qrcode/`,
    structuredData: applicationSchema('二维码生成工具 · Lstar Tools', `${siteUrl}tools/qrcode/`, '在浏览器本地为文字、网址和公开媒体链接生成二维码。', ['文字二维码', '网址二维码', '图片链接二维码', '视频链接二维码', 'PNG 下载']),
  },
  color: {
    title: '颜色取色与转换 · Lstar Tools',
    description: '免费的在线取色与颜色转换工具，支持 HEX、RGB、HSL、HSV、HWB 与透明度，修改任一种格式即可同步转换。',
    keywords: '颜色转换,在线取色,HEX转RGB,RGB转HSL,HSV转换,HWB转换',
    canonical: `${siteUrl}tools/color/`,
    structuredData: applicationSchema('颜色取色与转换 · Lstar Tools', `${siteUrl}tools/color/`, '在浏览器本地取色，并同步转换 HEX、RGB、HSL、HSV、HWB 颜色代码。', ['系统取色盘', 'HEX 与 HEXA', 'RGB 与 HSL', 'HSV 与 HWB', '透明度保留']),
  },
  ocr: {
    title: '图片 OCR 文字识别 · Lstar Tools',
    description: '免费的在线图片 OCR 识别工具，基于 PaddleOCR 和 WebAssembly 在浏览器本地提取图片中的中英文文字，支持极速与标准模式。',
    keywords: '图片OCR,在线文字识别,PaddleOCR,图片转文字,OCR识别,WASM OCR',
    canonical: `${siteUrl}tools/ocr/`,
    structuredData: applicationSchema('图片 OCR 文字识别 · Lstar Tools', `${siteUrl}tools/ocr/`, '基于 PaddleOCR 与 WebAssembly，在浏览器本地识别图片中的文字。', ['PP-OCRv6 Tiny 极速模式', 'PP-OCRv5 标准模式', '中英文识别', '浏览器本地处理']),
  },
  'document-converter': {
    title: 'Markdown 与 Word 文件转换 · Lstar Tools',
    description: '免费的在线 Markdown 与 Word 文档转换工具，支持 Markdown 转 Word、Word 转 Markdown，并预留 PDF 等更多格式。',
    keywords: 'Markdown转Word,Word转Markdown,文件转换,MD转DOCX,DOCX转MD,在线文档转换',
    canonical: `${siteUrl}tools/document-converter/`,
    structuredData: applicationSchema('Markdown 与 Word 文件转换 · Lstar Tools', `${siteUrl}tools/document-converter/`, '在浏览器本地转换 Markdown 和 Word 文档，后续支持更多格式。', ['Markdown 转 Word', 'Word 转 Markdown', '本地文件处理', 'PDF 转换接口预留']),
  },
} satisfies Record<string, PageMetadata>
