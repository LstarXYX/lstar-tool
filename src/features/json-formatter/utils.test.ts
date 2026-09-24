import { describe, expect, it } from 'vitest'
import { compactJson, formatJson, parseEditedValue, unescapeJsonText, updateAtPath } from './utils'

describe('JSON formatter helpers', () => {
  it('formats and compacts valid JSON', () => {
    expect(formatJson('{"name":"Lstar","enabled":true}')).toContain('\n  "name"')
    expect(compactJson('{ "name": "Lstar" }')).toBe('{"name":"Lstar"}')
  })

  it('removes a JSON string escape layer', () => {
    expect(unescapeJsonText('"{\\n  \\"name\\": \\"Lstar\\"\\n}"')).toContain('"name"')
  })

  it('updates a nested tree value without changing siblings', () => {
    expect(updateAtPath({ name: 'old', meta: { version: 1 } }, ['meta', 'version'], 2)).toEqual({ name: 'old', meta: { version: 2 } })
    expect(parseEditedValue('new value', 'old')).toBe('new value')
  })
})
