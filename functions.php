<?php
/**
 * Rejunte theme bootstrap.
 *
 * Everything the theme does lives in a module under inc/, loaded here in the
 * order they depend on each other. WooCommerce integration only loads when the
 * plugin is active, so the theme stands on its own without it.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

define( 'REJUNTE_VERSION', '1.0.0' );
define( 'REJUNTE_DIR', get_template_directory() );
define( 'REJUNTE_URI', get_template_directory_uri() );

require REJUNTE_DIR . '/inc/helpers.php';
require REJUNTE_DIR . '/inc/setup.php';
require REJUNTE_DIR . '/inc/assets.php';
require REJUNTE_DIR . '/inc/blocks.php';
require REJUNTE_DIR . '/inc/performance.php';
require REJUNTE_DIR . '/inc/hardening.php';
require REJUNTE_DIR . '/inc/accessibility.php';
require REJUNTE_DIR . '/inc/business.php';
require REJUNTE_DIR . '/inc/contact.php';
require REJUNTE_DIR . '/inc/consent.php';
require REJUNTE_DIR . '/inc/seo.php';
require REJUNTE_DIR . '/inc/llms.php';

if ( class_exists( 'WooCommerce' ) ) {
	require REJUNTE_DIR . '/inc/woocommerce.php';
}
