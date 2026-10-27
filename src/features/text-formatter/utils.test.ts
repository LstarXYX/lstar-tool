import { describe, expect, it } from 'vitest'
import { escapeLineBreaks, restoreLineBreaks } from './utils'

describe('文本换行格式化', () => {
  it('converts all common physical line endings to visible newline escapes', () => {
    expect(escapeLineBreaks('第一行\r\n第二行\n第三行\r第四行')).toBe('第一行\\n第二行\\n第三行\\n第四行')
  })

  it('keeps existing newline escape text unchanged', () => {
    expect(escapeLineBreaks('已有\\n文本\n下一行')).toBe('已有\\n文本\\n下一行')
  })

  it('restores newline escapes while leaving other escapes intact', () => {
    expect(restoreLineBreaks('第一行\\r\\n第二行\\n第三行\\t缩进')).toBe('第一行\n第二行\n第三行\\t缩进')
  })
})
