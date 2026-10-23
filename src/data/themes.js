import { alpha, ensureContrast, mix, readableOn } from '../lib/color.js'

// Palette definitions supplied in the brand guide. `kind` documents how the
// supplied colours are meant to be distributed; the app always uses the
// primary as the dominant colour and the accent for highlights.
export const THEMES = [
  {
    id: 'violet',
    name: 'Violet Pulse',
    useCase: 'Nsimbi original',
    kind: 'dual',
    primary: '#5B47E0',
    secondary: '#8B7BFF',
    accent: '#F59E0B',
  },
  {
    id: 'corporate',
    name: 'Classic Corporate',
    useCase: 'Fintech, SaaS & crypto',
    kind: 'dual',
    primary: '#1E2761',
    secondary: '#408EC6',
    accent: '#408EC6',
  },
  {
    id: 'retail',
    name: 'Energetic Retail',
    useCase: 'E-commerce, delivery & travel',
    kind: 'dual',
    primary: '#2C3E50',
    secondary: '#E67E22',
    accent: '#E67E22',
  },
  {
    id: 'eco',
    name: 'Eco-Organic',
    useCase: 'Sustainability & wellness',
    kind: 'dual',
    primary: '#2C5F2D',
    secondary: '#97BC62',
    accent: '#97BC62',
  },
  {
    id: 'cyber',
    name: 'Cyber High-Contrast',
    useCase: 'Productivity, dev tools & fitness',
    kind: 'dual',
    primary: '#1A1A1A',
    secondary: '#C1DD13',
    accent: '#C1DD13',
  },
  {
    id: 'editorial',
    name: 'Minimalist Editorial',
    useCase: 'Fashion, portfolio & lifestyle',
    kind: 'dual',
    primary: '#CC313D',
    secondary: '#F7C5CC',
    accent: '#CC313D',
  },
  {
    id: 'high-end',
    name: 'The High-End Trio',
    useCase: 'Luxury retail & fine dining',
    kind: 'triple',
    primary: '#1E2761',
    secondary: '#408EC6',
    accent: '#7A2048',
  },
  {
    id: 'bright-tech',
    name: 'The Bright Tech Vibe',
    useCase: 'Dashboards & data tracking',
    kind: 'triple',
    primary: '#2D3047',
    secondary: '#2EC4B6',
    accent: '#FF7A59',
  },
  {
    id: 'pastel',
    name: 'The Playful Pastel',
    useCase: 'Social, mindfulness & learning',
    kind: 'triple',
    primary: '#B298E7',
    secondary: '#B8E3E9',
    accent: '#F5B8D5',
  },
  {
    id: 'earthy',
    name: 'The Earthy Muted',
    useCase: 'Home, plants & architecture',
    kind: 'triple',
    primary: '#4A5842',
    secondary: '#EFEBE4',
    accent: '#D98A6C',
  },
]

export const DEFAULT_THEME = 'violet'
export const DEFAULT_MODE = 'system'

export const themeById = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0]

// Build every CSS token the UI needs for one theme in one appearance mode.
// Light mode: a tinted paper background with the primary as the dominant ink
// colour. Dark mode: the primary tints a near-black canvas and the secondary
// becomes the action colour so buttons stay vivid on dark surfaces.
export function themeTokens(theme, dark) {
  const { primary, secondary, accent } = theme

  if (!dark) {
    const bg = mix(primary, '#ffffff', 0.945)
    const surface = '#ffffff'
    const ink = mix(primary, '#0b0b12', 0.86)
    const mute = mix(ink, bg, 0.36)
    const line = mix(primary, bg, 0.82)
    const empty = mix(primary, bg, 0.9)
    const brand = ensureContrast(primary, bg, 4.5, 'darken')
    const brand2 = ensureContrast(secondary, bg, 3, 'darken')
    const pop = ensureContrast(accent, bg, 4.5, 'darken')
    return {
      '--bg': bg,
      '--surface': surface,
      '--ink': ink,
      '--mute': mute,
      '--line': line,
      '--empty': empty,
      '--brand': brand,
      '--brand-2': brand2,
      '--brand-soft': mix(primary, bg, 0.86),
      '--accent': pop,
      '--accent-raw': accent,
      '--on-brand': readableOn(brand),
      '--on-accent': readableOn(pop),
      '--over': '#C02626',
      '--ok': '#157F4B',
      '--shadow': `0 10px 30px ${alpha(primary, 0.16)}`,
      '--scrim': alpha(mix(primary, '#0b0b12', 0.7), 0.55),
    }
  }

  const bg = mix(primary, '#0b0b12', 0.88)
  const surface = mix(primary, '#0b0b12', 0.8)
  const ink = mix(primary, '#f8f8fc', 0.92)
  const mute = mix(ink, bg, 0.4)
  const line = mix(surface, '#ffffff', 0.13)
  const empty = mix(surface, '#ffffff', 0.08)
  const brand = ensureContrast(secondary, bg, 4.5, 'lighten')
  const brand2 = ensureContrast(primary, bg, 3, 'lighten')
  const pop = ensureContrast(accent, bg, 4.5, 'lighten')
  return {
    '--bg': bg,
    '--surface': surface,
    '--ink': ink,
    '--mute': mute,
    '--line': line,
    '--empty': empty,
    '--brand': brand,
    '--brand-2': brand2,
    '--brand-soft': mix(brand, bg, 0.84),
    '--accent': pop,
    '--accent-raw': accent,
    '--on-brand': readableOn(brand),
    '--on-accent': readableOn(pop),
    '--over': '#FF8A8A',
    '--ok': '#5CD6A0',
    '--shadow': '0 10px 30px rgba(0, 0, 0, 0.45)',
    '--scrim': 'rgba(6, 6, 12, 0.66)',
  }
}
