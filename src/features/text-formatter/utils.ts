/** Escapes common text characters for use inside a quoted string. */
export const escapeText = (value: string) => value
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\r\n|\r|\n/g, '\\n')
  .replace(/\t/g, '\\t')

/** Restores the text escapes produced by escapeText and preserves unknown escapes. */
export const restoreTextEscapes = (value: string) => value.replace(/\\(["\\nrt])/g, (_match, character: string) => {
  const characters: Record<string, string> = { '"': '"', '\\': '\\', n: '\n', r: '\r', t: '\t' }
  return characters[character]
})
