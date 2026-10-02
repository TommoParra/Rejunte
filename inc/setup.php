<?php
/**
 * Theme supports, image sizes and media handling.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Theme supports.
 */
function rejunte_setup(): void {
	load_theme_textdomain( 'rejunte', REJUNTE_DIR . '/languages' );

	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );

	// The inserter should offer this brand's sections, not core's generic ones.
	remove_theme_support( 'core-block-patterns' );

	add_theme_support( 'woocommerce' );

	/*
	 * One extra width between core's 300 and 768 so a 250–320px slot on a 2x
	 * screen picks a 600px file instead of jumping to 768.
	 */
	add_image_size( 'rejunte-600', 600, 0 );
}
add_action( 'after_setup_theme', 'rejunte_setup' );

/**
 * Store generated sub-sizes as WebP.
 *
 * GD on this stack writes WebP but not AVIF; WebP is the smallest format every
 * current browser decodes, so uploads of JPEG or PNG still produce WebP
 * sub-sizes for srcset.
 *
 * @param array<string, string> $formats Map of source mime → output mime.
 * @return array<string, string>
 */
function rejunte_image_output_format( array $formats ): array {
	// Site icons stay PNG: favicons and touch icons are read by more than browsers.
	// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only check of the crop context; core verifies the request.
	if ( wp_doing_ajax() && 'site-icon' === ( $_POST['context'] ?? '' ) ) {
		return $formats;
	}
	if ( wp_image_editor_supports( array( 'mime_type' => 'image/webp' ) ) ) {
		$formats['image/jpeg'] = 'image/webp';
		$formats['image/png']  = 'image/webp';
	}
	return $formats;
}
add_filter( 'image_editor_output_format', 'rejunte_image_output_format' );

/**
 * WebP quality: 80 keeps food photography clean at roughly half the JPEG weight.
 */
function rejunte_image_quality( int $quality, string $mime_type ): int {
	return 'image/webp' === $mime_type ? 80 : $quality;
}
add_filter( 'wp_editor_set_quality', 'rejunte_image_quality', 10, 2 );

/**
 * Offer the extra size in the media modal so editors can pick it too.
 *
 * @param array<string, string> $sizes Size slug → label.
 * @return array<string, string>
 */
function rejunte_image_size_names( array $sizes ): array {
	$sizes['rejunte-600'] = __( 'Mediano (600px)', 'rejunte' );
	return $sizes;
}
add_filter( 'image_size_names_choose', 'rejunte_image_size_names' );

/**
 * Open pages and products in the editor with their template around them, so
 * the header, footer and every section sit exactly where they will on the site.
 * Each person can still switch to editing the content alone.
 */
function rejunte_template_editing_mode(): void {
	foreach ( array( 'page', 'product' ) as $post_type ) {
		if ( post_type_exists( $post_type ) ) {
			add_post_type_support( $post_type, 'editor', array( 'default-mode' => 'template-locked' ) );
		}
	}
}
add_action( 'init', 'rejunte_template_editing_mode', 20 );
