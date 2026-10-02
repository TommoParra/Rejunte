// Shopping flow: add from the front page and the product page, then cart and checkout.
// Usage: node flow.mjs [width]
import { chromium } from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs'

const width = Number(process.argv[2] || 1440)
const base = 'https://rejunte.local:8890'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
const page = await context.newPage()
const errors = []
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push(e.message))
const log = (...a) => console.log(...a)

await page.goto(base + '/', { waitUntil: 'networkidle' })
const cta = page.locator('.rj-nav__cta')
log('header before:', await cta.textContent(), await cta.getAttribute('href'))

const sumar = page.locator('.rj-price button[data-rj-add]')
log('cards:', await sumar.count())
await sumar.nth(0).click()
await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('·'))
await sumar.nth(0).click()
await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('2'))
await sumar.nth(2).click()
await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('3'))
log('after adds:', await cta.textContent(), '| card 1:', await sumar.nth(0).textContent(), '| card 3:', await sumar.nth(2).textContent())
log('live region:', await page.locator('#rejunte-live').textContent())

// Product page: quantity 2 with the stepper.
await page.goto(base + '/producto/medialunas-de-manteca/', { waitUntil: 'networkidle' })
log('product header:', await page.locator('.rj-nav__cta').textContent(), await page.locator('.rj-nav__cta').getAttribute('href'))
await page.locator('.rj-qty__step[data-step="1"]').click()
await page.locator('.rj-product__form button[data-rj-add]').click()
await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('5'))
log('product add:', await page.locator('.rj-nav__cta').textContent(), '|', await page.locator('.rj-product__form button[data-rj-add]').textContent())

// Reload: server renders the counts.
await page.goto(base + '/', { waitUntil: 'networkidle' })
log('reload header:', await page.locator('.rj-nav__cta').textContent(), '| cards:', await page.locator('.rj-price button[data-rj-add]').allTextContents())

await page.goto(base + '/carrito/', { waitUntil: 'networkidle' })
await page.waitForSelector('.wc-block-cart-items, .wc-block-cart__empty-cart__title', { timeout: 20000 })
await page.evaluate(() => { const n = document.querySelector('.rj-nav'); if (n) n.style.position = 'relative' })
await page.screenshot({ path: `cmp/flow-cart-${ width }.png`, fullPage: true })

await page.goto(base + '/finalizar-compra/', { waitUntil: 'networkidle' })
await page.waitForSelector('.wc-block-checkout__form, .wc-block-checkout', { timeout: 20000 })
await page.waitForTimeout(800)
await page.evaluate(() => { const n = document.querySelector('.rj-nav'); if (n) n.style.position = 'relative' })
await page.screenshot({ path: `cmp/flow-checkout-${ width }.png`, fullPage: true })

if (process.argv[3] === 'order') {
  // Fill and place an order paid on pickup.
  const fill = async (selector, value) => { const f = page.locator(selector).first(); if (await f.count()) await f.fill(value) }
  await fill('#email', 'prueba@rejunte.local')
  await fill('#billing-first_name', 'Ana')
  await fill('#billing-last_name', 'Prueba')
  await fill('#billing-address_1', 'Carrer de Verdi 1')
  await fill('#billing-postcode', '08012')
  await fill('#billing-city', 'Barcelona')
  await fill('#billing-phone', '600000000')
  await page.locator('.wc-block-components-checkout-place-order-button').click()
  try {
    await page.waitForURL(/pedido-recibido|order-received/, { timeout: 30000 })
  } catch (error) {
    await page.screenshot({ path: `cmp/flow-checkout-failed-${ width }.png`, fullPage: true })
    log('checkout errors:', await page.locator('.wc-block-components-validation-error, .wc-block-components-notice-banner').allTextContents())
    throw error
  }
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => { const n = document.querySelector('.rj-nav'); if (n) n.style.position = 'relative' })
  await page.screenshot({ path: `cmp/flow-confirmation-${ width }.png`, fullPage: true })
  log('order placed:', page.url())
}

log(errors.length ? 'errors:\n' + errors.join('\n') : 'no console errors')
await browser.close()
