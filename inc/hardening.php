<?php
/**
 * Small, safe hardening for a site with no blog authors and no remote
 * publishing. Server-level measures (two-factor login, file editing, backups)
 * are in docs/DEPLOYMENT.md.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

// No XML-RPC: nothing here publishes remotely, and it is a common attack surface.
add_filter( 'xmlrpc_enabled', '__return_false' );

/**
 * No X-Pingback header advertising it either.
 *
 * @param array<string, string> $headers Response headers.
 * @return array<string, string>
 */
function rejunte_remove_pingback_header( array $headers ): array {
	unset( $headers['X-Pingback'] );
	return $headers;
}
add_filter( 'wp_headers', 'rejunte_remove_pingback_header' );

/**
 * The REST API lists users only to people who edit content (the editor needs
 * it for the author field); visitors cannot harvest usernames.
 *
 * @param array<string, mixed> $endpoints REST routes.
 * @return array<string, mixed>
 */
function rejunte_hide_user_endpoints( array $endpoints ): array {
	if ( ! current_user_can( 'edit_posts' ) ) {
		unset( $endpoints['/wp/v2/users'], $endpoints['/wp/v2/users/(?P<id>[\d]+)'] );
	}
	return $endpoints;
}
add_filter( 'rest_endpoints', 'rejunte_hide_user_endpoints' );

/**
 * No author archives or ?author=N enumeration: the site has no author pages.
 */
function rejunte_block_author_enumeration(): void {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only check.
	if ( is_author() || ( ! is_user_logged_in() && isset( $_GET['author'] ) ) ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'rejunte_block_author_enumeration', 0 );

/**
 * No users sitemap.
 *
 * @param WP_Sitemaps_Provider|false $provider Sitemap provider.
 * @param string                     $name     Provider name.
 * @return WP_Sitemaps_Provider|false
 */
function rejunte_no_users_sitemap( $provider, string $name ) {
	return 'users' === $name ? false : $provider;
}
add_filter( 'wp_sitemaps_add_provider', 'rejunte_no_users_sitemap', 10, 2 );
