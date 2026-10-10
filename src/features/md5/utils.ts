const shifts = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]
const constants = Array.from({ length: 64 }, (_, index) => Math.floor(Math.abs(Math.sin(index + 1)) * 0x100000000) >>> 0)

const rotateLeft = (value: number, amount: number) => (value << amount) | (value >>> (32 - amount))
const toLittleEndianHex = (value: number) => Array.from({ length: 4 }, (_, index) => ((value >>> (index * 8)) & 0xff).toString(16).padStart(2, '0')).join('')

export class Md5Hasher {
  private a = 0x67452301
  private b = 0xefcdab89
  private c = 0x98badcfe
  private d = 0x10325476
  private buffer = new Uint8Array(64)
  private bufferLength = 0
  private totalLength = 0

  update(input: Uint8Array) {
    this.totalLength += input.length
    let offset = 0
    if (this.bufferLength) {
      const amount = Math.min(64 - this.bufferLength, input.length)
      this.buffer.set(input.subarray(0, amount), this.bufferLength)
      this.bufferLength += amount
      offset += amount
      if (this.bufferLength === 64) { this.processBlock(this.buffer); this.bufferLength = 0 }
    }
    while (offset + 64 <= input.length) { this.processBlock(input.subarray(offset, offset + 64)); offset += 64 }
    if (offset < input.length) { this.buffer.set(input.subarray(offset)); this.bufferLength = input.length - offset }
    return this
  }

  digest() {
    const originalLength = this.totalLength
    this.buffer[this.bufferLength] = 0x80
    this.bufferLength += 1
    if (this.bufferLength > 56) {
      this.buffer.fill(0, this.bufferLength)
      this.processBlock(this.buffer)
      this.bufferLength = 0
    }
    this.buffer.fill(0, this.bufferLength, 56)
    const bitLength = originalLength * 8
    for (let index = 0; index < 8; index += 1) this.buffer[56 + index] = Math.floor(bitLength / 2 ** (8 * index)) & 0xff
    this.processBlock(this.buffer)
    return `${toLittleEndianHex(this.a)}${toLittleEndianHex(this.b)}${toLittleEndianHex(this.c)}${toLittleEndianHex(this.d)}`
  }

  private processBlock(bytes: Uint8Array) {
    const words = Array.from({ length: 16 }, (_, index) => bytes[index * 4] | (bytes[index * 4 + 1] << 8) | (bytes[index * 4 + 2] << 16) | (bytes[index * 4 + 3] << 24))
    let a = this.a; let b = this.b; let c = this.c; let d = this.d
    for (let index = 0; index < 64; index += 1) {
      let f: number; let g: number
      if (index < 16) { f = (b & c) | (~b & d); g = index }
      else if (index < 32) { f = (d & b) | (~d & c); g = (5 * index + 1) % 16 }
      else if (index < 48) { f = b ^ c ^ d; g = (3 * index + 5) % 16 }
      else { f = c ^ (b | ~d); g = (7 * index) % 16 }
      const next = (b + rotateLeft((a + f + constants[index] + words[g]) >>> 0, shifts[index])) >>> 0
      a = d; d = c; c = b; b = next
    }
    this.a = (this.a + a) >>> 0; this.b = (this.b + b) >>> 0; this.c = (this.c + c) >>> 0; this.d = (this.d + d) >>> 0
  }
}

export const md5 = (value: string) => new Md5Hasher().update(new TextEncoder().encode(value)).digest()

export const md5File = async (file: Blob, onProgress?: (progress: number) => void, chunkSize = 2 * 1024 * 1024) => {
  const hasher = new Md5Hasher()
  if (!file.size) { onProgress?.(1); return hasher.digest() }
  for (let start = 0; start < file.size; start += chunkSize) {
    const chunk = new Uint8Array(await file.slice(start, start + chunkSize).arrayBuffer())
    hasher.update(chunk)
    onProgress?.(Math.min((start + chunk.length) / file.size, 1))
  }
  return hasher.digest()
}

export const getMd5Variants = (value: string) => {
  const lower32 = md5(value)
  const lower16 = lower32.slice(8, 24)
  return { lower32, upper32: lower32.toUpperCase(), lower16, upper16: lower16.toUpperCase() }
}
