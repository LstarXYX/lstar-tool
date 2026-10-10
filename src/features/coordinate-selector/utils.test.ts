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
  it('exports names, name-based IDs, and bounding boxes', () => {
    expect(formatBoxes([{ type: 'rect', name: 'person', box: [1, 2, 30, 40] }, { type: 'rect', name: 'person', box: [50, 60, 70, 80] }, { type: 'rect', name: 'car', box: [3, 4, 5, 6] }])).toBe('[\n  {\n    "type": "rect",\n    "name": "person",\n    "id": "person_1",\n    "bbox": [\n      1,\n      2,\n      30,\n      40\n    ]\n  },\n  {\n    "type": "rect",\n    "name": "person",\n    "id": "person_2",\n    "bbox": [\n      50,\n      60,\n      70,\n      80\n    ]\n  },\n  {\n    "type": "rect",\n    "name": "car",\n    "id": "car_1",\n    "bbox": [\n      3,\n      4,\n      5,\n      6\n    ]\n  }\n]')
  })

  it('uses object when a name is empty', () => {
    expect(formatBoxes([{ type: 'rect', name: '  ', box: [1, 2, 3, 4] }])).toContain('"id": "object_1"')
  })
})
