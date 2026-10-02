# Rejunte — backlog to launch

Audit of 2026-10-02 against five goals: SEO/GEO, responsive, deploy-ready, user experience, and cookies plus legal pages. Each task says why it matters, what to do, and how to know it's done.

**Priority:** P0 blocks launch · P1 do before or right after launch · P2 improvement.
**Owner:** Dev (code), Content (Rejunte provides text or data), Legal (adviser or gestoría), Ops (hosting).
**Effort:** S under 2 h · M half a day · L 1–2 days.

## Where things stand

| Goal | State | In short |
| --- | --- | --- |
| SEO and GEO | Partly | The technical base is complete. The business data and content are not real yet (placeholder phone, no category texts, no FAQ). |
| Responsive, no overflows | Almost | 12 page types × 10 widths × 3 engines (Chromium, WebKit, Firefox) show no sideways scroll, except the header at ≤ 356px (P0). Two small cart issues remain. |
| Ready to deploy | No | Placeholder data, missing legal pages, server configuration and the migration steps. |
| User experience | Partly | Design, editor parity, speed and accessibility are strong. The WhatsApp hand-off, add-to-order feedback, fonts outside macOS and food information need work. |
| Cookies and legal pages | No | No banner, no cookie policy, no legal notice, no terms of sale. The privacy policy is WordPress's English draft. |

### Verified as done

So these are not redone:

- **Structured data:** one linked JSON-LD graph per page (WebSite, Bakery with address and hours, Product + Offer, BreadcrumbList, ItemList).
- **Head tags:** titles, descriptions, canonicals (including paginated archives) and Open Graph.
- **Indexing:** cart, account and search are `noindex`.
- **GEO:** `/llms.txt`.
- **Markup:** one H1 per page; alt text on every image.
- **Accessibility:** axe (WCAG 2.2 AA) finds zero issues on theme pages; skip link, pause-animations control and reduced motion are in place.
- **Performance:** Lighthouse desktop 100/100/100/100. On mobile, accessibility, best practices and SEO are 100; performance is 87–98, limited by the local server's lack of compression.
- **Cookies:** no cookies on first visit and no third-party requests. After adding to the cart there are only WooCommerce's three strictly necessary cart cookies, plus one `localStorage` key for the pause-animations preference.
- **Ordering:** the WhatsApp journey is tested end to end.

---

## 1. Cookies, privacy and legal pages

The site currently sets no cookies that need consent, so under LSSI art. 22.2 and the AEPD's cookie guide a consent banner isn't legally required yet. The policy pages are, and the banner becomes mandatory the day analytics, a pixel or an embed is added. Build it now so it's ready.

- [ ] **L1 · P0 · Legal + Content · M — Gather the legal data.**
  The pages below need: legal name or trading name, NIF/NIE/CIF, registered address, contact email and phone, Registro Mercantil details if it is a company, any sanitary registration of the workshop (RGSEAA or the Catalan register), and who handles privacy requests.
  *Done when* the data sits in one document, reviewed by the gestoría.

- [ ] **L2 · P0 · Legal + Dev · S — Aviso legal** (LSSI art. 10). New page "Aviso legal", built with core blocks in the page template.
  *Done when* it's published and linked from the footer.

- [ ] **L3 · P0 · Legal + Dev · M — Política de privacidad** (RGPD art. 13, LOPDGDD).
  Replace the English draft (page ID 3) with a Spanish policy that covers what the site actually processes:
  - the WooCommerce cart session (2 days);
  - orders sent by WhatsApp, where WhatsApp/Meta acts as an independent controller;
  - customer data kept for orders and invoices;
  - the server logs.

  Set it as the privacy page in Settings → Privacy.
  *Done when* it's published, in Spanish, linked from the footer, and matches what L5 lists.

- [ ] **L4 · P0 · Legal + Dev · M — Condiciones de venta** (TRLGDCU).
  Cover:
  - prices, with or without IVA;
  - pickup only, with days and hours;
  - how an order is confirmed: WhatsApp, with no payment on the site;
  - payment on pickup;
  - cancellations for custom orders (encargos);
  - the right of withdrawal: perishable goods are excluded (art. 103.d), which must be stated;
  - the complaints channel: hoja de reclamaciones in Catalonia.

  Set it as WooCommerce's terms page. Delete or rewrite the draft "Política de devoluciones y reembolsos" (ID 17).
  *Done when* it's published, linked from the footer and from the cart (see U3).

- [ ] **L5 · P0 · Legal + Dev · S — Política de cookies** (LSSI art. 22.2).
  A table of what the site stores, with name, purpose, duration and type:
  - `woocommerce_items_in_cart`, `woocommerce_cart_hash`: session, technical;
  - `wp_woocommerce_session_*`: 2 days, technical;
  - `rj-motion` in localStorage: preference.

  Add anything new from L6/L7 as it arrives.
  *Done when* it's published and linked from the footer and from the banner.

- [ ] **L6 · P1 · Dev · M — Consent banner,** first-party with no third-party consent tool, in the theme's own look. Requirements:
  - "Aceptar", "Rechazar" and "Configurar" with equal prominence (AEPD 2023);
  - categories: technical (always on), analytics, marketing;
  - the choice is stored for 13 months and can be reopened from a "Cookies" link in the footer;
  - nothing non-essential loads before consent;
  - a small API (`window.rejunteConsent.on( 'analytics', fn )`) so future scripts load only after consent;
  - accessible: focusable, operable by keyboard, announced, doesn't trap focus or hide content;
  - built as a theme module (`inc/consent.php` and a script module); no layout shift;
  - while there are no non-essential cookies, only a brief, dismissible notice linking to L5.

  *Done when* axe passes with the banner open, Lighthouse doesn't drop, and Playwright confirms no analytics request goes out before accepting.

- [ ] **L7 · P0 · Dev · S — Footer legal links.** Add a bottom row to the footer block: "Aviso legal · Privacidad · Cookies · Condiciones de venta · Configurar cookies".
  *Done when* the links are on every page, editable in the Site Editor, and pass axe.

- [ ] **L8 · P0 · Legal + Content + Dev · M — Food information on every product** (Reg. UE 1169/2011 art. 14 and 9; RD 126/2015).
  Distance sales of food must show ingredients and **allergens** before the purchase is concluded. Add product fields for ingredients, allergens (the 14 regulated ones, as checkboxes), "may contain" traces and conservation. Show them on the product page and add them to the Product JSON-LD.
  *Done when* every product shows its allergens before "Sumar al pedido".

- [ ] **L9 · P1 · Legal · S — Check the Catalan-language requirements** (Codi de consum de Catalunya) for consumer information and contract terms. If needed, plan Catalan versions of the legal pages (a translation plugin, or duplicated pages with `hreflang`).

## 2. SEO and GEO

- [ ] **S1 · P0 · Content · S — Real business data in the footer.** The footer phone is still the prototype's placeholder, `+34 600 000 000`, and it feeds `telephone` in the JSON-LD and `/llms.txt`. Replace it with the real number (linked with `tel:`), confirm the Instagram account `@rejunte.bcn` exists, and confirm the address line. Consider "Carrer de Verdi, N" with the street number.
  *Done when* the JSON-LD `Bakery` node shows the real NAP data, identical to Google Business Profile (S2).

- [ ] **S2 · P1 · Content · S — Google Business Profile.** Create or claim it with the same name, address, phone, hours and category ("Pastelería"). Add its Maps URL to the footer (a "Cómo llegar" line) so it becomes a `sameAs`/`hasMap`.

- [ ] **S3 · P1 · Dev · S — Keep `noindex` pages out of the sitemap.** `/wp-sitemap-posts-page-1.xml` lists `/carrito/`, `/finalizar-compra/` and `/mi-cuenta/`, which are `noindex`. Exclude them with the `wp_sitemaps_posts_query_args` filter in `inc/woocommerce.php`.
  *Done when* the sitemap lists only indexable URLs.

- [ ] **S4 · P1 · Content · S — Category descriptions.** Alfajores, Facturas, Tortas and Cajas have no description, so their meta description falls back to the generic business line. Write two or three sentences each (Products → Categories). They show as the page lead and feed the meta description.

- [ ] **S5 · P1 · Content + Dev · M — FAQ page and section with `FAQPage` data**, the strongest single GEO signal for "how do I order / when can I pick up" questions. Cover:
  - how to order;
  - lead time for cakes;
  - pickup days;
  - payment;
  - allergens;
  - delivery (none);
  - sizes and servings.

  Build a `rejunte/faq` block (accessible disclosure markup) whose questions also feed the JSON-LD graph and `/llms.txt`.

- [ ] **S6 · P1 · Content · S — Fresh "tanda" content.** "Tanda del 21 de agosto" is stale. Agree a weekly routine: update the tanda block every Thursday, which also helps freshness signals. Optional: make the date automatic in the block.

- [ ] **S7 · P2 · Dev · S — Merchant-listing fields in the Product JSON-LD:**
  - `shippingDetails`: pickup only, cost 0, Barcelona;
  - `hasMerchantReturnPolicy`: none, perishable;
  - `priceValidUntil`.

  Google recommends them for merchant listings.
  *Done when* the Rich Results Test shows no warnings on a product.

- [ ] **S8 · P2 · Content · M — Richer "El taller" page:** the story, photos of the workshop and team, how they work. That content is what assistants cite for "best Argentine bakery in Barcelona". Add an `AboutPage`/`Organization` founder if relevant.

- [ ] **S9 · P2 · Dev + Content · M — Reviews.** Once there are real reviews (Google), show a few on the home page and add `aggregateRating` only if they come from the site itself, per Google's self-serving review rules.

- [ ] **S10 · P1 · Ops · S — After launch:**
  - verify the domain in Google Search Console and Bing Webmaster Tools;
  - submit `/wp-sitemap.xml`;
  - check that `/llms.txt` and `/robots.txt` resolve on the real domain;
  - re-run the Rich Results Test on home, a product and a category.

## 3. Responsive and usability bugs

- [ ] **R1 · P0 · Dev · S — Header overflows on small phones.**
  - At 320px the bar needs 331px (empty cart) or 356px ("PEDIR · 1"), so the whole page scrolls sideways. Confirmed in Chromium, WebKit and Firefox on every page.
  - At 340px it overflows with an item in the cart. At 360px the right gutter shrinks to 4px.
  - The prototype has the same bug.

  Fix below about 380px (in `src/blocks/header/style.scss`): smaller mark and brand size, a tighter gap, and the CTA with smaller padding or only its count ("· 1") next to an order icon.
  *Done when* `overflow.mjs` (Playwright; 320/340/360/390) reports no header findings in all three engines and the gutter stays at least 16px.

- [ ] **R2 · P2 · Dev · S — Cart line on phones.** At ≤ 414px the product cell's quantity stepper and delete icon need 159px in a 120–144px column. Let the quantity row wrap, or span it across the total column, in `src/scss/woocommerce.scss`.
  *Done when* there are no `td.wc-block-cart-item__product` overflow findings.

- [ ] **R3 · P1 · Dev + Content · S — Empty cart in the brand's voice.** It shows WooCommerce's sad-face icon centred over a left-aligned "¡Tu carrito está actualmente vacío!", which sits jammed against the product row. Rewrite it in the cart page content ("Todavía no sumaste nada", a short line, a "Ver la vitrina" button), align and space it in the theme's grammar, and keep the product grid below.

- [ ] **R4 · P2 · Dev · S — Ultra-wide screens (≥ 1920px).** The layout holds up at 2560px, but the hero, bento tiles and price row stretch very wide. Consider capping content at about 1600px with the gutter growing beyond it.

## 4. User experience

- [ ] **U1 · P1 · Dev · M — Same typography on every device.** The display font is Rockwell, which only macOS and Office installs have; Windows and Android visitors get Georgia, a different brand impression. Either self-host the designed Caprasimo and Figtree (WOFF2, Latin subset, `font-display: swap`, preload the display face, add them in `theme.json`) or license a Rockwell webfont. Then re-baseline the prototype comparison.
  *Done when* the brand looks the same on Windows and Android (BrowserStack or real devices), with CLS still 0.

- [ ] **U2 · P1 · Dev · S — Feedback when adding to the order.** Today the button changes to "Sumado · N" and the header count updates, which is easy to miss lower on the page. Add a small toast ("Sumado al pedido · Ver pedido") that is polite (`role="status"`), dismissible and respects reduced motion.

- [ ] **U3 · P1 · Dev + Content · S — Explain the WhatsApp step in the cart.** Add, near "Pedir por WhatsApp":
  - one line: "Se abre WhatsApp con tu pedido escrito. Lo confirmamos por ahí y lo retirás en el taller.";
  - a WhatsApp icon on the button;
  - a link to the terms of sale (L4).

  Rename the page title "Carrito" to "Tu pedido".

- [ ] **U4 · P1 · Dev · M — Choose the pickup day before sending.** "Todo se hace el día anterior": add a pickup-day selector (Thursday to Sunday, next 2 weeks) in the cart. Store it in the session through a Store API extension and put it in the WhatsApp message ("Retiro: sábado 10 de octubre"). This removes the back-and-forth "¿cuándo?" from every chat.

- [ ] **U5 · P2 · Dev · S — No WhatsApp on this device.** On desktop without WhatsApp, `wa.me` falls back to WhatsApp Web. Under the button, add "¿No tenés WhatsApp? Copiá el pedido" (copy to clipboard) and the phone number.

- [ ] **U6 · P1 · Dev · S — Remove "Mi cuenta".** With no accounts, payments or order history, the page is dead weight. Unpublish it (or keep it only for admins) and turn off account creation everywhere (registration is already off).

- [ ] **U7 · P2 · Business · S — Keep a record of WhatsApp orders.** Optionally create a WooCommerce order in a "pending WhatsApp" status just before handing off, so there's a list of orders and stock can be deducted. Decide whether that's wanted.

## 5. Deployment

- [ ] **D1 · P0 · Content · S — Remove test data:**
  - eight sample products: `wp post delete $(wp post list --post_type=product --meta_key=_rejunte_sample --format=ids) --force`;
  - test order #46;
  - set real prices on the three real products and decide IVA (WooCommerce → Settings → Tax).

- [ ] **D2 · P0 · Ops · M — Server for production:**
  - HTTPS with a valid certificate;
  - HTTP/2 or HTTP/3;
  - **gzip/Brotli** (Lighthouse mobile on the local server loses most of its LCP to the uncompressed 73 KB HTML);
  - long `Cache-Control` for `/wp-content/` assets;
  - PHP 8.2+ and OPcache.

  A full-page cache must bypass `woocommerce_items_in_cart` and `wp_woocommerce_session_*` and exclude `/carrito/` and `/pedir-por-whatsapp/`.
  *Done when* Lighthouse mobile on the live home page is ≥ 95.

- [ ] **D3 · P0 · Ops · S — Migration:**
  - copy the database and `wp-content/uploads`;
  - run `wp search-replace 'https://rejunte.local:8890' 'https://<domain>' --all-tables --precise` (page content holds absolute media URLs);
  - `wp rewrite flush`;
  - `wp eval 'wp_get_theme()->delete_pattern_cache();'`.

  *Done when* no `rejunte.local` string is left in the database (`wp db search rejunte.local`).

- [ ] **D4 · P0 · Dev · S — Ship the theme without development files.** Add a `.distignore` (`node_modules`, `src`, `tests`, `package*.json`, `.editorconfig`, `backlog.md`) and an `npm run zip` (`wp-scripts plugin-zip` or a script). `build/` and `assets/` must be included.

- [ ] **D5 · P1 · Ops · S — Hardening:**
  - replace the `admin` username with a named administrator;
  - two-factor login;
  - disable XML-RPC;
  - `DISALLOW_FILE_EDIT`;
  - automatic minor and security updates;
  - daily off-site backups;
  - uptime monitoring.

- [ ] **D6 · P1 · Content · S — Real WhatsApp number in the Customizer.** Set it under Datos de contacto. Today the fallback +34 655 47 97 47 is in use. Send a test order from a real phone.

- [ ] **D7 · P1 · Dev · S — Launch smoke test on the live domain:**
  - run the Playwright suite: the prototype comparison, editor parity, the WhatsApp flow, axe and the overflow scan;
  - Lighthouse on home, product, shop and cart;
  - check the share preview (Open Graph) in WhatsApp and Instagram.

- [ ] **D8 · P2 · Dev · S — Make the test scripts runnable from the repo.** The comparison, flow, axe and overflow scripts from this audit are in `tests/visual/` (see its README), but they still import Playwright, sharp and axe from another project by absolute path. Add `@playwright/test`, `@axe-core/playwright` and `sharp` as dev dependencies, read the site URL from an environment variable, and add `npm run test:visual`, so every release is checked the same way.
