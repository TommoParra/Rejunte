# Visual and behaviour checks

Playwright, axe-core and sharp checks used to build and audit the theme. They run against a live WordPress install (local or production) and need the Playwright browsers (`npx playwright install` once).

| Variable | Default | Used for |
| --- | --- | --- |
| `REJUNTE_URL` | `https://rejunte.local:8890` | The site under test |
| `PROTOTYPE_URL` | `http://127.0.0.1:3999/portfolio/rejunte?preview=true` | The Vue prototype (`npm run test:prototype` only) |
| `WP_CLI` | `wp` | How to run WP-CLI for the site (`npm run test:editor` only; it creates a temporary admin session) |

| Command | Checks |
| --- | --- |
| `npm run test:visual` | a11y + responsive + flows + seo |
| `npm run test:a11y` | axe-core, WCAG 2.2 AA + best practices, desktop and phone, cookie banner included |
| `npm run test:responsive` | Elements outside the viewport and overflowing boxes, 12 page types × 10 widths (`WIDTHS`, `ENGINES` to narrow or widen) |
| `npm run test:browsers` | The same in WebKit and Firefox |
| `npm run test:flows` | WhatsApp ordering (button, live link, hand-off, checkout redirect), menu, keyboard, pause control, gallery |
| `npm run test:seo` | Title, description, canonical, robots, H1, alt text, JSON-LD types, sitemap contents |
| `npm run test:prototype` | Prototype vs WordPress, pixel diff by 150px band, at 1440 and 390 |
| `npm run test:editor` | Block editor canvas vs live front page |

Other scripts: `flow.mjs` (add to order from cards and product page, cart, optional test order), `variable-flow.mjs` (a product with options, needs the sample "Caja de alfajores"), `pages.mjs` (full-page screenshots), `cookies.mjs` (cookies and third-party requests on a first visit).

Screenshots and diffs are written to `tests/visual/output/` (not committed).
