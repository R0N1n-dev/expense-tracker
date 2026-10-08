// Draws the source images that @capacitor/assets turns into every icon and splash size.
// Run with: npm run icons
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const OUT = new URL('../assets/', import.meta.url).pathname
mkdirSync(OUT, { recursive: true })

const COLORS = ['#F59E0B', '#EC4899', '#14B8A6', '#60A5FA']
const LENGTHS = [350, 252, 214, 155]
const GAP = 150
const R = 250
const C = 2 * Math.PI * R

const defs = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#5B47E0"/><stop offset="1" stop-color="#241C73"/></linearGradient></defs>`

// Segmented ring (the budget bar from the app, bent into a circle) plus a white coin in the middle.
function mark() {
  let start = 0
  const arcs = LENGTHS.map((len, i) => {
    const el = `<circle cx="512" cy="512" r="${R}" fill="none" stroke="${COLORS[i]}" stroke-width="110"
      stroke-linecap="round" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-start}"
      transform="rotate(-90 512 512)"/>`
    start += len + GAP
    return el
  }).join('')
  return `${arcs}<circle cx="512" cy="512" r="95" fill="#fff"/>`
}

const tile = `<rect width="1024" height="1024" rx="230" fill="url(#g)"/>${mark()}`
const svg = (w, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">${defs}${body}</svg>`)

const splash = (bg) =>
  svg(2732, `<rect width="2732" height="2732" fill="${bg}"/><g transform="translate(1046 1046) scale(0.625)">${tile}</g>`)

const files = {
  'icon-only.png': svg(1024, `<rect width="1024" height="1024" fill="url(#g)"/>${mark()}`),
  'icon-background.png': svg(1024, `<rect width="1024" height="1024" fill="url(#g)"/>`),
  'icon-foreground.png': svg(1024, mark()),
  'splash.png': splash('#F3F2FA'),
  'splash-dark.png': splash('#12121C'),
}

for (const [name, buf] of Object.entries(files)) {
  await sharp(buf).png().toFile(OUT + name)
  console.log('wrote assets/' + name)
}
