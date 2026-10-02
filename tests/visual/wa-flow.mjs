import { chromium } from '/Users/tom/Desktop/Web Devb/web-presence/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs'
const base = 'https://rejunte.local:8890'
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true })
const page = await context.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
const message = href => decodeURIComponent((href.split('?text=')[1] || '').replace(/\+/g, ' '))

// Empty cart: the hand-off goes back to the cart.
let r = await context.request.get(base + '/pedir-por-whatsapp/', { maxRedirects: 0 })
console.log('empty hand-off →', r.status(), r.headers().location)

await page.goto(base + '/', { waitUntil: 'networkidle' })
const sumar = page.locator('.rj-price button[data-rj-add]')
await sumar.nth(0).click(); await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('1'))
await sumar.nth(0).click(); await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('2'))
await sumar.nth(2).click(); await page.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('3'))

await page.goto(base + '/carrito/', { waitUntil: 'networkidle' })
const button = page.locator('.wc-block-cart__submit-button')
await button.waitFor()
console.log('button label:', (await button.textContent()).trim())
let href = await button.getAttribute('href')
console.log('button href host:', new URL(href).host)
console.log('message:\n' + message(href))

// Change a quantity in the cart: the link follows.
await page.locator('.wc-block-components-quantity-selector__button--plus').first().click()
await page.waitForFunction(old => document.querySelector('.wc-block-cart__submit-button').getAttribute('href') !== old, href, { timeout: 15000 })
href = await button.getAttribute('href')
console.log('after +1, message:\n' + message(href))

// Hand-off and checkout page both open WhatsApp.
r = await context.request.get(base + '/pedir-por-whatsapp/', { maxRedirects: 0 })
console.log('hand-off →', r.status(), new URL(r.headers().location).host, r.headers()['x-redirect-by'])
r = await context.request.get(base + '/finalizar-compra/', { maxRedirects: 0 })
console.log('checkout page →', r.status(), new URL(r.headers().location).host)
console.log('same message as button:', message(r.headers().location) === message(href))
console.log(errors.length ? 'errors:\n' + errors.join('\n') : 'no console errors')
await browser.close()
