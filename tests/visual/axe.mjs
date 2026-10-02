// axe-core accessibility audit (WCAG 2.2 A/AA + best practices) across pages,
// at desktop and phone widths, with the phone menu opened once.
import { chromium, BASE, PROTOTYPE, prepare } from './lib.mjs'
import { AxeBuilder } from '@axe-core/playwright'

const paths = process.argv.slice(2).length ? process.argv.slice(2) : [ '/', '/vitrina/', '/la-tanda/', '/encargos/', '/el-taller/', '/producto/alfajores-de-maicena/', '/producto/caja-de-alfajores/', '/categoria/tortas/', '/carrito/', '/preguntas-frecuentes/', '/aviso-legal/', '/politica-de-privacidad/', '/politica-de-cookies/', '/condiciones-de-venta/', '/no-existe/', '/?s=torta&post_type=product' ]
const browser = await chromium.launch()
let total = 0
for (const width of [ 1440, 390 ]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true })
  // Something in the cart, so cart and checkout render their full forms.
  const seed = await context.newPage()
  await seed.goto(BASE + '/', { waitUntil: 'networkidle' })
  await seed.locator('.rj-price button[data-rj-add]').first().click()
  await seed.waitForFunction(() => document.querySelector('.rj-nav__cta').textContent.includes('·'))
  await seed.close()

  for (const path of paths) {
    const page = await context.newPage()
    await page.goto(BASE + path, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    if (width < 600 && path === '/') {
      await page.locator('.rj-nav__burger').click()
    }
    const results = await new AxeBuilder({ page }).withTags([ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ]).analyze()
    const issues = results.violations
    total += issues.length
    console.log(`${ width } ${ path }: ${ issues.length ? issues.length + ' issue(s)' : 'ok' }`)
    for (const v of issues) {
      console.log(`   [${ v.impact }] ${ v.id }: ${ v.help }`)
      for (const n of v.nodes.slice(0, 4)) console.log(`      ${ n.target.join(' ') } — ${ (n.failureSummary || '').split('\n').slice(1, 2).join(' ').trim().slice(0, 160) }`)
    }
    await page.close()
  }
  await context.close()
}
await browser.close()
console.log('total violations:', total)
