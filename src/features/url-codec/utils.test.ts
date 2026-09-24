import { describe, expect, it } from 'vitest'
import { decodeUrlText, encodeUrlText } from './utils'

describe('URL 编码解码', () => {
  it('encodes Chinese text and query separators', () => {
    expect(encodeUrlText('搜索 你好&x=1')).toBe('%E6%90%9C%E7%B4%A2%20%E4%BD%A0%E5%A5%BD%26x%3D1')
  })

  it('decodes form-style plus signs', () => {
    expect(decodeUrlText('%E4%BD%A0%E5%A5%BD+Lstar')).toBe('你好 Lstar')
  })

  it('rejects malformed escapes', () => {
    expect(() => decodeUrlText('%E4%ZZ')).toThrow('URL 编码内容无效')
  })
})
