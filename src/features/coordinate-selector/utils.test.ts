import { describe, expect, it } from 'vitest'
import { createRectBox, formatBoxes } from './utils'

describe('createRectBox', () => {
  it('normalizes reverse drags into original-image coordinates', () => {
    expect(createRectBox({ x: 80.4, y: 65.5 }, { x: 10.2, y: 20.4 }, 100, 100)).toEqual({ type: 'rect', box: [10, 20, 80, 66] })
  })

  it('clamps coordinates to the image boundary', () => {
    expect(createRectBox({ x: -20, y: 70 }, { x: 150, y: 110 }, 120, 90)).toEqual({ type: 'rect', box: [0, 70, 120, 90] })
  })

  it('ignores boxes without an area', () => {
    expect(createRectBox({ x: 20, y: 30 }, { x: 20, y: 60 }, 100, 100)).toBeNull()
  })
})

describe('formatBoxes', () => {
  it('exports the requested rectangle format', () => {
    expect(formatBoxes([{ type: 'rect', box: [1, 2, 30, 40] }])).toBe('[\n  {\n    "type": "rect",\n    "box": [\n      1,\n      2,\n      30,\n      40\n    ]\n  }\n]')
  })
})
