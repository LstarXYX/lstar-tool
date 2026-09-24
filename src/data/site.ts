export const siteUrl = 'https://lstarxyx.github.io/lstar-tool/'

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
    description: '浏览 Lstar Tools 的本地在线开发工具：图片与 Base64 互转、JSON 格式化、URL 编码解码、MD5 加密和时间戳转换。',
    keywords: '开发者工具箱,在线工具,JSON格式化,Base64转换,URL编码,MD5,时间戳转换',
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
} satisfies Record<string, PageMetadata>
