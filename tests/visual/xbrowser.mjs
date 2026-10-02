// WebKit and Firefox: proxy every request through Playwright's Node side (it
// resolves rejunte.local from /etc/hosts), then run the overflow probe and take
// screenshots.
import { webkit, firefox } from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'
const probeSource = readFileSync(new URL('./overflow.mjs', import.meta.url), 'utf8')
const probe = eval('(' + probeSource.slice(probeSource.indexOf('const probe = ') + 14, probeSource.indexOf('\nlet problems')).trim() + ')')
const base = 'https://rejunte.local:8890'
const pages = [ '/', '/vitrina/', '/producto/alfajores-de-maicena/', '/encargos/', '/carrito/' ]
for (const [ name, engine ] of [ [ 'webkit', webkit ], [ 'firefox', firefox ] ]) {
  const browser = await engine.launch()
  for (const width of [ 320, 390, 1440 ]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
    await context.route('**/*', async route => {
      try { route.fulfill({ response: await route.fetch({ maxRedirects: 0 }) }) } catch { route.abort() }
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    for (const path of pages) {
      await page.goto(base + path, { waitUntil: 'load', timeout: 60000 })
      if (path === '/') {
        await page.locator('.rj-price button[data-rj-add]').first().click()
        await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('·'), null, { timeout: 15000 }).catch(() => errors.push('add to cart did not update header'))
      }
      if (path === '/carrito/') await page.locator('.wc-block-cart__submit-button').waitFor({ timeout: 20000 }).catch(() => errors.push('cart did not render'))
      await page.waitForTimeout(600)
      const r = await page.evaluate(probe)
      const findings = [ r.pageScroll ? `page scroll ${ r.pageScroll }px` : '', ...r.stick, ...r.spill ].filter(Boolean)
      console.log(`${ name } ${ width } ${ path }: ${ findings.length ? findings.slice(0, 3).join(' | ') : 'ok' }`)
      if (width !== 320) await page.screenshot({ path: `cmp/x-${ name }-${ width }-${ path.replace(/\W+/g, '_') }.png`, fullPage: false })
    }
    if (errors.length) console.log(`  ${ name } ${ width } errors: ${ errors.join(' / ') }`)
    await context.close()
  }
  await browser.close()
}
