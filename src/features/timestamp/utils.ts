export type TimestampUnit = 'milliseconds' | 'seconds'

const pad = (value: number) => String(value).padStart(2, '0')

export const timestampToDate = (value: string, unit: TimestampUnit) => {
  if (!/^-?\d+$/.test(value.trim())) throw new Error('请输入有效的整数时间戳。')
  const numeric = Number(value)
  const milliseconds = unit === 'seconds' ? numeric * 1000 : numeric
  const date = new Date(milliseconds)
  if (!Number.isFinite(milliseconds) || Number.isNaN(date.getTime())) throw new Error('时间戳超出可转换范围。')
  return date
}

export const dateToTimestamp = (value: string, unit: TimestampUnit) => {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) throw new Error('请选择有效的日期和时间。')
  return unit === 'seconds' ? Math.floor(date.getTime() / 1000) : date.getTime()
}

export const dateToLocalInput = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

export const getDateFormats = (date: Date) => {
  const year = date.getFullYear(); const month = pad(date.getMonth() + 1); const day = pad(date.getDate()); const hour = pad(date.getHours()); const minute = pad(date.getMinutes()); const second = pad(date.getSeconds())
  return [
    ['标准格式', `${year}-${month}-${day} ${hour}:${minute}:${second}`],
    ['斜杠格式', `${year}/${month}/${day} ${hour}:${minute}:${second}`],
    ['中文格式', `${year}年${month}月${day}日 ${hour}:${minute}:${second}`],
    ['ISO 8601', date.toISOString()],
    ['日期', `${year}-${month}-${day}`],
  ] as const
}
