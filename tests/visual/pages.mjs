// Screenshot WordPress pages. Usage: node pages.mjs <width> <outPrefix> <path> [<path>...]
import { chromium } from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs'
const [ , , w, prefix, ...paths ] = process.argv
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: Number(w), height: 900 }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
const errors = []
for (const path of paths) {
  const page = await context.newPage()
  page.on('console', m => { if (m.type() === 'error') errors.push(`${ path }: ${ m.text() }`) })
  page.on('pageerror', e => errors.push(`${ path }: ${ e.message }`))
  const response = await page.goto(`https://rejunte.local:8890${ path }`, { waitUntil: 'networkidle' })
  await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)) } window.scrollTo(0, 0) })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => { const n = document.querySelector('.rj-nav'); if (n) n.style.position = 'relative' })
  const name = `${ prefix }-${ path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home' }.png`
  await page.screenshot({ path: `cmp/${ name }`, fullPage: true, animations: 'disabled' })
  console.log(response.status(), path, '→', name, await page.evaluate(() => document.documentElement.scrollHeight))
  await page.close()
}
await browser.close()
if (errors.length) console.log('errors:\n' + errors.join('\n'))
