# Rejunte — development guide

Block theme for Rejunte, pastelería argentina en Barcelona. Built from the Vue prototype in `web-presence/app/portfolio/prototypes/rejunte/`: every section is a Gutenberg block that is edited in place and looks the same in the editor as on the site.

## Requirements

- WordPress 6.8+ (built and tested on 7.1)
- PHP 8.1+
- WooCommerce 9+ for the store (tested on 11.1). The theme works without it; the price cards then count in the page, as the prototype did.
- Node 20+ to build

## Build

```sh
npm install
npm run build        # blocks (build/blocks) + global CSS (assets/css)
npm run start        # watch the blocks while developing
npm run build:css    # only src/scss → assets/css
npm run zip          # build, then rejunte.zip without development files (see .distignore)
```

`build/` and `assets/css/` are committed, so the theme runs without building.

## Structure

```
inc/              PHP, one concern per file
  helpers.php       asset URLs, brand images, block search, plain text
  setup.php         theme supports, image sizes, WebP sub-sizes, template editing for pages/products
  assets.php        global CSS (inlined), editor data
  blocks.php        block registration, KSES allowances, brand images, current-page nav link,
                    unique ids, automatic tanda date
  performance.php   head cleanup
  hardening.php     XML-RPC off, no user enumeration, no users sitemap
  accessibility.php skip link, pause-animations toggle, live region
  business.php      business profile parsed from the footer's visible text
  contact.php       Customizer → Datos de contacto: WhatsApp number and order message
  consent.php       cookie notice / consent banner, Customizer → Privacidad y cookies, cookie list
  seo.php           title, description, Open Graph, JSON-LD @graph, FAQPage
  llms.php          /llms.txt
  woocommerce.php   store integration (only loaded when WooCommerce is active)
src/blocks/<name>/  block.json, edit.js, save.js or render.php, view.js, style.scss
src/shared/         code shared by blocks: image slot, editor controls, gallery and bento engines,
                    cart store, order buttons and toast
src/scss/           fonts, tokens, reset, shared components, layout, prose, editor, WooCommerce
assets/             compiled CSS, consent.js, whatsapp-cart.js, Arvo WOFF2, brand images
templates/ parts/ patterns/
tests/visual/       Playwright, axe and SEO checks (see its README)
docs/               this guide, DEPLOYMENT.md, screenshots
```

## Blocks

| Block | Kind | Notes |
| --- | --- | --- |
| `rejunte/header` | static | Brand, nav, order button ("Pedir · N"), phone menu. Server marks the current page link. |
| `rejunte/hero` | static | LCP image with `fetchpriority="high"`. Also used by the 404 pattern. |
| `rejunte/tanda` | static | Curved gallery. Saved at rest, so it renders without JS; `view.js` adds drag, keys, wheel. |
| `rejunte/ticker` | static | Decorative marquee: `aria-hidden`, pauses on hover and with the pause control. |
| `rejunte/vitrina` + `rejunte/bento-tile` | static | Bento with cursor effects (fine pointers, no reduced motion only). |
| `rejunte/precios` + `rejunte/price-card` | static | Cards can link to a product: live price and add-to-cart are filled in at render. |
| `rejunte/encargos` | static | Checkered panel, chips, button, arched photo. |
| `rejunte/faq` | static | Native `details`/`summary`. Questions feed the `FAQPage` node and `/llms.txt`. |
| `rejunte/footer` | static | Its address, hours, phone and social lines feed the structured data. A legal-links row and a "Configurar cookies" button sit at the bottom. |
| `rejunte/product-hero` | dynamic | Product page header. In the editor, name, presentation, short description and photo edit in place; ingredients and allergens in the sidebar. |
| `rejunte/product-grid` | dynamic | Product cards for the shop, categories, related products. |

Section blocks (`tanda`, `vitrina`, `encargos`, `faq`) have a heading level setting: H1 when the section opens a page, H2 otherwise.

The tanda eyebrow can be automatic ("Tanda del 1 de octubre"): it shows the date of the most recent release day (Thursday by default), worked out at render time.

## Content

- Front page: page "Inicio", template `front-page`.
- Menu pages: "La tanda", "Encargos", "El taller" use the "Página a todo ancho" template; "La vitrina" is the WooCommerce shop (`/vitrina/`).
- Header and footer: template parts, edited in Site Editor → Patterns → Template parts. Their default logos are the theme's own files (`assets/img`), so the parts stay portable between sites.
- Products are edited in the block editor; their page template shows around them.
- Legal pages: Aviso legal, Política de privacidad, Política de cookies and Condiciones de venta start from the `patterns/legal-*.php` patterns. They are drafts with `[placeholders]` and a "Borrador" notice (`.rj-draft-note`) to remove once complete. The cookie table is built from `rejunte_cookie_inventory()` in `inc/consent.php`.
- FAQ: page "Preguntas frecuentes" (`/preguntas-frecuentes/`), from the `rejunte/faq` pattern.

## Store

- "Sumar" and the product page form add to the WooCommerce cart through the Store API and work without JavaScript (plain form posts to the cart).
- WooCommerce's scripts and styles load only on cart, checkout and account pages, and on product pages with options (variable products use WooCommerce's own form).
- Pickup at the workshop is the only shipping method.
- Adding to the order shows a toast (`role="status"`, dismissible) with a link to the cart.

### Food information

Products have four fields, registered as post meta and shown in the product sidebar ("Ingredientes y alérgenos"):

- `rejunte_ingredients`: text;
- `rejunte_allergens`: any of the 14 regulated allergens;
- `rejunte_traces`: text;
- `rejunte_conservation`: text.

They show on the product page below the add button, in the Product JSON-LD (`additionalProperty`), and in `/llms.txt`. A product without data shows a link to ask by WhatsApp instead.

### Orders by WhatsApp

There is no payment step. The cart's button reads **Pedir por WhatsApp** and opens WhatsApp with the order already written:

```
¡Hola Rejunte! Quiero hacer este pedido:

• 2 × Alfajores de maicena (Docena) — 28 €
• 1 × Torta de crema (18 cm · 10 porciones) — 32 €

Retiro: domingo 4 de octubre, de 16:00 a 20:00
Total: 60 €

¿Me lo confirmás?
```

- **Settings:** Appearance → Customize → **Datos de contacto** holds the number (falling back to +34 655 47 97 47), the opening and closing lines of the message, and the **Cerrar los pedidos por WhatsApp** switch. Turn the switch off when a payment gateway is added, and the normal checkout comes back.
- **How the link stays current:** the message is built in PHP from the real cart (`rejunte_whatsapp_order_text()` in `inc/woocommerce.php`). It's added to every Store API cart response as `extensions.rejunte.whatsapp_url`, so the cart button's link follows each change of quantity or item. The button uses WooCommerce's documented checkout filters (`assets/js/whatsapp-cart.js`).
- **Pickup day:** the cart shows a select with the days the workshop opens in the next two weeks, starting tomorrow (from the footer's hours). The choice is saved in the WooCommerce session through a Store API update callback and written into the message. Without a day, the message ends with the Customizer's closing line instead of "¿Me lo confirmás?".
- **Explained in place:** under the totals, a line says what the button does, with a link to the terms of sale. "¿No tenés WhatsApp? Copiá el pedido" copies the message for people on a computer without WhatsApp.
- **Fallback:** `/pedir-por-whatsapp/` builds the message at the moment of the visit and redirects to WhatsApp. The checkout URL points there, so every "checkout" link in WooCommerce ends in WhatsApp, and the checkout page redirects too. An empty cart goes back to the cart.
- **All WhatsApp links follow the setting:** any `wa.me` link in block content (the encargos button, links editors add) is rewritten at render time to the configured number, keeping its message. The number is also the business's `contactPoint` in the structured data and is listed in `/llms.txt`.

## Cookies and consent

- `inc/consent.php` prints the banner and `assets/js/consent.js` runs it. No third-party consent platform is involved.
- **Only technical cookies:** it is a short notice ("Entendido") linking to the cookie policy.
- **Optional services:** once one is configured — a GA4 ID in Customizer → Privacidad y cookies, or any service added through the `rejunte_consent_services` filter — it asks. "Aceptar", "Rechazar" and "Configurar" carry the same weight, and nothing optional loads before consent.
- **The choice:**
  - it is kept 13 months in the first-party `rejunte_consent` cookie;
  - it carries a version, so adding a category asks again;
  - it can be changed from the footer's "Configurar cookies".
- **For scripts:** `window.rejunteConsent.on( 'analytics', () => { … } )` runs code only after consent; `rejunteConsent.open()` reopens the banner.

## SEO and GEO

- **One JSON-LD `@graph` per page:**
  - `WebSite`;
  - `Bakery`, with address, hours, phone, Instagram, the WhatsApp `contactPoint`, price range and offer catalogue;
  - `WebPage`, `ItemPage` or `CollectionPage`;
  - `Product` with `Offer`, including `priceValidUntil`, pickup-only `shippingDetails` and a no-returns `hasMerchantReturnPolicy` for perishables;
  - `BreadcrumbList`;
  - `FAQPage`, on pages with the FAQ block.

  WooCommerce's own product JSON-LD is replaced, so everything links to one business node.
- **Sitemap:** cart, checkout and account pages are `noindex` and left out.
- Business facts come from the footer's visible lines. Type an address as a street line plus a "08012 Barcelona" line, hours as "Jueves a domingo" and "16 a 20 h", and link the phone (`tel:`) and social profiles, and the schema follows.
- `/llms.txt`: Markdown brief of the business, products (with allergens), FAQ and pages for assistants.

## Performance

- All CSS is inlined; there are no render-blocking requests. Block CSS loads only where the block is used.
- Front-end JavaScript is four deferred ES modules, about 11 KB minified in total, plus the 5 KB consent script. There's no jQuery outside the store pages.
- Images are WebP sub-sizes with correct `sizes`; only the LCP image is eager.
- **On the production server**, enable gzip or Brotli, HTTP/2 and long cache headers for `/wp-content/`: see [DEPLOYMENT.md](DEPLOYMENT.md). Lighthouse mobile on the local MAMP server (no compression) spends most of its LCP on the uncompressed HTML.

## Differences from the prototype

The prototype's CSS states these intents; they did not render because of bugs, and the theme implements the intent:

- The hero logo collapsed to 0×0 on phones. It now shows at 260px.
- The header was declared sticky, but `overflow: hidden` on the wrapper prevented it. It now sticks.
- The bento border glow and click ripple used `rgb(160, 18, 43 / …)`, which is invalid CSS. They now draw.

Fonts follow the prototype's stacks (`Caprasimo` → Rockwell, `Figtree` → system UI), so on macOS the site renders as the prototype does.

- **Without Rockwell** (Windows, Android): Arvo, a free slab serif close to it, is the next face in the stack. It is self-hosted as two Latin-subset WOFF2 files, declared in `src/scss/_fonts.scss` rather than `theme.json`, because WordPress names `fontFace` entries after the first family in the stack.
- **On a Mac:** nothing is downloaded.

The prototype's 320px header overflow is fixed too: below 380px, the mark, brand and order button shrink.

## Tests

```sh
npm run test:visual   # accessibility, responsive, flows, SEO
```

Each check also runs on its own:

- `test:prototype` — pixel diff against the Vue prototype (`PROTOTYPE_URL`);
- `test:editor` — editor canvas vs live page; needs WP-CLI (`WP_CLI`);
- `test:flows` — ordering flows and the WhatsApp message;
- `test:a11y` — axe;
- `test:responsive` — overflow scan in Chromium;
- `test:browsers` — overflow scan in WebKit and Firefox;
- `test:seo` — titles, canonicals, JSON-LD and the sitemap.

All of them read the site from `REJUNTE_URL`. See [tests/visual/README.md](../tests/visual/README.md).

## Sample data

Eight test products (one of them variable) are flagged with `_rejunte_sample` (placeholder prices). Remove them with:

```sh
wp post delete $(wp post list --post_type=product --meta_key=_rejunte_sample --format=ids) --force
```
