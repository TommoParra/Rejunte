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
```

`build/` and `assets/css/` are committed, so the theme runs without building.

## Structure

```
inc/              PHP, one concern per file
  setup.php         theme supports, image sizes, WebP sub-sizes, template editing for pages/products
  assets.php        global CSS (inlined), editor data
  blocks.php        block registration, KSES allowances, brand images, current-page nav link
  performance.php   head cleanup
  accessibility.php skip link, pause-animations toggle, live region
  business.php      business profile parsed from the footer's visible text
  seo.php           title, description, Open Graph, JSON-LD @graph
  llms.php          /llms.txt
  woocommerce.php   store integration (only loaded when WooCommerce is active)
src/blocks/<name>/  block.json, edit.js, save.js or render.php, view.js, style.scss
src/shared/         code shared by blocks: image slot, editor controls, gallery and bento engines, cart store
src/scss/           tokens, reset, shared components, layout, prose, editor, WooCommerce
templates/ parts/ patterns/
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
| `rejunte/footer` | static | Its address, hours, phone and social lines feed the structured data. |
| `rejunte/product-hero` | dynamic | Product page header. In the editor, name, presentation, short description and photo edit in place. |
| `rejunte/product-grid` | dynamic | Product cards for the shop, categories, related products. |

Section blocks (`tanda`, `vitrina`, `encargos`) have a heading level setting: H1 when the section opens a page, H2 otherwise.

## Content

- Front page: page "Inicio", template `front-page`.
- Menu pages: "La tanda", "Encargos", "El taller" use the "Página a todo ancho" template; "La vitrina" is the WooCommerce shop (`/vitrina/`).
- Header and footer: template parts, edited in Site Editor → Patterns → Template parts. Their default logos are the theme's own files (`assets/img`), so the parts stay portable between sites.
- Products are edited in the block editor; their page template shows around them.

## Store

- "Sumar" and the product page form add to the WooCommerce cart through the Store API and work without JavaScript (plain form posts to the cart).
- WooCommerce's scripts and styles load only on cart, checkout and account pages, and on product pages with options (variable products use WooCommerce's own form).
- Pickup at the workshop is the only shipping method.

### Orders by WhatsApp

There is no payment step. The cart's button reads **Pedir por WhatsApp** and opens WhatsApp with the order already written:

```
¡Hola Rejunte! Quiero hacer este pedido:

• 2 × Alfajores de maicena (Docena) — 28 €
• 1 × Torta de crema (18 cm · 10 porciones) — 32 €

Total: 60 €

¿Cuándo lo puedo pasar a buscar?
```

- **Settings:** Appearance → Customize → **Datos de contacto** holds the number (falling back to +34 655 47 97 47), the opening and closing lines of the message, and the **Cerrar los pedidos por WhatsApp** switch. Turn the switch off when a payment gateway is added, and the normal checkout comes back.
- **How the link stays current:** the message is built in PHP from the real cart (`rejunte_whatsapp_order_text()` in `inc/woocommerce.php`). It's added to every Store API cart response as `extensions.rejunte.whatsapp_url`, so the cart button's link follows each change of quantity or item. The button uses WooCommerce's documented checkout filters (`assets/js/whatsapp-cart.js`).
- **Fallback:** `/pedir-por-whatsapp/` builds the message at the moment of the visit and redirects to WhatsApp. The checkout URL points there, so every "checkout" link in WooCommerce ends in WhatsApp, and the checkout page redirects too. An empty cart goes back to the cart.
- **All WhatsApp links follow the setting:** any `wa.me` link in block content (the encargos button, links editors add) is rewritten at render time to the configured number, keeping its message. The number is also the business's `contactPoint` in the structured data and is listed in `/llms.txt`.

## SEO and GEO

- One JSON-LD `@graph` per page: `WebSite`, `Bakery` (address, hours, phone, Instagram, price range, offer catalogue), `WebPage`/`ItemPage`/`CollectionPage`, `Product` with `Offer`, `BreadcrumbList`. WooCommerce's own product JSON-LD is replaced so everything links to one business node.
- Business facts come from the footer's visible lines. Type an address as a street line plus a "08012 Barcelona" line, hours as "Jueves a domingo" and "16 a 20 h", and link the phone (`tel:`) and social profiles, and the schema follows.
- `/llms.txt`: Markdown brief of the business and products for assistants.

## Performance

- All CSS is inlined; there are no render-blocking requests. Block CSS loads only where the block is used.
- Front-end JavaScript is four deferred ES modules, about 9 KB minified in total. There's no jQuery outside the store pages.
- Images are WebP sub-sizes with correct `sizes`; only the LCP image is eager.
- **On the production server**, enable gzip or Brotli, HTTP/2 and long cache headers for `/wp-content/`. Lighthouse mobile on the local MAMP server (no compression) spends most of its LCP on the uncompressed HTML.

## Differences from the prototype

The prototype's CSS states these intents; they did not render because of bugs, and the theme implements the intent:

- The hero logo collapsed to 0×0 on phones. It now shows at 260px.
- The header was declared sticky, but `overflow: hidden` on the wrapper prevented it. It now sticks.
- The bento border glow and click ripple used `rgb(160, 18, 43 / …)`, which is invalid CSS. They now draw.

Fonts follow the prototype's stacks exactly (`Caprasimo` → Rockwell, `Figtree` → system UI), so on macOS the site renders as the prototype does. To use the designed Caprasimo and Figtree everywhere, add their WOFF2 files under `assets/fonts` and a `fontFace` entry in `theme.json`.

## Sample data

Eight test products (one of them variable) are flagged with `_rejunte_sample` (placeholder prices). Remove them with:

```sh
wp post delete $(wp post list --post_type=product --meta_key=_rejunte_sample --format=ids) --force
```
