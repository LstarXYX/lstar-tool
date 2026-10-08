export const characterGroups = {
  numbers: '0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  symbols: '~!@#$%^&*()-_=+[]{}|;:,.<>?',
} as const

export type CharacterGroup = keyof typeof characterGroups

export const uniqueCharacters = (value: string) => Array.from(new Set(Array.from(value))).join('')

const secureRandom = () => {
  const value = new Uint32Array(1)
  crypto.getRandomValues(value)
  return value[0] / 0x1_0000_0000
}

export const createPasswords = (length: number, characters: string, count = 10, random: () => number = secureRandom) => {
  const pool = Array.from(uniqueCharacters(characters))
  if (!Number.isInteger(length) || length < 1) throw new Error('密码长度至少为 1 位。')
  if (!pool.length) throw new Error('请至少输入一个可选字符。')
  if (!Number.isInteger(count) || count < 1) throw new Error('生成数量至少为 1 个。')

  return Array.from({ length: count }, () => Array.from({ length }, () => pool[Math.floor(random() * pool.length)]).join(''))
}
