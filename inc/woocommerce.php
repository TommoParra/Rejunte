<?php
/**
 * WooCommerce integration.
 *
 * The prototype's order ("Sumar", "Pedir · N") becomes the WooCommerce cart.
 * Static blocks keep their saved markup; this module fills in what only the
 * store knows at render time (live price, cart count, form targets), trims the
 * store's front-end weight to the pages that need it, and describes products in
 * the theme's structured data.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/*
 * -----------------------------------------------------------------------------
 * Product data
 * -----------------------------------------------------------------------------
 */

/**
 * "Presentación" (Docena, Media docena, 18 cm · 10 porciones): the small label
 * above a product's name, stored on the product and exposed to the editor.
 */
function rejunte_register_product_meta(): void {
	register_post_meta(
		'product',
		'rejunte_kicker',
		array(
			'type'              => 'string',
			'single'            => true,
			'default'           => '',
			'show_in_rest'      => true,
			'sanitize_callback' => 'sanitize_text_field',
			'auth_callback'     => static fn( $allowed, $meta_key, $post_id ) => current_user_can( 'edit_post', $post_id ),
		)
	);
}
add_action( 'init', 'rejunte_register_product_meta' );

/**
 * The same field in the product data panel, next to the price — only when
 * products are edited in the classic editor. In the block editor it is typed in
 * place on the product page preview, and a second field in the form below would
 * save its stale value over it.
 */
function rejunte_product_kicker_field(): void {
	if ( use_block_editor_for_post_type( 'product' ) ) {
		return;
	}
	woocommerce_wp_text_input(
		array(
			'id'          => 'rejunte_kicker',
			'label'       => __( 'Presentación', 'rejunte' ),
			'placeholder' => __( 'Docena, media docena, 18 cm · 10 porciones…', 'rejunte' ),
			'desc_tip'    => true,
			'description' => __( 'Se muestra en pequeño sobre el nombre del producto.', 'rejunte' ),
		)
	);
}
add_action( 'woocommerce_product_options_pricing', 'rejunte_product_kicker_field' );

/**
 * @param WC_Product $product Product being saved.
 */
function rejunte_save_product_kicker( WC_Product $product ): void {
	if ( use_block_editor_for_post_type( 'product' ) ) {
		return;
	}
	// phpcs:ignore WordPress.Security.NonceVerification.Missing -- WooCommerce verifies the product form nonce before this hook.
	if ( isset( $_POST['rejunte_kicker'] ) ) {
		$product->update_meta_data( 'rejunte_kicker', sanitize_text_field( wp_unslash( $_POST['rejunte_kicker'] ) ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	}
}
add_action( 'woocommerce_admin_process_product_object', 'rejunte_save_product_kicker' );

/**
 * Edit products in the block editor, like every other piece of content, so the
 * description is made of blocks and the product page is edited as it looks.
 *
 * @param bool   $use       Whether to use the block editor.
 * @param string $post_type Post type.
 */
function rejunte_block_editor_for_products( bool $use, string $post_type ): bool {
	return 'product' === $post_type ? true : $use;
}
add_filter( 'use_block_editor_for_post_type', 'rejunte_block_editor_for_products', 20, 2 );

/**
 * The short description is edited in place on the product page preview (and in
 * the sidebar's excerpt panel); WooCommerce's separate box would save over it.
 */
function rejunte_remove_short_description_box(): void {
	if ( function_exists( 'use_block_editor_for_post_type' ) && use_block_editor_for_post_type( 'product' ) ) {
		remove_meta_box( 'postexcerpt', 'product', 'normal' );
	}
}
add_action( 'add_meta_boxes', 'rejunte_remove_short_description_box', 40 );

/**
 * WooCommerce's own add-to-cart button (products with options) speaks like the
 * rest of the site.
 */
function rejunte_add_to_cart_text(): string {
	return __( 'Sumar al pedido', 'rejunte' );
}
add_filter( 'woocommerce_product_single_add_to_cart_text', 'rejunte_add_to_cart_text' );

/**
 * "14 €" rather than "14,00 €".
 */
add_filter( 'woocommerce_price_trim_zeros', '__return_true' );

/**
 * Units of each product in the cart.
 *
 * @return array<int, int> Product ID → quantity.
 */
function rejunte_cart_quantities(): array {
	if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
		return array();
	}
	$quantities = array();
	foreach ( WC()->cart->get_cart() as $item ) {
		$id                = (int) ( $item['variation_id'] ?: $item['product_id'] );
		$quantities[ $id ] = ( $quantities[ $id ] ?? 0 ) + (int) $item['quantity'];
	}
	return $quantities;
}

/**
 * Units in the cart.
 */
function rejunte_cart_count(): int {
	return function_exists( 'WC' ) && WC()->cart ? (int) WC()->cart->get_cart_contents_count() : 0;
}

/**
 * Display price of a product in the theme's format ("14 €", "9,50 €").
 */
function rejunte_product_price( WC_Product $product ): string {
	if ( '' === $product->get_price() ) {
		return '';
	}
	// Products with options show their range: "8–14 €".
	if ( $product->is_type( 'variable' ) ) {
		$min = (float) $product->get_variation_price( 'min', true );
		$max = (float) $product->get_variation_price( 'max', true );
		if ( $min !== $max ) {
			return str_replace( ' €', '', rejunte_format_euros( $min ) ) . '–' . rejunte_format_euros( $max );
		}
	}
	return rejunte_format_euros( (float) wc_get_price_to_display( $product ) );
}

/*
 * -----------------------------------------------------------------------------
 * Front end: store connection and live data in static blocks
 * -----------------------------------------------------------------------------
 */

/**
 * What the view modules need to talk to the store. Printed as JSON data, not
 * script, and only where a block that adds to the order is on the page (block
 * themes render the template before wp_head, so the flag is set by then).
 */
function rejunte_store_config(): void {
	if ( is_admin() || ! rejunte_page_has_order_blocks() ) {
		return;
	}
	$config = array(
		'api'     => esc_url_raw( rest_url( 'wc/store/v1/' ) ),
		'nonce'   => wp_create_nonce( 'wc_store_api' ),
		'cartUrl' => wc_get_cart_url(),
		'i18n'    => array(
			/* translators: 1: product name, 2: units in the order. */
			'added' => __( '%1$s: %2$s en el pedido', 'rejunte' ),
		),
	);
	printf(
		'<script type="application/json" id="rejunte-store">%s</script>' . "\n",
		wp_json_encode( $config, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG )
	);
}
add_action( 'wp_footer', 'rejunte_store_config', 1 );

/**
 * Whether the page rendered any block that adds to the order. Set while
 * rendering, read in the footer.
 *
 * @param bool|null $set Mark the page when true.
 */
function rejunte_page_has_order_blocks( ?bool $set = null ): bool {
	static $has = false;
	if ( true === $set ) {
		$has = true;
	}
	return $has;
}

/**
 * Header: the order button shows the cart count and leads to the cart once
 * there is something in it.
 *
 * @param string $content Block HTML.
 */
function rejunte_render_header_cart( string $content ): string {
	$count     = rejunte_cart_count();
	$processor = new WP_HTML_Tag_Processor( $content );
	if ( ! $processor->next_tag( array( 'class_name' => 'rj-nav__cta' ) ) ) {
		return $content;
	}
	$processor->set_attribute( 'data-cart-url', wc_get_cart_url() );
	$label = (string) $processor->get_attribute( 'data-label' );
	if ( $count ) {
		$processor->set_attribute( 'href', wc_get_cart_url() );
	}
	$content = $processor->get_updated_html();

	if ( $count && $label ) {
		$content = (string) preg_replace(
			'#(<a\b[^>]*\bclass="rj-nav__cta"[^>]*>).*?(</a>)#s',
			'${1}' . esc_html( $label . ' · ' . $count ) . '${2}',
			$content,
			1
		);
	}
	return $content;
}
add_filter( 'render_block_rejunte/header', 'rejunte_render_header_cart' );

/**
 * Price card linked to a product: the store's price, link and availability,
 * and the count already in the cart.
 *
 * @param string               $content Block HTML.
 * @param array<string, mixed> $block   Parsed block.
 */
function rejunte_render_price_card( string $content, array $block ): string {
	$product = ! empty( $block['attrs']['productId'] ) ? wc_get_product( (int) $block['attrs']['productId'] ) : null;

	// With the store active, a card can only add what the store sells. An
	// unlinked card (or one whose product needs options chosen first) leads to
	// the product or the shop instead of offering a button that cannot work.
	if ( ! $product || ! $product->is_type( 'simple' ) ) {
		$url = $product ? $product->get_permalink() : wc_get_page_permalink( 'shop' );
		return (string) preg_replace_callback(
			'#<form class="rj-price__form"[^>]*>\s*(<button\b[^>]*>(.*?)</button>)\s*</form>|<button\b[^>]*data-rj-add[^>]*>(.*?)</button>#s',
			static fn( $m ) => sprintf(
				'<a class="rj-button rj-button--ghost" href="%1$s">%2$s</a>',
				esc_url( $url ),
				$product ? esc_html__( 'Elegir', 'rejunte' ) : ( '' !== ( $m[2] ?? '' ) ? $m[2] : ( $m[3] ?? '' ) )
			),
			$content,
			1
		);
	}

	rejunte_page_has_order_blocks( true );

	$id       = $product->get_id();
	$quantity = rejunte_cart_quantities()[ $id ] ?? 0;
	$price    = rejunte_product_price( $product );

	$processor = new WP_HTML_Tag_Processor( $content );
	while ( $processor->next_tag() ) {
		$tag = $processor->get_tag();
		if ( 'A' === $tag ) {
			$processor->set_attribute( 'href', $product->get_permalink() );
		} elseif ( 'FORM' === $tag ) {
			$processor->set_attribute( 'action', wc_get_cart_url() );
		} elseif ( 'BUTTON' === $tag && ( ! $product->is_purchasable() || ! $product->is_in_stock() ) ) {
			$processor->set_attribute( 'disabled', true );
		}
	}
	$content = $processor->get_updated_html();

	if ( $price ) {
		$content = (string) preg_replace(
			'#(<span class="rj-price__amount">).*?(</span>)#s',
			'${1}' . esc_html( $price ) . '${2}',
			$content,
			1
		);
	}

	$label = null;
	if ( ! $product->is_in_stock() ) {
		$label = __( 'Agotado', 'rejunte' );
	} elseif ( $quantity && preg_match( '#data-label-added="([^"]*)"#', $content, $added ) ) {
		$label = html_entity_decode( $added[1], ENT_QUOTES, 'UTF-8' ) . ' · ' . $quantity;
	}
	if ( null !== $label ) {
		$content = (string) preg_replace( '#(<button\b[^>]*>).*?(</button>)#s', '${1}' . esc_html( $label ) . '${2}', $content, 1 );
	}

	return $content;
}
add_filter( 'render_block_rejunte/price-card', 'rejunte_render_price_card', 10, 2 );

/**
 * The shop has no term description; its lead is the shop page's excerpt, shown
 * in the same place the template shows a category's description.
 *
 * @param string               $content Rendered block.
 * @param array<string, mixed> $block   Parsed block.
 */
function rejunte_shop_lead( string $content, array $block ): string {
	if ( '' !== trim( $content ) || ! is_shop() ) {
		return $content;
	}
	$shop = get_post( wc_get_page_id( 'shop' ) );
	if ( ! $shop || ! has_excerpt( $shop ) ) {
		return $content;
	}
	$class = trim( 'wp-block-term-description ' . ( $block['attrs']['className'] ?? '' ) );
	return sprintf( '<div class="%1$s"><p>%2$s</p></div>', esc_attr( $class ), esc_html( $shop->post_excerpt ) );
}
add_filter( 'render_block_core/term-description', 'rejunte_shop_lead', 10, 2 );

/**
 * Pages whose content is the store itself.
 */
function rejunte_is_store_page(): bool {
	return is_cart() || is_checkout() || is_account_page() || is_wc_endpoint_url();
}

/**
 * Keep WooCommerce's scripts and styles to the pages that use them.
 *
 * Everywhere else (the front page, product pages, the shop) the theme's own
 * blocks draw the store and talk to it through the Store API, so jQuery, the
 * cart fragments script, order attribution and the classic store CSS would be
 * dead weight on every visit.
 */
function rejunte_trim_store_assets(): void {
	if ( is_admin() || rejunte_is_store_page() ) {
		return;
	}
	// Variable and grouped products use WooCommerce's own add-to-cart form.
	if ( is_product() ) {
		$product = wc_get_product( get_queried_object_id() );
		if ( $product && ! $product->is_type( 'simple' ) ) {
			return;
		}
	}

	foreach ( array( 'woocommerce-layout', 'woocommerce-smallscreen', 'woocommerce-general', 'woocommerce-blocktheme', 'woocommerce-inline', 'wc-blocks-style', 'brands-styles' ) as $style ) {
		wp_dequeue_style( $style );
	}
	foreach ( array( 'woocommerce', 'wc-add-to-cart', 'wc-cart-fragments', 'sourcebuster-js', 'wc-order-attribution', 'wc-single-product', 'zoom', 'flexslider', 'photoswipe-ui-default', 'photoswipe', 'jquery-blockui', 'js-cookie', 'wc-add-to-cart-variation' ) as $script ) {
		wp_dequeue_script( $script );
	}
}
add_action( 'wp_enqueue_scripts', 'rejunte_trim_store_assets', 100 );
// WooCommerce adds its blocks stylesheet late, from the footer; catch it there too.
add_action( 'wp_footer', 'rejunte_trim_store_assets', 1 );

/**
 * Body class that scopes the store styling.
 *
 * @param string[] $classes Body classes.
 * @return string[]
 */
function rejunte_store_body_class( array $classes ): array {
	if ( rejunte_is_store_page() ) {
		$classes[] = 'rj-store-page';
	}
	return $classes;
}
add_filter( 'body_class', 'rejunte_store_body_class' );

/**
 * The store pages get the theme's styling of WooCommerce's own blocks.
 */
function rejunte_store_styles(): void {
	$file = REJUNTE_DIR . '/assets/css/woocommerce.css';
	if ( ! file_exists( $file ) || ( ! is_admin() && ! rejunte_is_store_page() ) ) {
		return;
	}
	wp_enqueue_style( 'rejunte-woocommerce', rejunte_asset_url( 'css/woocommerce.css' ), array(), (string) filemtime( $file ) );
	wp_style_add_data( 'rejunte-woocommerce', 'path', $file );
}
add_action( 'enqueue_block_assets', 'rejunte_store_styles' );

/**
 * No "generator" tag announcing the WooCommerce version.
 */
function rejunte_remove_store_generator(): void {
	remove_action( 'get_the_generator_html', 'wc_generator_tag' );
	remove_action( 'get_the_generator_xhtml', 'wc_generator_tag' );
}
add_action( 'init', 'rejunte_remove_store_generator' );

/*
 * -----------------------------------------------------------------------------
 * Product cards (rejunte/product-grid)
 * -----------------------------------------------------------------------------
 */

/**
 * Products a grid shows, by its source.
 *
 * @param array<string, mixed> $attributes Block attributes.
 * @param WP_Block             $block      Block instance.
 * @return WC_Product[]
 */
function rejunte_product_grid_products( array $attributes, WP_Block $block ): array {
	$count = max( 1, (int) $attributes['count'] );
	$base  = array(
		'status'     => 'publish',
		'visibility' => 'catalog',
		'orderby'    => 'menu_order',
		'order'      => 'ASC',
		'limit'      => $count,
	);

	switch ( $attributes['source'] ) {
		case 'query':
			global $wp_query;
			if ( $wp_query && ( is_shop() || is_product_taxonomy() || ( is_search() && 'product' === get_query_var( 'post_type' ) ) ) ) {
				return array_values( array_filter( array_map( 'wc_get_product', (array) $wp_query->posts ) ) );
			}
			return wc_get_products( array_merge( $base, array( 'limit' => 12 ) ) );

		case 'related':
			$current = (int) ( $block->context['postId'] ?? get_the_ID() );
			$ids     = $current ? wc_get_related_products( $current, $count ) : array();
			// Few products, few shared categories: fill up with the rest of the vitrina.
			if ( count( $ids ) < $count ) {
				$more = wc_get_products( array_merge( $base, array( 'exclude' => array_merge( $ids, array( $current ) ), 'limit' => $count - count( $ids ), 'return' => 'ids' ) ) );
				$ids  = array_merge( $ids, $more );
			}
			return array_values( array_filter( array_map( 'wc_get_product', $ids ) ) );

		case 'category':
			$term = get_term( (int) $attributes['category'], 'product_cat' );
			return $term && ! is_wp_error( $term ) ? wc_get_products( array_merge( $base, array( 'category' => array( $term->slug ) ) ) ) : array();

		default:
			return wc_get_products( $base );
	}
}

/**
 * One product as a price card with its photo, in the same markup as the front
 * page's price cards.
 *
 * @param WC_Product           $product    Product.
 * @param array<string, mixed> $attributes Grid attributes (button labels).
 * @param int                  $level      Heading level of the product name.
 */
function rejunte_product_card( WC_Product $product, array $attributes, int $level = 2 ): string {
	$id       = $product->get_id();
	$name_id  = 'rj-card-' . $id;
	$quantity = rejunte_cart_quantities()[ $id ] ?? 0;
	$label    = (string) $attributes['buttonLabel'];
	$added    = (string) $attributes['addedLabel'];
	$kicker   = (string) $product->get_meta( 'rejunte_kicker' );
	$price    = rejunte_product_price( $product );
	$tag      = 'h' . min( 6, max( 2, $level ) );

	$image = $product->get_image_id()
		? wp_get_attachment_image(
			$product->get_image_id(),
			'rejunte-600',
			false,
			array(
				'class'   => 'rj-image__img',
				'alt'     => '',
				'sizes'   => '(max-width: 62rem) 100vw, 30vw',
				'loading' => 'lazy',
			)
		)
		: '<span class="rj-image__placeholder"><span class="rj-image__mark" aria-hidden="true">✳</span></span>';

	if ( $product->is_type( 'simple' ) && $product->is_purchasable() && $product->is_in_stock() ) {
		$action = sprintf(
			'<form class="rj-price__form" method="post" action="%1$s"><button type="submit" name="add-to-cart" value="%2$d" class="rj-button rj-button--ghost" aria-describedby="%3$s" data-rj-add="" data-label="%4$s" data-label-added="%5$s">%6$s</button></form>',
			esc_url( wc_get_cart_url() ),
			$id,
			esc_attr( $name_id ),
			esc_attr( $label ),
			esc_attr( $added ),
			esc_html( $quantity ? $added . ' · ' . $quantity : $label )
		);
	} elseif ( ! $product->is_in_stock() ) {
		$action = sprintf( '<span class="rj-button rj-button--ghost" aria-disabled="true">%s</span>', esc_html__( 'Agotado', 'rejunte' ) );
	} else {
		$action = sprintf( '<a class="rj-button rj-button--ghost" href="%1$s" aria-describedby="%2$s">%3$s</a>', esc_url( $product->get_permalink() ), esc_attr( $name_id ), esc_html__( 'Elegir', 'rejunte' ) );
	}

	ob_start();
	?>
	<article class="rj-price rj-price--product">
		<a class="rj-price__media" href="<?php echo esc_url( $product->get_permalink() ); ?>" tabindex="-1" aria-hidden="true">
			<span class="rj-image" data-tone="mid"><?php echo $image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- From wp_get_attachment_image(). ?></span>
		</a>
		<?php if ( $kicker ) : ?>
			<span class="rj-price__kicker"><?php echo esc_html( $kicker ); ?></span>
		<?php endif; ?>
		<<?php echo esc_html( $tag ); ?> class="rj-price__name" id="<?php echo esc_attr( $name_id ); ?>"><a href="<?php echo esc_url( $product->get_permalink() ); ?>"><?php echo esc_html( $product->get_name() ); ?></a></<?php echo esc_html( $tag ); ?>>
		<?php if ( $product->get_short_description() ) : ?>
			<p class="rj-price__body"><?php echo wp_kses_post( wp_strip_all_tags( $product->get_short_description() ) ); ?></p>
		<?php endif; ?>
		<div class="rj-price__foot">
			<span class="rj-price__amount"><?php echo esc_html( $price ); ?></span>
			<?php echo $action; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped above. ?>
		</div>
	</article>
	<?php
	return (string) ob_get_clean();
}

/**
 * Category chips above a product grid: "Todo" plus every category with
 * products, the current one marked.
 */
function rejunte_product_category_nav(): string {
	$terms = get_terms(
		array(
			'taxonomy'   => 'product_cat',
			'hide_empty' => true,
			'orderby'    => 'menu_order',
		)
	);
	if ( is_wp_error( $terms ) || count( $terms ) < 2 ) {
		return '';
	}

	$current = is_product_category() ? get_queried_object_id() : 0;
	$items   = sprintf(
		'<li><a class="rj-chip" href="%1$s"%2$s>%3$s</a></li>',
		esc_url( wc_get_page_permalink( 'shop' ) ),
		$current ? '' : ' aria-current="page"',
		esc_html__( 'Todo', 'rejunte' )
	);
	foreach ( $terms as $term ) {
		$items .= sprintf(
			'<li><a class="rj-chip" href="%1$s"%2$s>%3$s</a></li>',
			esc_url( (string) get_term_link( $term ) ),
			$current === $term->term_id ? ' aria-current="page"' : '',
			esc_html( $term->name )
		);
	}

	return '<nav class="rj-cats" aria-label="' . esc_attr__( 'Categorías', 'rejunte' ) . '"><ul class="rj-chips">' . $items . '</ul></nav>';
}

/**
 * Pagination for the main product query.
 */
function rejunte_product_grid_pagination(): string {
	global $wp_query;
	if ( ! $wp_query || $wp_query->max_num_pages < 2 ) {
		return '';
	}
	$links = paginate_links(
		array(
			'total'     => $wp_query->max_num_pages,
			'current'   => max( 1, (int) get_query_var( 'paged' ) ),
			'prev_text' => __( 'Anteriores', 'rejunte' ),
			'next_text' => __( 'Siguientes', 'rejunte' ),
			'type'      => 'list',
		)
	);
	return $links ? '<nav class="rj-pagination" aria-label="' . esc_attr__( 'Páginas de la vitrina', 'rejunte' ) . '">' . $links . '</nav>' : '';
}

/*
 * -----------------------------------------------------------------------------
 * Structured data and llms.txt
 * -----------------------------------------------------------------------------
 */

/**
 * WooCommerce prints its own product JSON-LD; the theme's graph replaces it so
 * products are linked to the business node rather than described in isolation.
 */
function rejunte_remove_store_schema(): void {
	if ( function_exists( 'WC' ) && WC()->structured_data ) {
		remove_action( 'wp_footer', array( WC()->structured_data, 'output_structured_data' ), 10 );
		remove_action( 'woocommerce_email_order_details', array( WC()->structured_data, 'output_email_structured_data' ), 30 );
	}
}
add_action( 'init', 'rejunte_remove_store_schema', 20 );

/**
 * A product as a schema.org Product with its offer.
 *
 * @return array<string, mixed>
 */
function rejunte_product_schema( WC_Product $product ): array {
	$home      = home_url( '/' );
	$permalink = $product->get_permalink();
	$images    = array_filter(
		array_map(
			static fn( $id ) => wp_get_attachment_image_url( (int) $id, 'full' ),
			array_merge( array( $product->get_image_id() ), $product->get_gallery_image_ids() )
		)
	);
	$category  = wp_get_post_terms( $product->get_id(), 'product_cat', array( 'fields' => 'names' ) );
	$kicker    = (string) $product->get_meta( 'rejunte_kicker' );

	$node = array(
		'@type'       => 'Product',
		'@id'         => $permalink . '#producto',
		'name'        => $product->get_name(),
		'url'         => $permalink,
		'description' => rejunte_plain_text( $product->get_short_description() ?: $product->get_description() ),
		'image'       => array_values( $images ),
		'brand'       => array( '@id' => $home . '#negocio' ),
	);
	if ( $product->get_sku() ) {
		$node['sku'] = $product->get_sku();
	}
	if ( ! is_wp_error( $category ) && $category ) {
		$node['category'] = $category[0];
	}
	if ( $kicker ) {
		$node['size'] = $kicker;
	}
	if ( '' !== $product->get_price() ) {
		$node['offers'] = array(
			'@type'                   => 'Offer',
			'url'                     => $permalink,
			'price'                   => wc_format_decimal( wc_get_price_to_display( $product ), wc_get_price_decimals() ),
			'priceCurrency'           => get_woocommerce_currency(),
			'availability'            => $product->is_in_stock() ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
			'itemCondition'           => 'https://schema.org/NewCondition',
			'availableDeliveryMethod' => 'https://schema.org/OnSitePickup',
			'seller'                  => array( '@id' => $home . '#negocio' ),
		);
	}

	return array_filter( $node );
}

/**
 * Price cards linked to a product describe that product.
 *
 * @param array<string, mixed>|null $offer      Offer from the card's own text.
 * @param array<string, mixed>      $attributes Card attributes.
 * @return array<string, mixed>|null
 */
function rejunte_price_card_product_offer( ?array $offer, array $attributes ): ?array {
	$product = ! empty( $attributes['productId'] ) ? wc_get_product( (int) $attributes['productId'] ) : null;
	if ( ! $product ) {
		return $offer;
	}
	$node = rejunte_product_schema( $product );
	if ( empty( $node['offers'] ) ) {
		return $offer;
	}
	$result                = $node['offers'];
	$result['itemOffered'] = array_diff_key( $node, array_flip( array( 'offers' ) ) );
	return $result;
}
add_filter( 'rejunte_price_card_offer', 'rejunte_price_card_product_offer', 10, 2 );

/**
 * Product pages: the product, as the page's main entity, and its breadcrumb.
 * Shop and category pages: the list of products shown.
 *
 * @param array<int, array<string, mixed>> $graph Nodes.
 * @param array<string, mixed>             $page  WebPage node.
 * @return array<int, array<string, mixed>>
 */
function rejunte_store_schema( array $graph, array $page ): array {
	$home = home_url( '/' );

	if ( is_singular( 'product' ) ) {
		$product = wc_get_product( get_queried_object_id() );
		if ( ! $product ) {
			return $graph;
		}
		$node  = rejunte_product_schema( $product );
		$crumb = array(
			array( 'name' => get_bloginfo( 'name' ), 'item' => $home ),
			array( 'name' => get_the_title( wc_get_page_id( 'shop' ) ), 'item' => wc_get_page_permalink( 'shop' ) ),
		);
		$terms = get_the_terms( $product->get_id(), 'product_cat' );
		if ( $terms && ! is_wp_error( $terms ) ) {
			$crumb[] = array( 'name' => $terms[0]->name, 'item' => get_term_link( $terms[0] ) );
		}
		$crumb[] = array( 'name' => $product->get_name(), 'item' => $product->get_permalink() );

		foreach ( $graph as &$item ) {
			if ( ( $item['@id'] ?? '' ) === $page['@id'] ) {
				$item['@type']      = 'ItemPage';
				$item['mainEntity'] = array( '@id' => $node['@id'] );
				$item['breadcrumb'] = array( '@id' => $page['url'] . '#migas' );
			}
		}
		unset( $item );

		$graph[] = $node;
		$graph[] = array(
			'@type'           => 'BreadcrumbList',
			'@id'             => $page['url'] . '#migas',
			'itemListElement' => array_map(
				static fn( $entry, $index ) => array(
					'@type'    => 'ListItem',
					'position' => $index + 1,
					'name'     => $entry['name'],
					'item'     => $entry['item'],
				),
				$crumb,
				array_keys( $crumb )
			),
		);
		return $graph;
	}

	if ( is_shop() || is_product_taxonomy() ) {
		global $wp_query;
		$items = array();
		foreach ( (array) $wp_query->posts as $index => $post ) {
			$items[] = array(
				'@type'    => 'ListItem',
				'position' => $index + 1,
				'url'      => get_permalink( $post ),
				'name'     => get_the_title( $post ),
			);
		}
		foreach ( $graph as &$item ) {
			if ( ( $item['@id'] ?? '' ) === $page['@id'] && $items ) {
				$item['mainEntity'] = array(
					'@type'           => 'ItemList',
					'itemListElement' => $items,
				);
			}
		}
		unset( $item );
	}

	return $graph;
}
add_filter( 'rejunte_schema_graph', 'rejunte_store_schema', 20, 2 );

/**
 * The shop page has no post object as the queried object; give it the shop
 * page's excerpt as its description when there is one.
 *
 * @param string $text Description so far.
 */
function rejunte_store_description( string $text ): string {
	if ( is_shop() ) {
		$shop = get_post( wc_get_page_id( 'shop' ) );
		if ( $shop && has_excerpt( $shop ) ) {
			return rejunte_plain_text( $shop->post_excerpt );
		}
	}
	if ( is_singular( 'product' ) ) {
		$product = wc_get_product( get_queried_object_id() );
		if ( $product ) {
			$kicker = (string) $product->get_meta( 'rejunte_kicker' );
			$price  = rejunte_product_price( $product );
			$text   = rejunte_plain_text( $product->get_short_description() ) ?: $text;
			$extra  = implode( ' · ', array_filter( array( $kicker, $price ) ) );
			return $extra ? $text . ' ' . $extra . '.' : $text;
		}
	}
	return $text;
}
add_filter( 'rejunte_meta_description', 'rejunte_store_description' );

/**
 * Products in llms.txt.
 *
 * @param string[] $lines Markdown lines.
 * @return string[]
 */
function rejunte_llms_products( array $lines ): array {
	$products = wc_get_products(
		array(
			'status'  => 'publish',
			'limit'   => 50,
			'orderby' => 'menu_order',
			'order'   => 'ASC',
		)
	);
	if ( ! $products ) {
		return $lines;
	}

	$lines[] = '## ' . __( 'Productos', 'rejunte' );
	foreach ( $products as $product ) {
		$details = array_filter(
			array(
				(string) $product->get_meta( 'rejunte_kicker' ),
				rejunte_product_price( $product ),
				$product->is_in_stock() ? '' : __( 'agotado', 'rejunte' ),
			)
		);
		$summary = rejunte_plain_text( $product->get_short_description() );
		$lines[] = sprintf(
			'- [%1$s](%2$s)%3$s%4$s',
			$product->get_name(),
			$product->get_permalink(),
			$details ? ' (' . implode( ' · ', $details ) . ')' : '',
			$summary ? ': ' . $summary : ''
		);
	}
	$lines[] = '';
	$lines[] = sprintf(
		/* translators: %s: cart URL. */
		__( 'Los pedidos se hacen en la tienda (%s) y se retiran en el taller.', 'rejunte' ),
		wc_get_cart_url()
	);
	$lines[] = '';

	return $lines;
}
add_filter( 'rejunte_llms_lines', 'rejunte_llms_products' );

/**
 * Keep the cart, checkout and account pages out of llms.txt.
 *
 * @param int[] $exclude Page IDs.
 * @return int[]
 */
function rejunte_llms_exclude_store_pages( array $exclude ): array {
	foreach ( array( 'cart', 'checkout', 'myaccount' ) as $page ) {
		$exclude[] = (int) wc_get_page_id( $page );
	}
	return $exclude;
}
add_filter( 'rejunte_llms_exclude_pages', 'rejunte_llms_exclude_store_pages' );

/*
 * -----------------------------------------------------------------------------
 * Orders by WhatsApp
 * -----------------------------------------------------------------------------
 *
 * With "Cerrar los pedidos por WhatsApp" on (Customizer → Datos de contacto),
 * there is no payment step: the cart's button reads "Pedir por WhatsApp" and
 * opens WhatsApp with the order written out. The message is built here, on the
 * server, from the real cart, and travels with every Store API cart response, so
 * the button's link is current after every change in the cart.
 */

/**
 * Whether orders close on WhatsApp instead of the checkout.
 */
function rejunte_whatsapp_checkout_enabled(): bool {
	return rejunte_contact_settings()['checkout'];
}

/**
 * The order message for a cart.
 *
 *     ¡Hola Rejunte! Quiero hacer este pedido:
 *
 *     • 2 × Alfajores de maicena (Docena) — 28 €
 *     • 1 × Torta de crema (18 cm · 10 porciones) — 32 €
 *
 *     Total: 60 €
 *
 *     ¿Cuándo lo puedo pasar a buscar?
 */
function rejunte_whatsapp_order_text( WC_Cart $cart ): string {
	$settings = rejunte_contact_settings();
	$lines    = array_filter( array( trim( $settings['intro'] ) ) );
	$lines[]  = '';

	foreach ( $cart->get_cart() as $item ) {
		$product = $item['data'] ?? null;
		if ( ! $product instanceof WC_Product ) {
			continue;
		}
		// A variation's name already carries its options ("Caja de alfajores -
		// Docena"); the parent's presentation describes all of them, so skip it.
		$kicker  = $product->is_type( 'variation' ) ? '' : (string) $product->get_meta( 'rejunte_kicker' );
		// Variation attributes and other item data, as "Name: value" lines.
		$meta    = trim( wp_strip_all_tags( wc_get_formatted_cart_item_data( $item, true ) ) );
		$details = array_filter( array_merge( array( $kicker ), '' === $meta ? array() : (array) preg_split( '/\R+/', $meta ) ) );
		$total   = (float) $item['line_total'] + ( $cart->display_prices_including_tax() ? (float) $item['line_tax'] : 0 );

		$lines[] = sprintf(
			'• %1$d × %2$s%3$s — %4$s',
			(int) $item['quantity'],
			$product->get_name(),
			$details ? ' (' . implode( ', ', $details ) . ')' : '',
			rejunte_format_euros( $total )
		);
	}

	$lines[] = '';
	/* translators: %s: order total. */
	$lines[] = sprintf( __( 'Total: %s', 'rejunte' ), rejunte_format_euros( (float) $cart->get_total( 'edit' ) ) );

	if ( '' !== trim( $settings['outro'] ) ) {
		$lines[] = '';
		$lines[] = trim( $settings['outro'] );
	}

	return implode( "\n", $lines );
}

/**
 * The wa.me link for the current cart, or '' when it is empty.
 */
function rejunte_cart_whatsapp_url(): string {
	$cart = function_exists( 'WC' ) ? WC()->cart : null;
	if ( ! $cart || $cart->is_empty() ) {
		return '';
	}
	return rejunte_whatsapp_url( rejunte_whatsapp_order_text( $cart ) );
}

/**
 * Add the link to every Store API cart response (`extensions.rejunte`), so the
 * cart block and the theme's own scripts always have it for the cart as it is.
 */
function rejunte_store_api_whatsapp(): void {
	if ( ! function_exists( 'woocommerce_store_api_register_endpoint_data' ) ) {
		return;
	}
	woocommerce_store_api_register_endpoint_data(
		array(
			'endpoint'        => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema::IDENTIFIER,
			'namespace'       => 'rejunte',
			'data_callback'   => static fn() => array(
				'whatsapp_url' => rejunte_whatsapp_checkout_enabled() ? rejunte_cart_whatsapp_url() : '',
			),
			'schema_callback' => static fn() => array(
				'whatsapp_url' => array(
					'description' => __( 'Enlace a WhatsApp con el pedido escrito.', 'rejunte' ),
					'type'        => 'string',
					'context'     => array( 'view', 'edit' ),
					'readonly'    => true,
				),
			),
			'schema_type'     => ARRAY_A,
		)
	);
}
// WooCommerce fires this while plugins load, before the theme exists; register
// right away in that case.
if ( did_action( 'woocommerce_blocks_loaded' ) ) {
	rejunte_store_api_whatsapp();
} else {
	add_action( 'woocommerce_blocks_loaded', 'rejunte_store_api_whatsapp' );
}

/**
 * /pedir-por-whatsapp/: opens WhatsApp with the current cart. The checkout URL
 * points here, so every "checkout" link and button anywhere in the store, with
 * or without JavaScript, ends in WhatsApp.
 */
function rejunte_whatsapp_rewrite(): void {
	add_rewrite_rule( '^pedir-por-whatsapp/?$', 'index.php?rejunte_whatsapp=1', 'top' );
}
add_action( 'init', 'rejunte_whatsapp_rewrite' );

/**
 * @param string[] $vars Public query vars.
 * @return string[]
 */
function rejunte_whatsapp_query_var( array $vars ): array {
	$vars[] = 'rejunte_whatsapp';
	return $vars;
}
add_filter( 'query_vars', 'rejunte_whatsapp_query_var' );

/**
 * URL of the hand-off.
 */
function rejunte_whatsapp_handoff_url(): string {
	return home_url( user_trailingslashit( 'pedir-por-whatsapp' ) );
}

/**
 * Checkout links go to the hand-off while orders close on WhatsApp.
 *
 * @param string $url Checkout URL.
 */
function rejunte_whatsapp_checkout_url( string $url ): string {
	return rejunte_whatsapp_checkout_enabled() ? rejunte_whatsapp_handoff_url() : $url;
}
add_filter( 'woocommerce_get_checkout_url', 'rejunte_whatsapp_checkout_url' );

/**
 * Serve the hand-off, and send visits to the checkout page there too.
 */
function rejunte_whatsapp_handoff(): void {
	$handoff = (bool) get_query_var( 'rejunte_whatsapp' );
	if ( ! $handoff && ! ( rejunte_whatsapp_checkout_enabled() && is_checkout() && ! is_wc_endpoint_url() ) ) {
		return;
	}

	nocache_headers();
	if ( ! rejunte_whatsapp_checkout_enabled() ) {
		wp_safe_redirect( wc_get_checkout_url() );
		exit;
	}
	WC()->cart->calculate_totals();
	$url = rejunte_cart_whatsapp_url();
	if ( '' === $url ) {
		wp_safe_redirect( wc_get_cart_url() );
		exit;
	}
	/*
	 * wp_redirect() strips encoded line breaks (%0A) from any Location header as
	 * a guard against header injection, which would flatten the message into one
	 * line. The URL is built here from a fixed host, digits and rawurlencode()d
	 * text — checked again below — so it is sent as is.
	 */
	if ( ! preg_match( '#^https://wa\.me/\d+\?text=[A-Za-z0-9%\-_.~!*\'()]*$#', $url ) ) {
		wp_safe_redirect( wc_get_cart_url() );
		exit;
	}
	header( 'X-Redirect-By: Rejunte' );
	header( 'Location: ' . $url, true, 302 );
	exit;
}
// Before redirect_canonical (priority 10), like llms.txt.
add_action( 'template_redirect', 'rejunte_whatsapp_handoff', 1 );

/**
 * On the cart page, the block's button becomes "Pedir por WhatsApp" and links
 * to WhatsApp with the cart, through WooCommerce's documented checkout filters.
 */
function rejunte_whatsapp_cart_script(): void {
	if ( ! rejunte_whatsapp_checkout_enabled() || ! is_cart() ) {
		return;
	}
	$file = REJUNTE_DIR . '/assets/js/whatsapp-cart.js';
	wp_enqueue_script(
		'rejunte-whatsapp-cart',
		rejunte_asset_url( 'js/whatsapp-cart.js' ),
		array( 'wc-blocks-checkout' ),
		(string) filemtime( $file ),
		array( 'strategy' => 'defer' )
	);
	wp_add_inline_script(
		'rejunte-whatsapp-cart',
		'window.rejunteWhatsApp = ' . wp_json_encode(
			array(
				'label' => __( 'Pedir por WhatsApp', 'rejunte' ),
				'url'   => rejunte_cart_whatsapp_url(),
			)
		) . ';',
		'before'
	);
}
add_action( 'wp_enqueue_scripts', 'rejunte_whatsapp_cart_script' );
