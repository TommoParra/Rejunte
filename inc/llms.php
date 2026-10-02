<?php
/**
 * /llms.txt — a plain Markdown brief of the business for language models.
 *
 * Generated on request from the same sources as the structured data (footer
 * text, front page, products), so it never needs maintaining by hand.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Route /llms.txt to the theme.
 */
function rejunte_llms_rewrite(): void {
	add_rewrite_rule( '^llms\.txt$', 'index.php?rejunte_llms=1', 'top' );
}
add_action( 'init', 'rejunte_llms_rewrite' );

/**
 * @param string[] $vars Public query vars.
 * @return string[]
 */
function rejunte_llms_query_var( array $vars ): array {
	$vars[] = 'rejunte_llms';
	return $vars;
}
add_filter( 'query_vars', 'rejunte_llms_query_var' );

/**
 * The rule only exists once rewrite rules are rebuilt.
 */
function rejunte_llms_flush(): void {
	rejunte_llms_rewrite();
	flush_rewrite_rules( false );
}
add_action( 'after_switch_theme', 'rejunte_llms_flush' );

/**
 * Lines of the document.
 *
 * @return string[]
 */
function rejunte_llms_lines(): array {
	$business = rejunte_business();
	$lines    = array( '# ' . $business['name'], '' );

	if ( $business['description'] ) {
		$lines[] = '> ' . $business['description'];
		$lines[] = '';
	}

	$facts = array();
	if ( $business['address'] ) {
		$facts[] = sprintf(
			/* translators: %s: postal address. */
			__( 'Dirección: %s', 'rejunte' ),
			implode( ', ', array_filter( array( $business['address']['streetAddress'] ?? '', trim( ( $business['address']['postalCode'] ?? '' ) . ' ' . ( $business['address']['addressLocality'] ?? '' ) ) ) ) )
		);
	}
	if ( $business['hours_text'] ) {
		/* translators: %s: opening hours, e.g. "Jueves a domingo, 16 a 20 h". */
		$facts[] = sprintf( __( 'Retiro: %s', 'rejunte' ), implode( ', ', $business['hours_text'] ) );
	}
	if ( $business['telephone'] ) {
		/* translators: %s: phone number. */
		$facts[] = sprintf( __( 'Teléfono: %s', 'rejunte' ), $business['telephone'] );
	}
	foreach ( $business['same_as'] as $profile ) {
		// "https://www.instagram.com/…" → "Instagram".
		$host    = preg_replace( '/^www\./', '', (string) wp_parse_url( $profile, PHP_URL_HOST ) );
		$facts[] = sprintf( '%s: %s', ucfirst( strtok( $host, '.' ) ), $profile );
	}
	if ( $facts ) {
		$lines[] = '## ' . __( 'Datos', 'rejunte' );
		foreach ( $facts as $fact ) {
			$lines[] = '- ' . $fact;
		}
		$lines[] = '';
	}

	/**
	 * Filters the lines of /llms.txt. WooCommerce adds the product list here.
	 *
	 * @param string[] $lines Markdown lines.
	 */
	$lines = (array) apply_filters( 'rejunte_llms_lines', $lines );

	/**
	 * Filters the page IDs left out of llms.txt (the store's cart, checkout and
	 * account pages say nothing about the business).
	 *
	 * @param int[] $exclude Page IDs.
	 */
	$exclude = (array) apply_filters( 'rejunte_llms_exclude_pages', array( (int) get_option( 'page_on_front' ) ) );

	// Questions and answers from every published page that has an FAQ block.
	global $wpdb;
	$faq_pages = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM {$wpdb->posts} WHERE post_type = 'page' AND post_status = 'publish' AND post_content LIKE %s", '%' . $wpdb->esc_like( '<!-- wp:rejunte/faq' ) . '%' ) ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- One small read per llms.txt request.
	$faq       = array();
	foreach ( $faq_pages as $faq_page ) {
		$faq = array_merge( $faq, rejunte_faq_items( parse_blocks( (string) get_post_field( 'post_content', (int) $faq_page ) ) ) );
	}
	if ( $faq ) {
		$lines[] = '## ' . __( 'Preguntas frecuentes', 'rejunte' );
		foreach ( $faq as $item ) {
			$lines[] = '- **' . $item['question'] . '** ' . $item['answer'];
		}
		$lines[] = '';
	}

	$lines[] = '## ' . __( 'Páginas', 'rejunte' );
	$lines[] = sprintf( '- [%s](%s)', __( 'Inicio', 'rejunte' ), home_url( '/' ) );
	foreach ( get_pages( array( 'sort_column' => 'menu_order,post_title' ) ) as $page ) {
		if ( in_array( $page->ID, $exclude, true ) ) {
			continue;
		}
		$lines[] = sprintf( '- [%s](%s)', get_the_title( $page ), get_permalink( $page ) );
	}

	return $lines;
}

/**
 * Serve it.
 */
function rejunte_llms_serve(): void {
	if ( ! get_query_var( 'rejunte_llms' ) ) {
		return;
	}
	header( 'Content-Type: text/markdown; charset=utf-8' );
	header( 'X-Robots-Tag: noindex' );
	echo implode( "\n", array_map( 'wp_strip_all_tags', rejunte_llms_lines() ) ) . "\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Plain text document, tags stripped.
	exit;
}
// Before redirect_canonical (priority 10), which would append a trailing slash.
add_action( 'template_redirect', 'rejunte_llms_serve', 1 );
