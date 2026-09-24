export const encodeUrlText = (value: string) => encodeURIComponent(value)

export const decodeUrlText = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    throw new Error('URL 编码内容无效，请检查百分号后的字符。')
  }
}
