export const fmt = (n) => Math.round(n).toLocaleString('en-US')

export const dayKey = (d) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()

// Month identifiers are integers like 202610 so they sort naturally.
export const monthKey = (d) => d.getFullYear() * 100 + (d.getMonth() + 1)

export const monthKeyOf = (timestamp) => monthKey(new Date(timestamp))

export const monthDate = (key) => new Date(Math.floor(key / 100), (key % 100) - 1, 1)

export const monthLabel = (key, opts = { month: 'long', year: 'numeric' }) =>
  monthDate(key).toLocaleDateString('en-GB', opts)

export const monthShort = (key) => monthDate(key).toLocaleDateString('en-GB', { month: 'short' })

export const addMonths = (key, delta) => {
  const d = monthDate(key)
  d.setMonth(d.getMonth() + delta)
  return monthKey(d)
}

export const daysInMonth = (key) => new Date(Math.floor(key / 100), key % 100, 0).getDate()

export const startOfMonth = (key) => monthDate(key).getTime()

export const endOfMonth = (key) =>
  new Date(Math.floor(key / 100), key % 100, 0, 23, 59, 59, 999).getTime()

export const sameMonth = (timestamp, key) => monthKeyOf(timestamp) === key

export const dateInputValue = (timestamp) => {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export const fromDateInput = (value) => {
  const [y, m, d] = String(value).split('-').map(Number)
  if (!y || !m || !d) return Date.now()
  return new Date(y, m - 1, d, 12).getTime()
}

export const longDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

export const shortDate = (timestamp) =>
  new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
