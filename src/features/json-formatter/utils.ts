export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

export const parseJson = (text: string): JsonValue => JSON.parse(text) as JsonValue
export const formatJson = (text: string) => JSON.stringify(parseJson(text), null, 2)
export const compactJson = (text: string) => JSON.stringify(parseJson(text))
export const escapeJsonText = (text: string) => JSON.stringify(text)

export const unescapeJsonText = (text: string) => {
  const value = JSON.parse(text)
  if (typeof value !== 'string') throw new Error('请输入一个已转义的 JSON 字符串。')
  return value
}

export const updateAtPath = (value: JsonValue, path: (string | number)[], nextValue: JsonValue): JsonValue => {
  if (path.length === 0) return nextValue
  const [key, ...rest] = path
  if (Array.isArray(value)) return value.map((item, index) => index === key ? updateAtPath(item, rest, nextValue) : item)
  if (value === null || typeof value !== 'object') return value
  const objectKey = String(key)
  return { ...value, [objectKey]: updateAtPath(value[objectKey] ?? null, rest, nextValue) }
}

export const parseEditedValue = (text: string, previous: JsonValue): JsonValue => {
  if (typeof previous === 'string') return text
  try { return JSON.parse(text) as JsonValue } catch { return text }
}

export const getContainerPaths = (value: JsonValue, path: (string | number)[] = []): string[] => {
  if (value === null || typeof value !== 'object') return []
  const ownPath = path.join('.')
  const children = Object.entries(value).flatMap(([key, child]) => getContainerPaths(child, [...path, Array.isArray(value) ? Number(key) : key]))
  return [ownPath, ...children]
}
