export type RectBox = {
  type: 'rect'
  box: [number, number, number, number]
}

export type Point = {
  x: number
  y: number
}

export const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum)

/**
 * Coordinates are always stored in original-image pixels. `type` is kept as a
 * discriminant so circle, polygon, segmentation, and mask shapes can be added
 * later without changing existing rectangle records.
 */
export const createRectBox = (start: Point, end: Point, width: number, height: number): RectBox | null => {
  const startX = clamp(start.x, 0, width)
  const startY = clamp(start.y, 0, height)
  const endX = clamp(end.x, 0, width)
  const endY = clamp(end.y, 0, height)
  const x1 = Math.round(Math.min(startX, endX))
  const y1 = Math.round(Math.min(startY, endY))
  const x2 = Math.round(Math.max(startX, endX))
  const y2 = Math.round(Math.max(startY, endY))

  if (x1 === x2 || y1 === y2) return null
  return { type: 'rect', box: [x1, y1, x2, y2] }
}

export const rectToStyle = ({ box }: RectBox) => {
  const [x1, y1, x2, y2] = box
  return { left: x1, top: y1, width: x2 - x1, height: y2 - y1 }
}

export const formatBoxes = (boxes: RectBox[]) => JSON.stringify(boxes, null, 2)
