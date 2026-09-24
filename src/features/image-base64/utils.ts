export const getBase64Payload = (value: string) => {
  const trimmed = value.trim().replace(/\s/g, '')
  const match = trimmed.match(/^data:([^;,]+);base64,(.*)$/i)

  if (match) {
    return { mimeType: match[1], payload: match[2] }
  }

  return { mimeType: 'image/jpeg', payload: trimmed }
}

export const isValidBase64 = (value: string) => {
  if (!value || value.length % 4 === 1) return false
  try {
    window.atob(value)
    return true
  } catch {
    return false
  }
}

export const base64ToDataUrl = (value: string) => {
  const { mimeType, payload } = getBase64Payload(value)
  return { dataUrl: `data:${mimeType};base64,${payload}`, mimeType, payload }
}

export const base64ToBlob = (payload: string, mimeType: string) => {
  const binary = window.atob(payload)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new Blob([bytes], { type: mimeType })
}
