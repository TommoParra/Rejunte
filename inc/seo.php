<?php
/**
 * Search and assistant metadata: title, description, Open Graph and one JSON-LD
 * graph per page.
 *
 * The graph is built as linked nodes (`@id` references) rather than repeated
 * objects, so the business, the website and each product are described once and
 * pointed at everywhere else. Other modules add nodes through the
 * `rejunte_schema_graph` filter.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Title separator.
 */
function rejunte_title_separator(): string {
	return '·';
}
add_filter( 'document_title_separator', 'rejunte_title_separator' );

/**
 * The document title as plain text: wp_get_document_title() returns it escaped
 * for HTML, which would be escaped twice in attributes and JSON.
 */
function rejunte_document_title(): string {
	return html_entity_decode( wp_get_document_title(), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
}

/**
 * Parsed blocks of the post being viewed, memoised for the request.
 *
 * @return array<int, array<string, mixed>>
 */
function rejunte_current_blocks(): array {
	static $blocks = null;
	if ( null === $blocks ) {
		$post   = is_singular() ? get_queried_object() : null;
		$blocks = $post instanceof WP_Post ? parse_blocks( $post->post_content ) : array();
	}
	return $blocks;
}

/**
 * The description of the current page, in plain text, at most ~160 characters.
 */
function rejunte_meta_description(): string {
	$text = '';
	$post = get_queried_object();

	if ( $post instanceof WP_Post && has_excerpt( $post ) ) {
		$text = rejunte_plain_text( $post->post_excerpt );
	} elseif ( is_front_page() ) {
		$hero = rejunte_find_blocks( rejunte_current_blocks(), array( 'rejunte/hero' ) );
		$text = rejunte_plain_text( $hero[0]['attrs']['lead'] ?? '' );
	} elseif ( $post instanceof WP_Post ) {
		$text = rejunte_plain_text( excerpt_remove_blocks( $post->post_content ) );
	} elseif ( is_tax() || is_category() || is_tag() ) {
		$text = rejunte_plain_text( term_description() );
	}

	if ( '' === $text ) {
		$text = rejunte_business()['description'];
	}

	/**
	 * Filters the meta description before it is trimmed.
	 *
	 * @param string $text Description.
	 */
	$text = (string) apply_filters( 'rejunte_meta_description', $text );

	return wp_html_excerpt( $text, 158, '…' );
}

/**
 * The image that represents the current page when shared.
 *
 * @return array{url: string, width: int, height: int, alt: string}
 */
function rejunte_share_image(): array {
	$post = get_queried_object();
	if ( $post instanceof WP_Post && has_post_thumbnail( $post ) ) {
		$id    = (int) get_post_thumbnail_id( $post );
		$image = wp_get_attachment_image_src( $id, 'full' );
		if ( $image ) {
			return array(
				'url'    => $image[0],
				'width'  => (int) $image[1],
				'height' => (int) $image[2],
				'alt'    => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ),
			);
		}
	}

	return array(
		'url'    => rejunte_asset_url( 'img/share.jpg' ),
		'width'  => 1200,
		'height' => 630,
		'alt'    => __( 'Rejunte, pastelería argentina en Barcelona', 'rejunte' ),
	);
}

/**
 * Canonical URL of the current view, or '' when none applies.
 */
function rejunte_canonical_url(): string {
	if ( is_paged() && ! is_singular() ) {
		return (string) get_pagenum_link( max( 1, (int) get_query_var( 'paged' ) ) );
	}
	if ( is_front_page() ) {
		return home_url( '/' );
	}
	if ( is_singular() ) {
		return (string) wp_get_canonical_url();
	}
	if ( is_post_type_archive() ) {
		return (string) get_post_type_archive_link( (string) get_query_var( 'post_type' ) ?: 'post' );
	}
	if ( is_tax() || is_category() || is_tag() ) {
		$link = get_term_link( get_queried_object() );
		return is_wp_error( $link ) ? '' : $link;
	}
	return '';
}

/**
 * Description, Open Graph and Twitter tags.
 */
function rejunte_meta_tags(): void {
	if ( is_404() || is_search() ) {
		return;
	}

	$description = rejunte_meta_description();
	$image       = rejunte_share_image();
	$url         = rejunte_canonical_url();
	$is_product  = is_singular( 'product' );

	$tags = array(
		array( 'name', 'description', $description ),
		array( 'property', 'og:locale', get_locale() ),
		array( 'property', 'og:site_name', get_bloginfo( 'name' ) ),
		array( 'property', 'og:type', $is_product ? 'product' : ( is_singular( 'post' ) ? 'article' : 'website' ) ),
		array( 'property', 'og:title', rejunte_document_title() ),
		array( 'property', 'og:description', $description ),
		array( 'property', 'og:url', $url ),
		array( 'property', 'og:image', $image['url'] ),
		array( 'property', 'og:image:width', (string) $image['width'] ),
		array( 'property', 'og:image:height', (string) $image['height'] ),
		array( 'property', 'og:image:alt', $image['alt'] ),
		array( 'name', 'twitter:card', 'summary_large_image' ),
	);

	// Canonical for views core leaves without one (front page, shop and term archives).
	if ( $url && ! is_singular() ) {
		printf( '<link rel="canonical" href="%s">' . "\n", esc_url( $url ) );
	}

	foreach ( $tags as [ $attribute, $key, $value ] ) {
		if ( '' === $value ) {
			continue;
		}
		printf( '<meta %1$s="%2$s" content="%3$s">' . "\n", esc_attr( $attribute ), esc_attr( $key ), esc_attr( $value ) );
	}
}
add_action( 'wp_head', 'rejunte_meta_tags', 2 );

/**
 * The business node.
 *
 * @return array<string, mixed>
 */
function rejunte_schema_business(): array {
	$business = rejunte_business();
	$home     = home_url( '/' );
	$logo     = rejunte_brand_images()['logo'];

	$node = array(
		'@type'              => 'Bakery',
		'@id'                => $home . '#negocio',
		'name'               => $business['name'],
		'description'        => $business['description'],
		'url'                => $home,
		'logo'               => array(
			'@type'  => 'ImageObject',
			'@id'    => $home . '#logo',
			'url'    => $logo['url'],
			'width'  => $logo['width'],
			'height' => $logo['height'],
		),
		'image'              => array( '@id' => $home . '#logo' ),
		'servesCuisine'      => __( 'Pastelería argentina', 'rejunte' ),
		'currenciesAccepted' => 'EUR',
	);

	if ( $business['telephone'] ) {
		$node['telephone'] = $business['telephone'];
	}
	if ( $business['email'] ) {
		$node['email'] = $business['email'];
	}
	if ( $business['address'] ) {
		$node['address'] = array_merge( array( '@type' => 'PostalAddress' ), $business['address'] );
	}
	foreach ( $business['hours'] as $hours ) {
		$node['openingHoursSpecification'][] = array(
			'@type'     => 'OpeningHoursSpecification',
			'dayOfWeek' => $hours['days'],
			'opens'     => $hours['opens'],
			'closes'    => $hours['closes'],
		);
	}
	if ( $business['same_as'] ) {
		$node['sameAs'] = $business['same_as'];
	}

	return $node;
}

/**
 * The full graph for the current view.
 *
 * @return array<int, array<string, mixed>>
 */
function rejunte_schema_graph(): array {
	$home        = home_url( '/' );
	$url         = rejunte_canonical_url() ?: home_url( user_trailingslashit( (string) ( $GLOBALS['wp']->request ?? '' ) ) );
	$description = rejunte_meta_description();

	$website = array(
		'@type'      => 'WebSite',
		'@id'        => $home . '#sitio',
		'url'        => $home,
		'name'       => get_bloginfo( 'name' ),
		'inLanguage' => get_bloginfo( 'language' ),
		'publisher'  => array( '@id' => $home . '#negocio' ),
	);

	$page = array(
		'@type'       => is_singular() ? 'WebPage' : 'CollectionPage',
		'@id'         => $url . '#pagina',
		'url'         => $url,
		'name'        => rejunte_document_title(),
		'description' => $description,
		'isPartOf'    => array( '@id' => $home . '#sitio' ),
		'inLanguage'  => get_bloginfo( 'language' ),
	);
	if ( is_front_page() ) {
		$page['about']      = array( '@id' => $home . '#negocio' );
		$page['mainEntity'] = array( '@id' => $home . '#negocio' );
	}

	$image = rejunte_share_image();
	if ( $image['url'] ) {
		$page['primaryImageOfPage'] = array(
			'@type'  => 'ImageObject',
			'url'    => $image['url'],
			'width'  => $image['width'],
			'height' => $image['height'],
		);
	}

	$graph = array( $website, rejunte_schema_business(), $page );

	/**
	 * Filters the JSON-LD graph. Modules add nodes here (products, breadcrumbs).
	 *
	 * @param array $graph Nodes.
	 * @param array $page  The WebPage node of this view, for reference.
	 */
	return (array) apply_filters( 'rejunte_schema_graph', $graph, $page );
}

/**
 * The offer a price card makes, from its own attributes.
 *
 * WooCommerce replaces this with the linked product's live data through the
 * `rejunte_price_card_offer` filter.
 *
 * @param array<string, mixed> $attributes Price card attributes.
 * @return array<string, mixed>|null
 */
function rejunte_price_card_offer( array $attributes ): ?array {
	$name  = rejunte_plain_text( $attributes['name'] ?? '' );
	$price = (string) ( $attributes['price'] ?? '' );
	if ( '' === $name || ! is_numeric( str_replace( ',', '.', $price ) ) ) {
		$offer = null;
	} else {
		$offer = array(
			'@type'         => 'Offer',
			'price'         => str_replace( ',', '.', $price ),
			'priceCurrency' => 'EUR',
			'itemOffered'   => array_filter(
				array(
					'@type'       => 'Product',
					'name'        => $name,
					'description' => rejunte_plain_text( $attributes['body'] ?? '' ),
					'size'        => rejunte_plain_text( $attributes['kicker'] ?? '' ),
				)
			),
		);
	}

	/**
	 * Filters the offer a price card contributes to structured data.
	 *
	 * @param array|null $offer      Offer node, or null for none.
	 * @param array      $attributes Block attributes.
	 */
	return apply_filters( 'rejunte_price_card_offer', $offer, $attributes );
}

/**
 * Attach the front page's price cards to the business as its offer catalogue,
 * and derive the price range from them.
 *
 * @param array<int, array<string, mixed>> $graph Nodes.
 * @return array<int, array<string, mixed>>
 */
function rejunte_schema_offer_catalog( array $graph ): array {
	if ( ! is_front_page() ) {
		return $graph;
	}

	$offers = array();
	foreach ( rejunte_find_blocks( rejunte_current_blocks(), array( 'rejunte/price-card' ) ) as $card ) {
		$offer = rejunte_price_card_offer( $card['attrs'] );
		if ( $offer ) {
			$offers[] = $offer;
		}
	}
	if ( ! $offers ) {
		return $graph;
	}

	$prices = array_map( static fn( $offer ) => (float) $offer['price'], $offers );
	$home   = home_url( '/' );
	foreach ( $graph as &$node ) {
		if ( ( $node['@id'] ?? '' ) !== $home . '#negocio' ) {
			continue;
		}
		$node['priceRange']      = min( $prices ) === max( $prices )
			? rejunte_format_euros( min( $prices ) )
			: rejunte_format_euros( min( $prices ) ) . '–' . rejunte_format_euros( max( $prices ) );
		$node['hasOfferCatalog'] = array(
			'@type'           => 'OfferCatalog',
			'name'            => __( 'Precios', 'rejunte' ),
			'itemListElement' => $offers,
		);
	}
	unset( $node );

	return $graph;
}
add_filter( 'rejunte_schema_graph', 'rejunte_schema_offer_catalog' );

/**
 * "14 €", "9,50 €".
 */
function rejunte_format_euros( float $amount ): string {
	$decimals = floor( $amount ) === $amount ? 0 : 2;
	return number_format( $amount, $decimals, ',', '.' ) . ' €';
}

/**
 * Print the graph.
 */
function rejunte_print_schema(): void {
	if ( is_404() || is_search() ) {
		return;
	}
	$data = array(
		'@context' => 'https://schema.org',
		'@graph'   => array_values( rejunte_schema_graph() ),
	);
	printf(
		'<script type="application/ld+json">%s</script>' . "\n",
		wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG )
	);
}
add_action( 'wp_head', 'rejunte_print_schema', 3 );
