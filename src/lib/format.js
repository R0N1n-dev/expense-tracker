export const fmt = (n) => Math.round(n).toLocaleString('en-US')

export const dayKey = (d) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
