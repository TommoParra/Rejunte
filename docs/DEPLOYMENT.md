# Deploying Rejunte

How to take the site from the local MAMP install to production. The theme is ready; these steps are about the server, the data and launch day.

## 1. Server

| Requirement | Why |
| --- | --- |
| PHP 8.2+, OPcache on | The theme needs 8.1; 8.2+ is faster and supported longer |
| WordPress 6.8+ and WooCommerce 9+ | Tested on 7.1 and 11.1 |
| HTTPS with a valid certificate, HTTP/2 or HTTP/3 | Security, and many small requests in parallel |
| gzip or Brotli for HTML, CSS, JS, SVG, JSON | The front page HTML is 73 KB raw and about 14 KB compressed; without it, mobile LCP suffers |
| Long `Cache-Control` for `/wp-content/` assets | Theme files carry a version in their URL |

### Apache (`.htaccess`, above the WordPress block)

```apache
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/plain text/markdown application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/markdown application/javascript application/json image/svg+xml
</IfModule>
<IfModule mod_headers.c>
  <FilesMatch "\.(css|js|woff2|webp|avif|png|jpe?g|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
```

### Nginx

```nginx
gzip on;
gzip_types text/css text/plain text/markdown application/javascript application/json image/svg+xml;
# brotli on; brotli_types …  (if the module is installed)

location ~* \.(css|js|woff2|webp|avif|png|jpe?g|svg|ico)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
  try_files $uri =404;
}
```

### Page cache

A full-page cache (server or plugin) is welcome, with these exceptions so carts stay personal:

- **Bypass when any of these cookies is present:** `woocommerce_items_in_cart`, `woocommerce_cart_hash`, `wp_woocommerce_session_*`, `wordpress_logged_in_*`.
- **Never cache:** `/carrito/`, `/finalizar-compra/`, `/pedir-por-whatsapp/` and `/wp-json/wc/store/*`.

## 2. Install the theme

```sh
npm ci && npm run zip     # builds and writes rejunte.zip without development files
```

Upload `rejunte.zip` in Appearance → Themes → Add new, or copy the folder without `node_modules`.

## 3. Move the content

```sh
# On the local site
wp db export rejunte.sql
# Copy rejunte.sql and wp-content/uploads to the server, then on the server:
wp db import rejunte.sql
wp search-replace 'https://rejunte.local:8890' 'https://<domain>' --all-tables --precise
wp rewrite flush
wp eval 'wp_get_theme()->delete_pattern_cache();'
wp cache flush
wp db search 'rejunte.local'      # must find nothing
```

Page content stores absolute media URLs, which is why `search-replace` is needed. The theme's own files use relative paths.

## 4. Settings to review

- **Settings → Reading:** "Discourage search engines" off.
- **Appearance → Customize → Datos de contacto:** the WhatsApp number for orders. Send a test order from a phone.
- **Appearance → Customize → Privacidad y cookies:** a GA4 ID only if analytics is wanted. The consent banner then asks before loading it; add its cookies to the cookie policy.
- **WooCommerce → Settings:**
  - prices and taxes (IVA);
  - store address;
  - "Mi cuenta" stays private (there are no customer accounts).
- **Pages:** the legal pages are drafts with `[placeholders]` and a "Borrador" notice. Complete them and remove the notice.
- **Products:** delete the samples (`wp post delete $(wp post list --post_type=product --meta_key=_rejunte_sample --format=ids) --force`), set real prices, and fill in ingredients and allergens for every product.
- **Footer:** the Instagram link and the address line (street number).

## 5. Security

- **`wp-config.php`:**
  - `define( 'DISALLOW_FILE_EDIT', true );`
  - `define( 'WP_ENVIRONMENT_TYPE', 'production' );`
  - `define( 'WP_DEBUG', false );`
- **Users:**
  - replace the `admin` username with a named administrator;
  - strong passwords;
  - two-factor login (for example the *Two Factor* plugin).
- **Updates:** automatic minor and security updates.
- **Monitoring:** daily off-site backups (database and `uploads`) and uptime monitoring.
- **Already handled by the theme:** XML-RPC is off, the REST API doesn't list users to visitors, and there are no author archives or users sitemap.

## 6. After launch

- **Search engines:**
  - verify the domain in Google Search Console and Bing Webmaster Tools;
  - submit `https://<domain>/wp-sitemap.xml`;
  - create or claim the Google Business Profile with the same name, address, phone and hours as the footer.
- **Check that these resolve:** `/llms.txt`, `/robots.txt`, `/wp-sitemap.xml`.
- **Re-run the checks against the live domain** (`REJUNTE_URL=https://<domain> npm run test:visual`), plus Lighthouse on home, a product, the shop and the cart.
- **Rich Results Test:** run it on a product and on the FAQ page.
