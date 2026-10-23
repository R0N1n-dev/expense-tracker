// Small colour toolkit used to turn the theme definitions into accessible tokens.
// Everything is plain hex/RGB so it also works in the browser preview.

const clamp = (n, min = 0, max = 255) => Math.min(max, Math.max(min, n))

export function hexToRgb(hex) {
  const clean = String(hex).replace('#', '').trim()
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const n = Number.parseInt(full, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

export function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => Math.round(clamp(v)).toString(16).padStart(2, '0')).join('')}`
}

// t = 0 returns a, t = 1 returns b.
export function mix(a, b, t) {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex({
    r: A.r + (B.r - A.r) * t,
    g: A.g + (B.g - A.g) * t,
    b: A.b + (B.b - A.b) * t,
  })
}

export function alpha(hex, a) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  const channel = (c) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

export function contrast(a, b) {
  const l1 = luminance(a)
  const l2 = luminance(b)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
}

// Pick white or near-black for text drawn on top of `bg`.
export function readableOn(bg) {
  return contrast(bg, '#ffffff') >= contrast(bg, '#0b0b12') ? '#ffffff' : '#0b0b12'
}

// Nudge a colour toward black (light mode) or white (dark mode) until it has
// enough contrast against the background. Keeps theme colours recognisable.
export function ensureContrast(color, against, min = 3, direction = 'darken') {
  const target = direction === 'lighten' ? '#ffffff' : '#0b0b12'
  if (contrast(color, against) >= min) return color
  let best = color
  for (let step = 1; step <= 20; step++) {
    best = mix(color, target, (step / 20) * 0.85)
    if (contrast(best, against) >= min) return best
  }
  return best
}
