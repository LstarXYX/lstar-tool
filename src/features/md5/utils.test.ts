import { describe, expect, it } from 'vitest'
import { getMd5Variants, Md5Hasher, md5, md5File } from './utils'

describe('md5', () => {
  it('creates the standard empty and ASCII digests', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e')
    expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592')
  })

  it('uses UTF-8 for Chinese text', () => {
    expect(md5('你好')).toBe('7eca689f0d3389d9dea66ae112e5cfd7')
  })

  it('returns all requested casing and lengths', () => {
    expect(getMd5Variants('hello')).toEqual({ lower32: '5d41402abc4b2a76b9719d911017c592', upper32: '5D41402ABC4B2A76B9719D911017C592', lower16: 'bc4b2a76b9719d91', upper16: 'BC4B2A76B9719D91' })
  })

  it('produces the same digest when data arrives in chunks', () => {
    const bytes = new TextEncoder().encode('The quick brown fox jumps over the lazy dog')
    const hasher = new Md5Hasher()
    hasher.update(bytes.subarray(0, 7)).update(bytes.subarray(7, 35)).update(bytes.subarray(35))
    expect(hasher.digest()).toBe('9e107d9d372bb6826bd81d3542a419d6')
  })

  it('calculates a file MD5 in chunks and reports progress', async () => {
    const progress: number[] = []
    const hash = await md5File(new Blob(['The quick brown fox jumps over the lazy dog']), (value) => progress.push(value), 9)
    expect(hash).toBe('9e107d9d372bb6826bd81d3542a419d6')
    expect(progress[progress.length - 1]).toBe(1)
  })
})
