export type RgbaColor = { r: number; g: number; b: number; a: number }

const round = (value: number, digits = 0) => Number(value.toFixed(digits))
const wrapHue = (value: number) => ((value % 360) + 360) % 360
const formatAlpha = (alpha: number) => String(round(alpha, 2))

const parseNumber = (value: string, max: number) => {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 && number <= max ? number : null
}

const parseAlpha = (value?: string) => {
  if (value === undefined) return 1
  const trimmed = value.trim()
  if (trimmed.endsWith('%')) {
    const percentage = parseNumber(trimmed.slice(0, -1), 100)
    return percentage === null ? null : percentage / 100
  }
  return parseNumber(trimmed, 1)
}

const splitArguments = (content: string) => content.trim().replace(/\s*\/\s*/g, ' / ').split(/[\s,]+/).filter(Boolean)

const hueFromToken = (token: string) => {
  const value = Number.parseFloat(token)
  if (!Number.isFinite(value)) return null
  if (token.endsWith('turn')) return wrapHue(value * 360)
  if (token.endsWith('rad')) return wrapHue(value * (180 / Math.PI))
  if (token.endsWith('grad')) return wrapHue(value * 0.9)
  return wrapHue(value)
}

const hueToRgb = (hue: number, chroma: number, match: number) => {
  const segment = hue / 60
  const x = chroma * (1 - Math.abs((segment % 2) - 1))
  const [red, green, blue] = segment < 1 ? [chroma, x, 0] : segment < 2 ? [x, chroma, 0] : segment < 3 ? [0, chroma, x] : segment < 4 ? [0, x, chroma] : segment < 5 ? [x, 0, chroma] : [chroma, 0, x]
  return { r: round((red + match) * 255), g: round((green + match) * 255), b: round((blue + match) * 255) }
}

const hslToRgb = (hue: number, saturation: number, lightness: number) => {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  return hueToRgb(hue, chroma, lightness - chroma / 2)
}

const hsvToRgb = (hue: number, saturation: number, value: number) => hueToRgb(hue, value * saturation, value - value * saturation)

const parseHex = (input: string): RgbaColor | null => {
  const match = input.trim().match(/^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i)
  if (!match) return null
  const raw = match[1]
  const expanded = raw.length <= 4 ? raw.split('').map((part) => `${part}${part}`).join('') : raw
  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
    a: expanded.length === 8 ? round(Number.parseInt(expanded.slice(6, 8), 16) / 255, 2) : 1,
  }
}

const parseRgb = (input: string): RgbaColor | null => {
  const match = input.trim().match(/^rgba?\((.*)\)$/i)
  if (!match) return null
  const parts = splitArguments(match[1])
  const slashIndex = parts.indexOf('/')
  const channels = slashIndex === -1 ? parts : parts.slice(0, slashIndex)
  const alpha = slashIndex === -1 ? parts[3] : parts[slashIndex + 1]
  if (channels.length !== 3) return null
  const values = channels.map((part) => {
    const channel = part.endsWith('%') ? parseNumber(part.slice(0, -1), 100) : parseNumber(part, 255)
    if (channel === null) return Number.NaN
    return part.endsWith('%') ? channel * 2.55 : channel
  })
  const opacity = parseAlpha(alpha)
  return values.some((value) => !Number.isFinite(value)) || opacity === null ? null : { r: round(values[0]), g: round(values[1]), b: round(values[2]), a: opacity }
}

const parseHslOrHsv = (input: string): RgbaColor | null => {
  const match = input.trim().match(/^(hsl|hsla|hsv|hsva)\((.*)\)$/i)
  if (!match) return null
  const parts = splitArguments(match[2])
  const slashIndex = parts.indexOf('/')
  const values = slashIndex === -1 ? parts.slice(0, 3) : parts.slice(0, slashIndex)
  const alpha = slashIndex === -1 ? parts[3] : parts[slashIndex + 1]
  if (values.length !== 3) return null
  const hue = hueFromToken(values[0])
  const saturation = values[1].endsWith('%') ? parseNumber(values[1].slice(0, -1), 100) : null
  const amount = values[2].endsWith('%') ? parseNumber(values[2].slice(0, -1), 100) : null
  const opacity = parseAlpha(alpha)
  if (hue === null || saturation === null || amount === null || opacity === null) return null
  return { ...(match[1].toLowerCase().startsWith('hsv') ? hsvToRgb(hue, saturation / 100, amount / 100) : hslToRgb(hue, saturation / 100, amount / 100)), a: opacity }
}

const parseHwb = (input: string): RgbaColor | null => {
  const match = input.trim().match(/^hwb\((.*)\)$/i)
  if (!match) return null
  const parts = splitArguments(match[1])
  const slashIndex = parts.indexOf('/')
  const values = slashIndex === -1 ? parts.slice(0, 3) : parts.slice(0, slashIndex)
  const alpha = slashIndex === -1 ? parts[3] : parts[slashIndex + 1]
  if (values.length !== 3 || !values[1].endsWith('%') || !values[2].endsWith('%')) return null
  const hue = hueFromToken(values[0])
  const whiteness = parseNumber(values[1].slice(0, -1), 100)
  const blackness = parseNumber(values[2].slice(0, -1), 100)
  const opacity = parseAlpha(alpha)
  if (hue === null || whiteness === null || blackness === null || opacity === null) return null
  const sum = whiteness + blackness
  if (sum >= 100) {
    const grey = round((whiteness / sum) * 255)
    return { r: grey, g: grey, b: grey, a: opacity }
  }
  const base = hsvToRgb(hue, 1, 1)
  const factor = 1 - whiteness / 100 - blackness / 100
  return { r: round(base.r * factor + whiteness * 2.55), g: round(base.g * factor + whiteness * 2.55), b: round(base.b * factor + whiteness * 2.55), a: opacity }
}

export const parseColor = (input: string): RgbaColor | null => parseHex(input) ?? parseRgb(input) ?? parseHslOrHsv(input) ?? parseHwb(input)

const rgbToHsv = ({ r, g, b }: RgbaColor) => {
  const red = r / 255
  const green = g / 255
  const blue = b / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const hue = delta === 0 ? 0 : max === red ? 60 * (((green - blue) / delta) % 6) : max === green ? 60 * ((blue - red) / delta + 2) : 60 * ((red - green) / delta + 4)
  return { h: round(wrapHue(hue)), s: round(max === 0 ? 0 : (delta / max) * 100), v: round(max * 100), max, min, delta }
}

export const colorFormats = (color: RgbaColor) => {
  const { h, s, v, max, min, delta } = rgbToHsv(color)
  const lightness = (max + min) / 2
  const hslSaturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  const whiteness = min * 100
  const blackness = (1 - max) * 100
  const alphaSuffix = color.a < 1 ? ` / ${formatAlpha(color.a)}` : ''
  const hexAlpha = color.a < 1 ? Math.round(color.a * 255).toString(16).padStart(2, '0').toUpperCase() : ''
  return {
    hex: `#${color.r.toString(16).padStart(2, '0').toUpperCase()}${color.g.toString(16).padStart(2, '0').toUpperCase()}${color.b.toString(16).padStart(2, '0').toUpperCase()}${hexAlpha}`,
    rgb: `rgb(${color.r} ${color.g} ${color.b}${alphaSuffix})`,
    hsl: `hsl(${h} ${round(hslSaturation * 100)}% ${round(lightness * 100)}%${alphaSuffix})`,
    hsv: `hsv(${h} ${s}% ${v}%${alphaSuffix})`,
    hwb: `hwb(${h} ${round(whiteness)}% ${round(blackness)}%${alphaSuffix})`,
  }
}

export const toOpaqueHex = (color: RgbaColor) => colorFormats({ ...color, a: 1 }).hex
