# Rejunte — backlog to launch

Audit of 2026-10-02 against five goals: SEO/GEO, responsive, deploy-ready, user experience, and cookies plus legal pages. All code tasks from that audit were completed the same day; what's left needs data, decisions or a server from Rejunte, the gestoría or the host.

**Priority:** P0 blocks launch · P1 do before or right after launch · P2 improvement.
**Owner:** Dev (code), Content (Rejunte provides text or data), Legal (adviser or gestoría), Ops (hosting).
**Effort:** S under 2 h · M half a day · L 1–2 days.

## Where things stand

| Goal | State | In short |
| --- | --- | --- |
| SEO and GEO | Code done | FAQ with `FAQPage` data, merchant-listing fields, clean sitemap and category texts are in. Waiting on Google Business Profile and a confirmed street address. |
| Responsive, no overflows | Done | 14 page types × 10 widths (320–2560px) in Chromium, and 320/390/1440 in WebKit and Firefox: no sideways scroll. |
| Ready to deploy | Theme ready | `npm run zip` builds the package. The server, migration and launch checks are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Real data still needed (legal details, allergens, prices). |
| User experience | Done | Add-to-order toast, pickup day in the cart, a WhatsApp step that explains itself, copy-order fallback, branded empty cart, Rockwell-like display face on every OS. |
| Cookies and legal pages | Drafts live | Consent banner, cookie policy, privacy, legal notice and terms of sale are published as drafts. They need the legal data (L1) and a review. |

### Latest checks (2026-10-02)

- **Prototype parity:** 0.77% differing pixels on desktop and 1.28% on phones. The differences are the photos, the automatic tanda date and the new footer legal row.
- **Editor parity:** the editor canvas differs from the front end by 0.57% on the front page and 0.35% on a product.
- **Accessibility:** zero axe (WCAG 2.2 AA) issues on theme pages, with the consent banner open. The only finding is in WooCommerce's own cart loading skeleton.
- **Lighthouse:**
  - Desktop scores 100 in all four categories on the home page, a product, the vitrina and the cookie policy.
  - On mobile, performance is 95–100 on the same pages; the other three categories are 100. Performance is held back by the local server not compressing; see D2.
  - CLS is 0 everywhere.
- **Flows:** these pass end to end in Playwright:
  - add to order, with the toast;
  - variable product;
  - cart;
  - pickup day;
  - the WhatsApp hand-off with the full message;
  - consent banner.
- **Cookies:** none on first visit and no third-party requests. The only cookies are WooCommerce's three strictly necessary cart cookies, set after adding to the cart, and `rejunte_consent` once the notice is dismissed.

---

## Open

### Legal and content (Rejunte and the gestoría)

- [ ] **L1 · P0 · Legal + Content · M — Gather the legal data.**
  - **What:**
    - legal name or trading name;
    - NIF/NIE/CIF;
    - registered address;
    - contact email and phone;
    - Registro Mercantil details, if it is a company;
    - any sanitary registration of the workshop (RGSEAA or the Catalan register);
    - who handles privacy requests.
  - **Where it goes:** fill the `[placeholders]` in the four draft pages: Aviso legal, Política de privacidad, Política de cookies and Condiciones de venta. Then remove each page's "Borrador" notice.
  - *Done when* the gestoría has reviewed the four pages and no `[` placeholder is left.

- [ ] **L8 · P0 · Content · M — Ingredients and allergens for every product** (Reg. UE 1169/2011 art. 9 and 14; RD 126/2015).
  - **Already built:** the fields (ingredients, the 14 regulated allergens, traces, conservation). Fill them in the "Ingredientes y alérgenos" panel of each product's sidebar.
  - **Until then:** each product shows a "preguntar por WhatsApp" link instead of the list.
  - *Done when* every product page lists its allergens next to "Sumar al pedido".

- [ ] **L9 · P1 · Legal · S — Check the Catalan-language requirements** (Codi de consum de Catalunya) for consumer information and contract terms. If needed, plan Catalan versions of the legal pages (a translation plugin, or duplicated pages with `hreflang`).

- [ ] **S1 · P0 · Content · S — Confirm the business data in the footer.**
  - **Already done:** the phone is +34 655 47 97 47.
  - **To confirm:**
    - that the Instagram account `@rejunte.bcn` exists;
    - the street number for "Carrer de Verdi".
  - **Why:** these feed the `Bakery` JSON-LD and `/llms.txt`, and must match the Google Business Profile exactly (S2).

- [ ] **S2 · P1 · Content · S — Google Business Profile.**
  - Create or claim it with the same name, address, phone, hours and category ("Pastelería").
  - Add its Maps URL to the footer as a "Cómo llegar" line, so it becomes a `sameAs`/`hasMap`.

- [ ] **S4b · P1 · Content · S — Review the drafted texts.** These were written by the developer and need Rejunte's voice and facts:
  - the category descriptions (Products → Categories);
  - the eight FAQ answers on `/preguntas-frecuentes/`, especially payment, lead times and delivery.

- [ ] **S6b · P2 · Content · S — Weekly tanda routine.** The date now updates itself (the last Thursday). The flavours and photos still need updating every week in the tanda block.

- [ ] **S8 · P2 · Content · M — Richer "El taller" page.** Add the story, photos of the workshop and team, and how they work. That content is what assistants cite for "best Argentine bakery in Barcelona". Add an `AboutPage`/`Organization` founder if relevant.

- [ ] **S9 · P2 · Dev + Content · M — Reviews.** Once there are real reviews (Google), show a few on the home page. Add `aggregateRating` only if they come from the site itself, per Google's self-serving review rules.

- [ ] **U7 · P2 · Business · S — Keep a record of WhatsApp orders?** Optionally, create a WooCommerce order in a "pending WhatsApp" status just before the hand-off, so there's a list of orders and stock is deducted. This needs a decision first; it is about an hour of Dev work after that.

### Launch (Ops and Content)

- [ ] **D1 · P0 · Content · S — Remove the sample data.**
  - **Already gone:** the test order and the old returns page.
  - **To do:**
    - delete the eight sample products: `wp post delete $(wp post list --post_type=product --meta_key=_rejunte_sample --format=ids) --force`;
    - set real prices;
    - decide IVA (WooCommerce → Settings → Tax).

- [ ] **D2 · P0 · Ops · M — Production server.** Follow [docs/DEPLOYMENT.md §1](docs/DEPLOYMENT.md#1-server):
  - HTTPS;
  - HTTP/2;
  - gzip/Brotli;
  - long cache headers for assets;
  - PHP 8.2+ with OPcache;
  - page-cache exclusions for the cart.

  *Done when* Lighthouse mobile on the live home page is ≥ 95.

- [ ] **D3 · P0 · Ops · S — Migration.** Follow [docs/DEPLOYMENT.md §3](docs/DEPLOYMENT.md#3-move-the-content).
  *Done when* `wp db search rejunte.local` finds nothing.

- [ ] **D5b · P1 · Ops · S — Server-side hardening.** The theme already turns off XML-RPC, user enumeration and the users sitemap. Still to do on the server:
  - rename the `admin` user;
  - two-factor login;
  - `DISALLOW_FILE_EDIT`;
  - automatic minor and security updates;
  - daily off-site backups;
  - uptime monitoring.

- [ ] **D6b · P1 · Content · S — Test order from a real phone.** The Customizer number (Datos de contacto) is +34 655 47 97 47. Send one order from an Android phone and one from an iPhone, and check that the message arrives complete with accents, line breaks and the pickup day.

- [ ] **D7 · P1 · Dev · S — Launch smoke test on the live domain.**
  - Run `REJUNTE_URL=https://<domain> npm run test:visual`.
  - Run Lighthouse on the home page, a product, the shop and the cart.
  - Run the Rich Results Test on a product and on the FAQ page.
  - Check the share preview (Open Graph) in WhatsApp and Instagram.

- [ ] **S10 · P1 · Ops · S — Search engines after launch.**
  - Verify the domain in Google Search Console and Bing Webmaster Tools.
  - Submit `/wp-sitemap.xml`.
  - Check that `/llms.txt` and `/robots.txt` resolve on the real domain.

---

## Done

- [x] **L2–L5 · Legal pages.** Aviso legal, Política de privacidad (Spanish, replacing WordPress's English draft), Política de cookies and Condiciones de venta are built with core blocks from theme patterns (`patterns/legal-*.php`).
  - **Settings:** privacy is the privacy page in Settings → Privacy; the terms are WooCommerce's terms page.
  - **Terms content:** perishable goods are excluded from withdrawal (art. 103.d), and the hoja de reclamaciones is mentioned.
  - **Still pending:** the legal data (L1).
- [x] **L6 · Consent banner** (`inc/consent.php`, `assets/js/consent.js`).
  - **Behaviour:**
    - A brief notice while only technical cookies exist. It switches to Aceptar / Rechazar / Configurar, with equal prominence, when a service such as GA4 is set in Customizer → Privacidad y cookies.
    - The choice is stored for 13 months. Adding a new service makes the banner ask again.
  - **API:** `window.rejunteConsent.on( 'analytics', fn )`.
  - **Checks:** no layout shift and zero axe issues.
- [x] **L7 · Footer legal row.** Preguntas frecuentes · Aviso legal · Privacidad · Cookies · Condiciones de venta, plus a "Configurar cookies" button. It's editable in the Site Editor.
- [x] **L8 (fields) · Food information.**
  - **Fields:** ingredients, 14 allergens, traces and conservation, edited in the product sidebar.
  - **Where it shows:**
    - on the product page, right below the add button;
    - in the Product JSON-LD (`additionalProperty`);
    - in `/llms.txt`.
- [x] **S3 · Sitemap.** Cart, checkout and account are out of it.
- [x] **S4 · Category descriptions.** Written (see S4b for review).
- [x] **S5 · FAQ.** New `rejunte/faq` block (accessible `details`/`summary`) and page `/preguntas-frecuentes/`. Its questions feed a `FAQPage` node and `/llms.txt`.
- [x] **S6 · Automatic tanda date.** The tanda eyebrow can show the latest release day automatically (block setting).
- [x] **S7 · Merchant-listing fields.** `priceValidUntil`, `shippingDetails` (pickup only, `doesNotShip`) and `hasMerchantReturnPolicy` (perishable, linked to the terms).
- [x] **R1 · Header at 320–380px.** Fits with a 16px gutter in all three engines.
- [x] **R2 · Cart line on phones.** Three-column grid; under 380px the total moves to a second row.
- [x] **R3 · Empty cart.** "Todavía no sumaste nada" in the theme's grammar, with a link to the vitrina and the product grid below.
- [x] **R4 · Ultra-wide.** Content is capped at 1600px; the gutter grows beyond it.
- [x] **U1 · Display font everywhere.**
  - **How:** Rockwell stays first, as designed. Arvo (OFL, latin subset, 2 × WOFF2, `font-display: swap`) is self-hosted as the fallback for Windows and Android. Macs download nothing.
  - **Optional:** license a Rockwell webfont for an exact match.
- [x] **U2 · Add-to-order toast.** "Sumado al pedido · Ver pedido", `role="status"`, dismissible, respects reduced motion.
- [x] **U3 · WhatsApp step explained.**
  - **In the cart:**
    - the WhatsApp icon on the button;
    - one explanatory line;
    - a link to the terms of sale.
  - **Page title:** "Tu pedido".
- [x] **U4 · Pickup day.** A selector in the cart offers the days the workshop opens in the next two weeks, starting tomorrow. It's stored through a Store API extension and written into the message ("Retiro: sábado 10 de octubre, de 16:00 a 20:00").
- [x] **U5 · No WhatsApp on this device.** "¿No tenés WhatsApp? Copiá el pedido" copies the order to the clipboard, and the phone number is shown.
- [x] **U6 · "Mi cuenta".** The page is private, out of the sitemap and the menus. Registration is off.
- [x] **D2/D3 (docs) · Deployment guide.** [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) covers the server, compression, cache rules, migration, settings, security and post-launch checks.
- [x] **D4 · Distribution.** `.distignore`, `.gitattributes` (`export-ignore`), and `npm run zip` builds a 760 KB `rejunte.zip` without development files.
- [x] **D5 (theme) · Hardening** in `inc/hardening.php`:
  - XML-RPC and the `X-Pingback` header are off;
  - the REST user endpoints need `edit_posts`;
  - author enumeration redirects;
  - there is no users sitemap.
- [x] **D6 · WhatsApp number.** Set to +34 655 47 97 47 in Customizer → Datos de contacto.
- [x] **D8 · Test suite in the repo.** Playwright, axe and sharp are dev dependencies. The site URL is read from `REJUNTE_URL`. Run it with `npm run test:visual` or `test:prototype`, `test:editor`, `test:flows`, `test:a11y`, `test:responsive`, `test:browsers` and `test:seo`.
