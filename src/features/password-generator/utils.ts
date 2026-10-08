export const characterGroups = {
  numbers: '0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  symbols: '~!@#$%^&*()-_=+[]{}|;:,.<>?',
} as const

export type CharacterGroup = keyof typeof characterGroups

export type PasswordStrength = {
  label: '弱' | '一般' | '较强' | '强'
  level: 1 | 2 | 3 | 4
  description: string
}

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

export const getPasswordStrength = (password: string): PasswordStrength => {
  const characters = Array.from(password)
  const length = characters.length
  if (!length) return { label: '弱', level: 1, description: '请输入密码' }

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSymbols = /[^a-zA-Z\d]/.test(password)
  const poolSize = (hasLowercase ? 26 : 0) + (hasUppercase ? 26 : 0) + (hasNumbers ? 10 : 0) + (hasSymbols ? Math.max(10, Array.from(new Set(characters.filter((character) => /[^a-zA-Z\d]/.test(character)))).length) : 0)
  const estimatedBits = length * Math.log2(Math.max(poolSize, 1))
  const repeated = /(.)\1{2,}/.test(password)
  const sequential = /(?:0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|qwer|asdf|zxcv)/i.test(password)
  const adjustedBits = estimatedBits - (repeated ? 15 : 0) - (sequential ? 12 : 0)

  if (length < 8 || adjustedBits < 28) return { label: '弱', level: 1, description: '建议至少 8 位，并混合更多字符' }
  if (adjustedBits < 45) return { label: '一般', level: 2, description: '增加长度或混合字符类型会更安全' }
  if (adjustedBits < 60 || length < 12) return { label: '较强', level: 3, description: '适合多数日常账号' }
  return { label: '强', level: 4, description: '长度和字符组合都很充足' }
}
