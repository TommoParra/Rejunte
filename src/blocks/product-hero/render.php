<?php
/**
 * Product page header.
 *
 * @package Rejunte
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$rejunte_product = function_exists( 'wc_get_product' ) ? wc_get_product( $block->context['postId'] ?? get_the_ID() ) : null;
if ( ! $rejunte_product ) {
	return;
}

rejunte_page_has_order_blocks( true );

// WooCommerce's notices for this request (a product that needs options chosen,
// for instance), shown in the product header rather than a separate block.
$rejunte_notices = '';
if ( function_exists( 'wc_print_notices' ) && ! wp_is_serving_rest_request() ) {
	$rejunte_notices = (string) wc_print_notices( true );
}

$rejunte_id       = $rejunte_product->get_id();
$rejunte_name_id  = 'rj-product-' . $rejunte_id;
$rejunte_kicker   = (string) $rejunte_product->get_meta( 'rejunte_kicker' );
$rejunte_price    = rejunte_product_price( $rejunte_product );
$rejunte_in_cart  = rejunte_cart_quantities()[ $rejunte_id ] ?? 0;
$rejunte_images   = array_values( array_filter( array_merge( array( $rejunte_product->get_image_id() ), $rejunte_product->get_gallery_image_ids() ) ) );
$rejunte_terms    = get_the_terms( $rejunte_id, 'product_cat' );
$rejunte_category = $rejunte_terms && ! is_wp_error( $rejunte_terms ) ? $rejunte_terms[0] : null;
$rejunte_label    = (string) $attributes['buttonLabel'];
$rejunte_added    = (string) $attributes['addedLabel'];
$rejunte_sizes    = '(max-width: 62rem) 100vw, 45vw';
$rejunte_food     = rejunte_food_info( $rejunte_product );
$rejunte_has_food = $rejunte_food['ingredients'] || $rejunte_food['allergens'] || $rejunte_food['traces'];
?>
<?php if ( $rejunte_notices ) : ?>
	<div class="rj-notices rj-product__notices"><?php echo $rejunte_notices; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- WooCommerce notice templates escape their output. ?></div>
<?php endif; ?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'rj-product' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="rj-product__media">
		<div class="rj-image rj-product__photo" data-tone="mid" style="aspect-ratio:4 / 5">
			<?php
			if ( $rejunte_images ) {
				echo wp_get_attachment_image(
					$rejunte_images[0],
					'full',
					false,
					array(
						'class'         => 'rj-image__img',
						'sizes'         => $rejunte_sizes,
						'loading'       => false,
						'fetchpriority' => 'high',
					)
				);
			} else {
				printf(
					'<span class="rj-image__placeholder"><span class="rj-image__mark" aria-hidden="true">✳</span><span class="rj-image__label">%s</span></span>',
					esc_html( $rejunte_product->get_name() )
				);
			}
			?>
		</div>
		<?php if ( count( $rejunte_images ) > 1 ) : ?>
			<ul class="rj-product__thumbs">
				<?php foreach ( $rejunte_images as $rejunte_index => $rejunte_image ) : ?>
					<?php
					$rejunte_full = wp_get_attachment_image_src( $rejunte_image, 'full' );
					if ( ! $rejunte_full ) {
						continue;
					}
					?>
					<li>
						<button
							type="button"
							class="rj-product__thumb"
							aria-pressed="<?php echo 0 === $rejunte_index ? 'true' : 'false'; ?>"
							data-src="<?php echo esc_url( $rejunte_full[0] ); ?>"
							data-srcset="<?php echo esc_attr( (string) wp_get_attachment_image_srcset( $rejunte_image, 'full' ) ); ?>"
							data-alt="<?php echo esc_attr( (string) get_post_meta( $rejunte_image, '_wp_attachment_image_alt', true ) ); ?>"
						>
							<?php
							echo wp_get_attachment_image(
								$rejunte_image,
								'thumbnail',
								false,
								array(
									'class'   => 'rj-product__thumb-img',
									'alt'     => '',
									'loading' => 'lazy',
								)
							);
							?>
							<span class="screen-reader-text">
								<?php
								/* translators: %d: photo number. */
								echo esc_html( sprintf( __( 'Ver la foto %d', 'rejunte' ), $rejunte_index + 1 ) );
								?>
							</span>
						</button>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>

	<div class="rj-product__copy">
		<nav class="rj-product__crumbs" aria-label="<?php esc_attr_e( 'Migas de pan', 'rejunte' ); ?>">
			<ol>
				<li><a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php echo esc_html( $attributes['shopLabel'] ); ?></a></li>
				<?php if ( $rejunte_category ) : ?>
					<li><a href="<?php echo esc_url( (string) get_term_link( $rejunte_category ) ); ?>"><?php echo esc_html( $rejunte_category->name ); ?></a></li>
				<?php endif; ?>
			</ol>
		</nav>

		<h1 class="rj-product__title" id="<?php echo esc_attr( $rejunte_name_id ); ?>"><?php echo esc_html( $rejunte_product->get_name() ); ?></h1>

		<?php if ( $rejunte_kicker ) : ?>
			<span class="rj-price__kicker rj-product__kicker"><?php echo esc_html( $rejunte_kicker ); ?></span>
		<?php endif; ?>

		<?php if ( $rejunte_product->get_short_description() ) : ?>
			<div class="rj-product__lead"><?php echo wp_kses_post( wpautop( $rejunte_product->get_short_description() ) ); ?></div>
		<?php endif; ?>

		<div class="rj-product__buy">
			<?php if ( $rejunte_price ) : ?>
				<span class="rj-product__amount"><?php echo esc_html( $rejunte_price ); ?></span>
			<?php endif; ?>

			<?php if ( $rejunte_product->is_type( 'simple' ) && $rejunte_product->is_purchasable() && $rejunte_product->is_in_stock() ) : ?>
				<form class="rj-product__form" method="post" action="<?php echo esc_url( wc_get_cart_url() ); ?>">
					<div class="rj-qty">
						<button type="button" class="rj-qty__step" data-step="-1" aria-label="<?php esc_attr_e( 'Uno menos', 'rejunte' ); ?>">−</button>
						<label class="screen-reader-text" for="rj-qty-<?php echo esc_attr( (string) $rejunte_id ); ?>"><?php esc_html_e( 'Cantidad', 'rejunte' ); ?></label>
						<input
							id="rj-qty-<?php echo esc_attr( (string) $rejunte_id ); ?>"
							class="rj-qty__input"
							type="number"
							name="quantity"
							value="1"
							min="1"
							<?php echo $rejunte_product->get_max_purchase_quantity() > 0 ? 'max="' . esc_attr( (string) $rejunte_product->get_max_purchase_quantity() ) . '"' : ''; ?>
							step="1"
							inputmode="numeric"
						>
						<button type="button" class="rj-qty__step" data-step="1" aria-label="<?php esc_attr_e( 'Uno más', 'rejunte' ); ?>">+</button>
					</div>
					<button
						type="submit"
						name="add-to-cart"
						value="<?php echo esc_attr( (string) $rejunte_id ); ?>"
						class="rj-button"
						aria-describedby="<?php echo esc_attr( $rejunte_name_id ); ?>"
						data-rj-add=""
						data-label="<?php echo esc_attr( $rejunte_label ); ?>"
						data-label-added="<?php echo esc_attr( $rejunte_added ); ?>"
					><?php echo esc_html( $rejunte_in_cart ? $rejunte_added . ' · ' . $rejunte_in_cart : $rejunte_label ); ?></button>
				</form>
			<?php elseif ( ! $rejunte_product->is_in_stock() ) : ?>
				<p class="rj-product__soldout"><?php esc_html_e( 'Agotado por esta semana', 'rejunte' ); ?></p>
			<?php else : ?>
				<div class="rj-product__form rj-product__form--native">
					<?php
					// WooCommerce's templates read the global product.
					$GLOBALS['product'] = $rejunte_product; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
					woocommerce_template_single_add_to_cart();
					?>
				</div>
			<?php endif; ?>
		</div>

		<section class="rj-food" aria-labelledby="rj-food-<?php echo esc_attr( (string) $rejunte_id ); ?>">
			<h2 class="rj-food__title" id="rj-food-<?php echo esc_attr( (string) $rejunte_id ); ?>"><?php esc_html_e( 'Ingredientes y alérgenos', 'rejunte' ); ?></h2>
			<?php if ( $rejunte_has_food ) : ?>
				<?php if ( $rejunte_food['ingredients'] ) : ?>
					<p class="rj-food__ingredients"><?php echo esc_html( $rejunte_food['ingredients'] ); ?></p>
				<?php endif; ?>
				<?php if ( $rejunte_food['allergens'] ) : ?>
					<p class="rj-food__label"><?php esc_html_e( 'Contiene', 'rejunte' ); ?></p>
					<ul class="rj-chips rj-food__allergens">
						<?php foreach ( $rejunte_food['allergens'] as $rejunte_allergen ) : ?>
							<li><?php echo esc_html( $rejunte_allergen ); ?></li>
						<?php endforeach; ?>
					</ul>
				<?php endif; ?>
				<?php if ( $rejunte_food['traces'] ) : ?>
					<p class="rj-food__note">
						<?php
						/* translators: %s: possible traces. */
						echo esc_html( sprintf( __( 'Puede contener trazas de %s.', 'rejunte' ), $rejunte_food['traces'] ) );
						?>
					</p>
				<?php endif; ?>
			<?php else : ?>
				<p class="rj-food__note">
					<?php esc_html_e( 'Pedinos la lista de ingredientes y alérgenos antes de encargar:', 'rejunte' ); ?>
					<a href="<?php echo esc_url( rejunte_whatsapp_url( sprintf( /* translators: %s: product name. */ __( 'Hola Rejunte, ¿qué ingredientes y alérgenos tiene «%s»?', 'rejunte' ), $rejunte_product->get_name() ) ) ); ?>"><?php esc_html_e( 'preguntar por WhatsApp', 'rejunte' ); ?></a>.
				</p>
			<?php endif; ?>
			<?php if ( $rejunte_food['conservation'] ) : ?>
				<p class="rj-food__note">
					<?php
					/* translators: %s: how to keep the product. */
					echo esc_html( sprintf( __( 'Conservación: %s', 'rejunte' ), $rejunte_food['conservation'] ) );
					?>
				</p>
			<?php endif; ?>
		</section>

		<?php if ( $attributes['chips'] ) : ?>
			<ul class="rj-chips">
				<?php foreach ( $attributes['chips'] as $rejunte_chip ) : ?>
					<li><?php echo wp_kses_post( $rejunte_chip ); ?></li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>
</section>
