<?php
/**
 * Front-end weight.
 *
 * Strips what WordPress prints by default but this site has no use for, so the
 * document carries only the theme's own inlined CSS and the few deferred
 * modules its interactive blocks need.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Head and asset cleanup.
 */
function rejunte_trim_head(): void {
	// Emoji detection: an inline script and stylesheet on every page for glyphs every browser draws natively.
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	add_filter( 'emoji_svg_url', '__return_false' );

	// Discovery links for clients this site does not serve.
	remove_action( 'wp_head', 'rsd_link' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'wp_shortlink_wp_head' );
	remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
	remove_action( 'wp_head', 'wp_oembed_add_host_js' );
	remove_action( 'wp_head', 'feed_links_extra', 3 );
	remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
}
add_action( 'init', 'rejunte_trim_head' );

/**
 * Drop core stylesheets the theme replaces.
 *
 * `wp-block-library` here is only core's "common" sheet (block themes load each
 * core block's CSS on its own): colour and font-size utility classes for presets
 * the theme does not expose, plus a screen-reader class the theme defines itself.
 */
function rejunte_dequeue_core_styles(): void {
	if ( is_admin() ) {
		return;
	}
	wp_dequeue_style( 'classic-theme-styles' );
}
add_action( 'wp_enqueue_scripts', 'rejunte_dequeue_core_styles', 100 );

/**
 * Script modules from block.json are deferred by nature; mark them fetch-
 * priority low so they never compete with the LCP image for bandwidth.
 *
 * @param array<string, string> $attributes Script tag attributes.
 * @return array<string, string>
 */
function rejunte_module_attributes( array $attributes ): array {
	if ( isset( $attributes['id'] ) && str_starts_with( (string) $attributes['id'], 'rejunte-' ) ) {
		$attributes['fetchpriority'] = 'low';
	}
	return $attributes;
}
add_filter( 'wp_script_attributes', 'rejunte_module_attributes' );
