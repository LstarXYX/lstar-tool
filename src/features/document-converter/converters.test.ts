import { describe, expect, it } from 'vitest'
import { documentConversions } from './converters'

describe('document conversion registry', () => {
  it('keeps Markdown and Word conversion routes discoverable', () => {
    expect(documentConversions.map((conversion) => conversion.id)).toEqual([
      'markdown-docx',
      'markdown-pdf',
      'markdown-html',
      'docx-markdown',
      'docx-pdf',
    ])
  })

  it('only exposes an executable handler for available routes', () => {
    for (const conversion of documentConversions) {
      expect(Boolean(conversion.run)).toBe(conversion.available)
    }
  })

  it('converts a Markdown file into a DOCX blob', async () => {
    const conversion = documentConversions.find((item) => item.id === 'markdown-docx')
    const result = await conversion?.run?.(new File(['# 标题\n\n- 第一项'], 'example.md', { type: 'text/markdown' }))

    expect(result?.filename).toBe('lstar-converted.docx')
    expect(result?.blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    expect(result?.blob.size).toBeGreaterThan(0)
  })
})
