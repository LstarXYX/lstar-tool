import { describe, expect, it } from 'vitest'
import { colorFormats, parseColor } from './utils'

describe('parseColor', () => {
  it('parses shorthand and alpha HEX', () => {
    expect(parseColor('#0f8c')).toEqual({ r: 0, g: 255, b: 136, a: 0.8 })
  })

  it('parses RGB percentages and CSS alpha syntax', () => {
    expect(parseColor('rgb(100% 50% 0% / 25%)')).toEqual({ r: 255, g: 127, b: 0, a: 0.25 })
  })

  it('parses HSL, HSV and HWB inputs', () => {
    expect(parseColor('hsl(120 100% 50%)')).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(parseColor('hsv(240 100% 100% / .5)')).toEqual({ r: 0, g: 0, b: 255, a: 0.5 })
    expect(parseColor('hwb(0 0% 0%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('rejects unsupported or incomplete values', () => {
    expect(parseColor('rgb(12, 22)')).toBeNull()
    expect(parseColor('rgb(300 0 0)')).toBeNull()
    expect(parseColor('blue')).toBeNull()
  })
})

describe('colorFormats', () => {
  it('keeps alpha across formatted values', () => {
    expect(colorFormats({ r: 255, g: 0, b: 0, a: 0.5 })).toMatchObject({ hex: '#FF000080', rgb: 'rgb(255 0 0 / 0.5)', hsl: 'hsl(0 100% 50% / 0.5)' })
  })
})
