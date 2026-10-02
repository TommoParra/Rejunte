// Pixel comparison: prototype vs WordPress at the same viewport.
// Usage: node compare.mjs <width> <height> [label] [wpPath]
// Writes cmp/<label>-proto.png, -wp.png, -diff.png, -side-NN.png and prints the
// share of differing pixels overall and per 150px band.
import { chromium } from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs'
import sharp from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/sharp@0.35.4_@types+node@24.13.3/node_modules/sharp/dist/index.mjs'
import { mkdirSync } from 'node:fs'

const [ , , w = '1440', h = '900', label = `d${ w }`, wpPath = '/' ] = process.argv
const width = Number(w), height = Number(h)
mkdirSync('cmp', { recursive: true })

async function shoot(browser, url, out, prepare) {
  const page = await browser.newPage({ viewport: { width, height }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)) }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => Promise.all([ document.fonts.ready, ...[ ...document.images ].map(i => i.decode().catch(() => {})) ]))
  if (prepare) await page.evaluate(prepare)
  await page.waitForTimeout(250)
  await page.screenshot({ path: out, fullPage: true, animations: 'disabled' })
  await page.close()
}

const browser = await chromium.launch()
// The prototype collapses its hero logo to 0px on phones (see hero/style.scss);
// apply the intended 260px so the rest of the page lines up for comparison.
await shoot(browser, 'http://127.0.0.1:3999/portfolio/rejunte?preview=true', `cmp/${ label }-proto.png`, () => {
  const style = document.createElement('style')
  style.textContent = '@media (max-width: 40rem) { .rj-hero__lockup { inline-size: 100% } }'
  document.head.append(style)
})
// The WordPress header sticks; for a full-page capture let it sit in the flow like the prototype's.
await shoot(browser, `https://rejunte.local:8890${ wpPath }`, `cmp/${ label }-wp.png`, () => {
  const nav = document.querySelector('.rj-nav'); if (nav) nav.style.position = 'relative'
})
await browser.close()

const a = sharp(`cmp/${ label }-proto.png`), b = sharp(`cmp/${ label }-wp.png`)
const ma = await a.metadata(), mb = await b.metadata()
const H = Math.min(ma.height, mb.height)
console.log(`heights: proto ${ ma.height } / wp ${ mb.height }`)
const ra = await sharp(`cmp/${ label }-proto.png`).extract({ left: 0, top: 0, width, height: H }).removeAlpha().raw().toBuffer()
const rb = await sharp(`cmp/${ label }-wp.png`).extract({ left: 0, top: 0, width, height: H }).removeAlpha().raw().toBuffer()
const diff = Buffer.alloc(width * H * 3)
let bad = 0
const bands = []
for (let y = 0; y < H; y++) {
  let rowBad = 0
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3
    const d = Math.abs(ra[i] - rb[i]) + Math.abs(ra[i + 1] - rb[i + 1]) + Math.abs(ra[i + 2] - rb[i + 2])
    if (d > 30) { bad++; rowBad++; diff[i] = 255; diff[i + 1] = 0; diff[i + 2] = 60 } else { diff[i] = diff[i + 1] = diff[i + 2] = Math.round(ra[i] * 0.25 + 190) }
  }
  const band = Math.floor(y / 150)
  bands[band] = (bands[band] || 0) + rowBad
}
await sharp(diff, { raw: { width, height: H, channels: 3 } }).png().toFile(`cmp/${ label }-diff.png`)
console.log(`differing pixels: ${ (100 * bad / (width * H)).toFixed(2) }%`)
console.log('bands >0.5%: ' + bands.map((n, i) => [ i * 150, 100 * n / (width * 150) ]).filter(([ , p ]) => p > 0.5).map(([ y, p ]) => `${ y }:${ p.toFixed(1) }%`).join('  '))

// Side-by-side strips for viewing.
const strip = Math.min(900, Math.round(1800 * height / width / 2) * 2)
for (let top = 0, n = 0; top < H; top += strip, n++) {
  const sh = Math.min(strip, H - top)
  const left = await sharp(`cmp/${ label }-proto.png`).extract({ left: 0, top, width, height: sh }).toBuffer()
  const right = await sharp(`cmp/${ label }-wp.png`).extract({ left: 0, top, width, height: sh }).toBuffer()
  await sharp({ create: { width: width * 2 + 10, height: sh, channels: 3, background: '#000' } })
    .composite([ { input: left, left: 0, top: 0 }, { input: right, left: width + 10, top: 0 } ])
    .png().toFile(`cmp/${ label }-side-${ String(n).padStart(2, '0') }.png`)
}
