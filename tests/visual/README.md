# Visual and behaviour checks

The Playwright scripts used to build and audit the theme (2026-10-02). They currently import Playwright, sharp and axe from `web-presence/node_modules/.pnpm/…` by absolute path, call a WP-CLI wrapper `./wp`, and expect the site at `https://rejunte.local:8890` and the prototype at `http://127.0.0.1:3999`. Backlog task D8 turns them into `npm run test:visual`.

| Script | Checks |
| --- | --- |
| `compare.mjs <w> <h> <label>` | Prototype vs WordPress, pixel diff per 150px band |
| `editor-compare.mjs <postId> <path> <label>` | Editor canvas vs live page |
| `flow.mjs [width] [order]` | Add to order from cards and product page, cart, checkout |
| `wa-flow.mjs` | WhatsApp ordering: button label and link, live updates, hand-off and checkout redirects |
| `variable-flow.mjs` | A product with options, through to the WhatsApp message |
| `interact.mjs` | Phone menu, Escape, skip link, pause control, gallery keyboard |
| `axe.mjs [paths…]` | axe-core, WCAG 2.2 AA + best practices, desktop and phone |
| `overflow.mjs` | Elements outside the viewport and overflowing boxes, many widths (`WIDTHS`, `ENGINES` env) |
| `xbrowser.mjs` | WebKit and Firefox (requests proxied through Node to resolve `.local`) |
| `pages.mjs <w> <prefix> <paths…>` | Full-page screenshots |
| `seo-audit.py` | Title, description, canonical, robots, H1, alt, JSON-LD types, sitemap contents |
| `cookies.mjs` | Cookies, storage and third-party requests on a first visit and after adding to the cart |
| `wplogin.mjs` | Admin session for the editor checks, created and destroyed through WP-CLI |
