import { describe, expect, it } from 'vitest'
import { contrast } from '../lib/color.js'
import { THEMES, themeTokens } from '../data/themes.js'
import { parseCSV } from '../lib/csv.js'

describe('theme tokens', () => {
  it('keeps text and action colours readable in both modes', () => {
    for (const theme of THEMES) {
      for (const dark of [false, true]) {
        const tokens = themeTokens(theme, dark)
        expect(contrast(tokens['--ink'], tokens['--bg'])).toBeGreaterThan(7)
        expect(contrast(tokens['--mute'], tokens['--bg'])).toBeGreaterThan(4.4)
        expect(contrast(tokens['--brand'], tokens['--bg'])).toBeGreaterThan(4.4)
        expect(contrast(tokens['--on-brand'], tokens['--brand'])).toBeGreaterThan(4.4)
        expect(contrast(tokens['--accent'], tokens['--bg'])).toBeGreaterThan(4.4)
      }
    }
  })

  it('defines all nine supplied palettes plus the Nsimbi default', () => {
    expect(THEMES).toHaveLength(10)
    expect(THEMES.map((t) => t.id)).toContain('pastel')
    expect(THEMES.map((t) => t.id)).toContain('earthy')
  })
})

describe('CSV parsing', () => {
  it('handles quoted commas, escaped quotes and CRLF', () => {
    const rows = parseCSV(
      'date,type,category,note,amount\r\n2026-10-01,expense,Food,"Lunch, with ""friends""",5000\r\n',
    )
    expect(rows).toHaveLength(2)
    expect(rows[1][3]).toBe('Lunch, with "friends"')
    expect(rows[1][4]).toBe('5000')
  })

  it('ignores blank lines and a BOM', () => {
    expect(parseCSV('\uFEFFa,b\n\n1,2\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ])
  })
})
