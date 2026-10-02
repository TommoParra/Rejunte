// Responsive audit: every page type at many widths, in Chromium, WebKit and Firefox.
// Reports elements that stick out of the viewport (unless a clipping ancestor
// hides them on purpose), boxes whose content overflows them, and page-level
// horizontal scroll.
import { chromium, webkit, firefox, BASE, PROTOTYPE, prepare } from './lib.mjs'

const base = BASE
const pages = [ '/', '/vitrina/', '/la-tanda/', '/encargos/', '/el-taller/', '/producto/alfajores-de-maicena/', '/producto/caja-de-alfajores/', '/categoria/tortas/', '/carrito/', '/preguntas-frecuentes/', '/politica-de-cookies/', '/condiciones-de-venta/', '/no-existe/', '/?s=torta&post_type=product' ]
const widths = (process.env.WIDTHS || '320,360,390,414,768,1024,1280,1440,1920,2560').split(',').map(Number)
const engines = { chromium, webkit, firefox }
const only = process.env.ENGINES ? process.env.ENGINES.split(',') : [ 'chromium' ]

const probe = () => {
  const vw = document.documentElement.clientWidth
  const out = { pageScroll: document.documentElement.scrollWidth > vw + 1 ? document.documentElement.scrollWidth : 0, stick: [], spill: [] }
  // The outermost clipping ancestor that itself sits inside the viewport.
  const clips = el => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) { const r = a.getBoundingClientRect(); if (r.left >= -1 && r.right <= document.documentElement.clientWidth + 1) return a } } return null }
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue
    if (el.closest('.screen-reader-text, .rj-visually-hidden, .rj-skip-link, [hidden], #wpadminbar, .rj-live')) continue
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) continue
    if (r.right > vw + 1 || r.left < -1) {
      const c = clips(el)
      const cr = c && c.getBoundingClientRect()
      if (!c || cr.right > vw + 1 || cr.left < -1) out.stick.push(`${ name(el) } [${ Math.round(r.left) }…${ Math.round(r.right) }]`)
    }
    // Text or inline content wider than its own box, with nothing clipping it.
    if (cs.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && ![ 'svg', 'img', 'picture', 'video', 'canvas' ].includes(el.tagName.toLowerCase()) && el.children.length < 4) {
      if (!el.closest('.rj-ticker, .rj-gallery__stage, .rj-gallery__track')) out.spill.push(`${ name(el) } (${ el.scrollWidth } > ${ el.clientWidth })`)
    }
  }
  out.stick = [ ...new Set(out.stick) ].slice(0, 6)
  out.spill = [ ...new Set(out.spill) ].slice(0, 6)
  return out
}

let problems = 0
for (const engineName of only) {
  const browser = await engines[engineName].launch()
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true, reducedMotion: 'reduce' })
    await prepare(context)
    // A product in the cart, so cart and header render their filled states.
    const seed = await context.newPage()
    await seed.goto(base + '/producto/alfajores-de-maicena/', { waitUntil: 'networkidle' })
    await seed.locator('.rj-product__form button[data-rj-add]').click()
    await seed.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('·'))
    await seed.close()
    for (const path of pages) {
      const page = await context.newPage()
      await page.goto(base + path, { waitUntil: 'networkidle' })
      if (path === '/carrito/') await page.locator('.wc-block-cart__submit-button, .wc-block-cart__empty-cart__title').first().waitFor().catch(() => {})
      await page.waitForTimeout(150)
      const r = await page.evaluate(probe)
      if (r.pageScroll || r.stick.length || r.spill.length) {
        problems++
        console.log(`${ engineName } ${ width } ${ path }`)
        if (r.pageScroll) console.log(`   page scrolls horizontally: ${ r.pageScroll }px`)
        for (const s of r.stick) console.log('   outside viewport: ' + s)
        for (const s of r.spill) console.log('   content overflows box: ' + s)
      }
      await page.close()
    }
    await context.close()
  }
  await browser.close()
}
console.log(problems ? `${ problems } page/width combinations with findings` : 'no overflow findings')
