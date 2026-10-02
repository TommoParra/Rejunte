<?php
/**
 * Product cards.
 *
 * @package Rejunte
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

if ( ! function_exists( 'wc_get_products' ) ) {
	return;
}

$rejunte_products = rejunte_product_grid_products( $attributes, $block );
$rejunte_level    = '' !== trim( (string) $attributes['heading'] ) ? 3 : 2;

ob_start();
if ( $attributes['showCategories'] ) {
	echo rejunte_product_category_nav(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped inside.
}
if ( $rejunte_products ) {
	rejunte_page_has_order_blocks( true );
	echo '<div class="rj-price-grid">';
	foreach ( $rejunte_products as $rejunte_product ) {
		echo rejunte_product_card( $rejunte_product, $attributes, $rejunte_level ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped inside.
	}
	echo '</div>';
	if ( 'query' === $attributes['source'] && ! $attributes['isPreview'] ) {
		echo rejunte_product_grid_pagination(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built by paginate_links().
	}
} else {
	printf( '<p class="rj-products__empty">%s</p>', esc_html__( 'Por ahora no hay nada en la vitrina.', 'rejunte' ) );
}
$rejunte_grid = (string) ob_get_clean();

// The editor previews only the cards; it draws the heading itself.
if ( $attributes['isPreview'] ) {
	echo $rejunte_grid; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	return;
}
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'rj-products' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php if ( $attributes['eyebrow'] || $attributes['heading'] ) : ?>
		<div class="rj-products__head">
			<?php if ( $attributes['eyebrow'] ) : ?>
				<span class="rj-eyebrow"><?php echo wp_kses_post( $attributes['eyebrow'] ); ?></span>
			<?php endif; ?>
			<?php if ( $attributes['heading'] ) : ?>
				<h2 class="rj-products__title"><?php echo wp_kses_post( $attributes['heading'] ); ?></h2>
			<?php endif; ?>
		</div>
	<?php endif; ?>
	<?php echo $rejunte_grid; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</section>
