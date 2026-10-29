export type RectBox = {
  type: 'rect'
  box: [number, number, number, number]
}

export type AnnotationBox = RectBox & {
  name: string
}

export type Point = {
  x: number
  y: number
}

export const clamp = (value: number, minimum: number, maximum: number) => Math.min(Math.max(value, minimum), maximum)
const hasAtMostTwoDecimalPlaces = (value: number) => Number.isFinite(value) && Math.abs(value * 100 - Math.round(value * 100)) < 1e-8

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

export const formatBoxes = (boxes: AnnotationBox[]) => {
  const names = new Map<string, number>()
  const annotations = boxes.map(({ type, name, box }) => {
    const normalizedName = name.trim() || 'object'
    const nextIndex = (names.get(normalizedName) ?? 0) + 1
    names.set(normalizedName, nextIndex)
    return { type, name: normalizedName, id: `${normalizedName}_${nextIndex}`, bbox: box }
  })
  return JSON.stringify(annotations, null, 2)
}

/** Parses the exported JSON back into drawable, original-image pixel boxes. */
export const parseBoxes = (value: string, imageWidth: number, imageHeight: number): AnnotationBox[] => {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error('数据不是有效的 JSON。')
  }

  if (!Array.isArray(parsed)) throw new Error('坐标数据需要是一个标注数组。')

  return parsed.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`第 ${index + 1} 项必须是标注对象。`)
    const annotation = item as Record<string, unknown>
    if (annotation.type !== undefined && annotation.type !== 'rect') throw new Error(`第 ${index + 1} 项仅支持 rect 矩形标注。`)
    if (annotation.name !== undefined && typeof annotation.name !== 'string') throw new Error(`第 ${index + 1} 项的 name 必须是文本。`)
    if (!Array.isArray(annotation.bbox) || annotation.bbox.length !== 4 || !annotation.bbox.every((coordinate) => typeof coordinate === 'number' && hasAtMostTwoDecimalPlaces(coordinate))) {
      throw new Error(`第 ${index + 1} 项的 bbox 必须是整数或最多两位小数。`)
    }

    const [x1, y1, x2, y2] = annotation.bbox as number[]
    if (x1 < 0 || y1 < 0 || x2 > imageWidth || y2 > imageHeight || x1 >= x2 || y1 >= y2) {
      throw new Error(`第 ${index + 1} 项的 bbox 必须位于图片内，且右下坐标大于左上坐标。`)
    }

    return { type: 'rect', name: annotation.name ?? 'object', box: [x1, y1, x2, y2] }
  })
}
