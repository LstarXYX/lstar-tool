import { describe, expect, it } from 'vitest'
import { dateToTimestamp, getDateFormats, timestampToDate } from './utils'

describe('时间戳转换', () => {
  it('accepts seconds and milliseconds', () => {
    expect(timestampToDate('0', 'seconds').getTime()).toBe(0)
    expect(timestampToDate('1234', 'milliseconds').getTime()).toBe(1234)
  })

  it('rejects invalid timestamps', () => {
    expect(() => timestampToDate('12.5', 'milliseconds')).toThrow('有效的整数')
  })

  it('converts an ISO date to the selected timestamp unit', () => {
    expect(dateToTimestamp('1970-01-01T00:00:01.500Z', 'milliseconds')).toBe(1500)
    expect(dateToTimestamp('1970-01-01T00:00:01.500Z', 'seconds')).toBe(1)
  })

  it('offers local date copy formats', () => {
    const formats = getDateFormats(new Date(0))
    expect(formats).toHaveLength(5)
    expect(formats[3][1]).toBe('1970-01-01T00:00:00.000Z')
  })
})
