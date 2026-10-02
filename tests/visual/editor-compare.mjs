// Editor vs front end: the post editor's canvas for a post, captured at the same
// width as the live page, then diffed.
// Usage: node editor-compare.mjs <postId> <livePath> <label> [width]
import { chromium } from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs'
import sharp from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/sharp@0.35.4_@types+node@24.13.3/node_modules/sharp/dist/index.mjs'
import { login, logout } from './wplogin.mjs'

const [ , , postId, livePath, label, w = '1440' ] = process.argv
const width = Number(w)
const base = 'https://rejunte.local:8890'
const session = login()
const browser = await chromium.launch()

try {
  // Editor: tall viewport so the whole canvas renders at once, sidebar closed.
  const editor = await browser.newContext({ viewport: { width, height: 5200 }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
  await editor.addCookies(session.cookies)
  const page = await editor.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(`${ base }/wp-admin/post.php?post=${ postId }&action=edit`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => window.wp?.data?.select('core/block-editor')?.getBlockCount() > 0, null, { timeout: 60000 })
  await page.evaluate(() => {
    const { dispatch } = wp.data
    dispatch('core/preferences').set('core', 'welcomeGuide', false)
    dispatch('core/preferences').set('core/edit-post', 'welcomeGuide', false)
    dispatch('core/editor').setIsListViewOpened?.(false)
    dispatch('core/interface').disableComplementaryArea('core')
    dispatch('core/block-editor').clearSelectedBlock()
  })
  const frame = page.frameLocator('iframe[name="editor-canvas"]')
  await frame.locator(process.env.WAIT || '.rj-hero').waitFor({ timeout: 60000 })
  await page.waitForTimeout(1500)
  const canvas = page.locator('iframe[name="editor-canvas"]')
  const box = await canvas.boundingBox()
  console.log('canvas', Math.round(box.width), 'x', Math.round(box.height))
  // Images inside the canvas finish loading first.
  const handle = await canvas.elementHandle()
  const inner = await handle.contentFrame()
  await inner.evaluate(() => Promise.all([ ...document.images ].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r }))))
  const contentHeight = await inner.evaluate(() => document.documentElement.scrollHeight)
  console.log('content height', contentHeight)
  await page.waitForTimeout(500)
  await canvas.screenshot({ path: `cmp/${ label }-editor.png`, animations: 'disabled' })
  if (errors.length) console.log('editor errors:\n' + errors.slice(0, 10).join('\n'))

  // Front end at the canvas width.
  const live = await browser.newContext({ viewport: { width: Math.round(box.width), height: 900 }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
  const lp = await live.newPage()
  await lp.goto(base + livePath, { waitUntil: 'networkidle' })
  await lp.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)) } window.scrollTo(0, 0) })
  await lp.waitForLoadState('networkidle')
  await lp.evaluate(() => { const n = document.querySelector('.rj-nav'); if (n) n.style.position = 'relative' })
  await lp.screenshot({ path: `cmp/${ label }-live.png`, fullPage: true, animations: 'disabled' })

  // Diff.
  const me = await sharp(`cmp/${ label }-editor.png`).metadata()
  const ml = await sharp(`cmp/${ label }-live.png`).metadata()
  const W = Math.min(me.width, ml.width), H = Math.min(me.height, ml.height, contentHeight)
  console.log(`editor ${ me.width }x${ me.height } / live ${ ml.width }x${ ml.height }`)
  const ra = await sharp(`cmp/${ label }-editor.png`).extract({ left: 0, top: 0, width: W, height: H }).removeAlpha().raw().toBuffer()
  const rb = await sharp(`cmp/${ label }-live.png`).extract({ left: 0, top: 0, width: W, height: H }).removeAlpha().raw().toBuffer()
  let bad = 0
  const bands = []
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3
    if (Math.abs(ra[i] - rb[i]) + Math.abs(ra[i + 1] - rb[i + 1]) + Math.abs(ra[i + 2] - rb[i + 2]) > 30) { bad++; bands[Math.floor(y / 150)] = (bands[Math.floor(y / 150)] || 0) + 1 }
  }
  console.log(`differing pixels: ${ (100 * bad / (W * H)).toFixed(2) }%`)
  console.log('bands >0.5%: ' + bands.map((n, i) => [ i * 150, 100 * n / (W * 150) ]).filter(([ , p ]) => p > 0.5).map(([ y, p ]) => `${ y }:${ p.toFixed(1) }%`).join('  '))
  for (let top = 0, n = 0; top < H; top += 900, n++) {
    const sh = Math.min(900, H - top)
    const a = await sharp(`cmp/${ label }-editor.png`).extract({ left: 0, top, width: W, height: sh }).toBuffer()
    const b = await sharp(`cmp/${ label }-live.png`).extract({ left: 0, top, width: W, height: sh }).toBuffer()
    await sharp({ create: { width: W * 2 + 10, height: sh, channels: 3, background: '#000' } }).composite([ { input: a, left: 0, top: 0 }, { input: b, left: W + 10, top: 0 } ]).png().toFile(`cmp/${ label }-eside-${ String(n).padStart(2, '0') }.png`)
  }
} finally {
  await browser.close()
  logout(session.token)
}
