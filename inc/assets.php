<?php
/**
 * Stylesheets and the small amount of data editor scripts need.
 *
 * Block styles are not enqueued here: each block's block.json declares its own
 * stylesheet, so WordPress only prints the CSS for blocks that are actually on
 * the page. This module only handles what every page shares.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Global stylesheet: tokens, the reset, and the components shared across blocks
 * (eyebrow, buttons, image slot). Registered early so block stylesheets can
 * depend on it and print after it.
 */
function rejunte_register_global_styles(): void {
	$file = REJUNTE_DIR . '/assets/css/global.css';
	if ( ! file_exists( $file ) ) {
		return;
	}
	wp_register_style( 'rejunte-global', rejunte_asset_url( 'css/global.css' ), array(), (string) filemtime( $file ) );
	// With a path, WordPress can inline the file instead of linking it.
	wp_style_add_data( 'rejunte-global', 'path', $file );
}
add_action( 'init', 'rejunte_register_global_styles', 5 );

/**
 * Enqueue the global stylesheet (and, in the editor, the editor additions).
 * `enqueue_block_assets` runs both on the site and inside the editor iframe,
 * which is what keeps the two identical.
 */
function rejunte_enqueue_global_styles(): void {
	wp_enqueue_style( 'rejunte-global' );

	if ( is_admin() ) {
		$editor = REJUNTE_DIR . '/assets/css/editor.css';
		if ( file_exists( $editor ) ) {
			wp_enqueue_style( 'rejunte-editor', rejunte_asset_url( 'css/editor.css' ), array( 'rejunte-global' ), (string) filemtime( $editor ) );
		}
	}
}
add_action( 'enqueue_block_assets', 'rejunte_enqueue_global_styles' );

/**
 * Inline all first-party CSS.
 *
 * The whole site's CSS is a few kilobytes once minified. Printing it in the
 * document removes every render-blocking stylesheet request, which matters more
 * on a first visit than the cache reuse a separate file would give.
 */
function rejunte_inline_size_limit(): int {
	return 80000;
}
add_filter( 'styles_inline_size_limit', 'rejunte_inline_size_limit' );

/**
 * Data the block editor needs that block.json cannot carry: where the theme's
 * brand images live, and the store URLs blocks link to by default.
 */
function rejunte_editor_data(): void {
	$data = array(
		'brand' => rejunte_brand_images(),
		'home'  => home_url( '/' ),
		'shop'  => function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : '',
		'cart'  => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : '',
	);

	wp_add_inline_script(
		'wp-blocks',
		'window.rejunteTheme = ' . wp_json_encode( $data ) . ';',
		'before'
	);
}
add_action( 'enqueue_block_editor_assets', 'rejunte_editor_data' );
