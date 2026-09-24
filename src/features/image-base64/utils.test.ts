import { describe, expect, it } from 'vitest'
import { getBase64Payload } from './utils'

describe('getBase64Payload', () => {
  it('preserves the declared MIME type for data URLs', () => {
    expect(getBase64Payload('data:image/png;base64,aGVsbG8=')).toEqual({
      mimeType: 'image/png',
      payload: 'aGVsbG8=',
    })
  })

  it('defaults unprefixed content to JPEG and removes whitespace', () => {
    expect(getBase64Payload(' aGVs\nbG8= ')).toEqual({
      mimeType: 'image/jpeg',
      payload: 'aGVsbG8=',
    })
  })
})
