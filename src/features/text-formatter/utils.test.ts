import { describe, expect, it } from 'vitest'
import { escapeText, restoreTextEscapes } from './utils'

describe('文本转义格式化', () => {
  it('escapes quotes, backslashes, tabs and all common physical line endings', () => {
    expect(escapeText('"名称"\\路径\r\n第二行\n第三行\r第四行\t缩进')).toBe('\\"名称\\"\\\\路径\\n第二行\\n第三行\\n第四行\\t缩进')
  })

  it('escapes existing backslash sequences instead of treating them as control characters', () => {
    expect(escapeText('已有\\n文本\n下一行')).toBe('已有\\\\n文本\\n下一行')
  })

  it('restores supported escapes and leaves unknown escapes intact', () => {
    expect(restoreTextEscapes('\\"名称\\"\\\\路径\\n下一行\\t缩进\\q')).toBe('"名称"\\路径\n下一行\t缩进\\q')
  })
})
