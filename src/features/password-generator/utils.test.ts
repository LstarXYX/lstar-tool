import { describe, expect, it } from 'vitest'
import { characterGroups, createPasswords, getPasswordStrength, uniqueCharacters } from './utils'

describe('uniqueCharacters', () => {
  it('keeps the first occurrence of each character', () => {
    expect(uniqueCharacters('aabbccaa')).toBe('abc')
  })
})

describe('createPasswords', () => {
  it('creates the requested number of passwords at the requested length', () => {
    const passwords = createPasswords(4, 'ab', 3, () => 0)
    expect(passwords).toEqual(['aaaa', 'aaaa', 'aaaa'])
  })

  it('only uses characters from the selected pool', () => {
    const passwords = createPasswords(3, characterGroups.numbers, 2, () => 0.99)
    expect(passwords).toEqual(['999', '999'])
  })

  it('rejects an empty character pool and invalid length', () => {
    expect(() => createPasswords(4, '')).toThrow('请至少输入一个可选字符。')
    expect(() => createPasswords(0, 'a')).toThrow('密码长度至少为 1 位。')
  })
})

describe('getPasswordStrength', () => {
  it('identifies short or simple passwords as weak', () => {
    expect(getPasswordStrength('123456').label).toBe('弱')
    expect(getPasswordStrength('aaaaaaa!').label).toBe('弱')
  })

  it('rewards long passwords with mixed character types', () => {
    expect(getPasswordStrength('A7!mQ2#xLp9$Vz4@').label).toBe('强')
  })
})
