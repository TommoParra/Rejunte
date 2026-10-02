<?php
/**
 * Block registration and the server-side touches static blocks need.
 *
 * Every block lives in src/blocks/<name>/ with its own block.json and is built
 * to build/blocks/<name>/. Registering from metadata means WordPress reads the
 * block's assets from block.json and only loads them where the block is used.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register every built block.
 */
function rejunte_register_blocks(): void {
	$build    = REJUNTE_DIR . '/build/blocks';
	$manifest = $build . '/blocks-manifest.php';

	// WordPress 6.8+ can register a whole folder from one manifest in a single pass.
	if ( file_exists( $manifest ) && function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( $build, $manifest );
	} else {
		foreach ( glob( $build . '/*/block.json' ) ?: array() as $metadata ) {
			register_block_type( dirname( $metadata ) );
		}
	}
}
add_action( 'init', 'rejunte_register_blocks' );

/**
 * Block stylesheets print after the global one, so the tokens and shared
 * components they build on come first in the cascade.
 */
function rejunte_block_styles_after_global(): void {
	$styles = wp_styles();
	foreach ( WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $type ) {
		if ( ! str_starts_with( $name, 'rejunte/' ) ) {
			continue;
		}
		foreach ( array_merge( (array) $type->style_handles, (array) $type->editor_style_handles ) as $handle ) {
			if ( isset( $styles->registered[ $handle ] ) && ! in_array( 'rejunte-global', $styles->registered[ $handle ]->deps, true ) ) {
				$styles->registered[ $handle ]->deps[] = 'rejunte-global';
			}
		}
	}
}
add_action( 'init', 'rejunte_block_styles_after_global', 30 );

/**
 * Editor script translations for every block, from languages/.
 */
function rejunte_block_translations(): void {
	foreach ( WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $type ) {
		if ( ! str_starts_with( $name, 'rejunte/' ) ) {
			continue;
		}
		foreach ( (array) $type->editor_script_handles as $handle ) {
			wp_set_script_translations( $handle, 'rejunte', REJUNTE_DIR . '/languages' );
		}
	}
}
add_action( 'init', 'rejunte_block_translations', 20 );

/**
 * A "Rejunte" category at the top of the inserter.
 *
 * @param array<int, array<string, string>> $categories Registered categories.
 * @return array<int, array<string, string>>
 */
function rejunte_block_category( array $categories ): array {
	array_unshift(
		$categories,
		array(
			'slug'  => 'rejunte',
			'title' => __( 'Rejunte', 'rejunte' ),
			'icon'  => null,
		)
	);
	return $categories;
}
add_filter( 'block_categories_all', 'rejunte_block_category' );

/**
 * Let post content keep the attributes the blocks' saved markup uses.
 *
 * Administrators can always save them, but an Editor or Author without
 * `unfiltered_html` would have them stripped by KSES, and the block would then
 * fail validation the next time it was opened.
 *
 * @param array<string, array<string, bool>> $tags    Allowed tags.
 * @param string                             $context KSES context.
 * @return array<string, array<string, bool>>
 */
function rejunte_kses_allowed_html( array $tags, string $context ): array {
	if ( 'post' !== $context ) {
		return $tags;
	}

	$tags['img'] = array_merge(
		$tags['img'] ?? array(),
		array(
			'sizes'         => true,
			'srcset'        => true,
			'fetchpriority' => true,
			'decoding'      => true,
			'loading'       => true,
		)
	);
	$tags['div']    = array_merge( $tags['div'] ?? array(), array( 'tabindex' => true ) );
	$tags['button'] = array_merge( $tags['button'] ?? array(), array( 'type' => true, 'name' => true, 'value' => true ) );
	$tags['form']   = array_merge( $tags['form'] ?? array(), array( 'method' => true, 'action' => true ) );

	return $tags;
}
add_filter( 'wp_kses_allowed_html', 'rejunte_kses_allowed_html', 10, 2 );

/**
 * Fill in theme brand images.
 *
 * A block saves `<img data-rj-brand="logo-mark">` with no `src` when nobody has
 * picked an image for it, and the theme's own file is filled in here at render
 * time. That keeps header and footer template parts portable between sites.
 *
 * @param string $content Rendered block HTML.
 */
function rejunte_render_brand_images( string $content ): string {
	if ( ! str_contains( $content, 'data-rj-brand' ) ) {
		return $content;
	}

	$brand     = rejunte_brand_images();
	$processor = new WP_HTML_Tag_Processor( $content );

	while ( $processor->next_tag( 'img' ) ) {
		$key = $processor->get_attribute( 'data-rj-brand' );
		if ( ! is_string( $key ) || ! isset( $brand[ $key ] ) || $processor->get_attribute( 'src' ) ) {
			continue;
		}
		$processor->set_attribute( 'src', $brand[ $key ]['url'] );
		$processor->set_attribute( 'width', (string) $brand[ $key ]['width'] );
		$processor->set_attribute( 'height', (string) $brand[ $key ]['height'] );
		$processor->remove_attribute( 'data-rj-brand' );
	}

	return $processor->get_updated_html();
}
add_filter( 'render_block_rejunte/header', 'rejunte_render_brand_images' );
add_filter( 'render_block_rejunte/footer', 'rejunte_render_brand_images' );
add_filter( 'render_block_rejunte/hero', 'rejunte_render_brand_images' );

/**
 * Pattern category for the theme's own patterns.
 */
function rejunte_pattern_category(): void {
	register_block_pattern_category( 'rejunte', array( 'label' => __( 'Rejunte', 'rejunte' ) ) );
}
add_action( 'init', 'rejunte_pattern_category' );

/**
 * Path of the site's home ("/" or "/sub/" when WordPress lives in a folder).
 */
function rejunte_home_path(): string {
	return trailingslashit( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ) );
}

/**
 * Root-relative links ("/vitrina/") in the theme's blocks resolve against the
 * site's home, so header, patterns and content work when WordPress is
 * installed in a folder.
 *
 * @param string               $content Rendered block.
 * @param array<string, mixed> $block   Parsed block.
 */
function rejunte_resolve_root_links( string $content, array $block ): string {
	if ( '/' === rejunte_home_path() || ! str_starts_with( (string) ( $block['blockName'] ?? '' ), 'rejunte/' ) ) {
		return $content;
	}
	$processor = new WP_HTML_Tag_Processor( $content );
	while ( $processor->next_tag() ) {
		$attribute = 'FORM' === $processor->get_tag() ? 'action' : ( 'A' === $processor->get_tag() ? 'href' : null );
		$value     = $attribute ? $processor->get_attribute( $attribute ) : null;
		if ( is_string( $value ) && str_starts_with( $value, '/' ) && ! str_starts_with( $value, '//' ) && ! str_starts_with( $value, rejunte_home_path() ) ) {
			$processor->set_attribute( $attribute, home_url( $value ) );
		}
	}
	return $processor->get_updated_html();
}
add_filter( 'render_block', 'rejunte_resolve_root_links', 5, 2 );

/**
 * Mark the header link to the page being viewed with aria-current="page".
 *
 * A link matches when the current page is it or lives under it (a category of
 * the shop, for instance, under /vitrina/). Paths are compared relative to the
 * site's home; the home link itself never marks other pages.
 *
 * @param string $content Rendered header block.
 */
function rejunte_render_header_current( string $content ): string {
	$home     = rejunte_home_path();
	$relative = static function ( string $path ) use ( $home ): string {
		$path = trailingslashit( $path );
		return str_starts_with( $path, $home ) ? '/' . substr( $path, strlen( $home ) ) : $path;
	};

	$current = $relative( (string) wp_parse_url( wp_unslash( $_SERVER['REQUEST_URI'] ?? '/' ), PHP_URL_PATH ) ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Only the path is compared.
	if ( function_exists( 'is_product' ) && ( is_product() || is_product_taxonomy() ) ) {
		$current = $relative( (string) wp_parse_url( wc_get_page_permalink( 'shop' ), PHP_URL_PATH ) );
	}

	$processor = new WP_HTML_Tag_Processor( $content );
	while ( $processor->next_tag( array( 'tag_name' => 'a', 'class_name' => 'rj-nav__link' ) ) ) {
		$path = $relative( (string) wp_parse_url( (string) $processor->get_attribute( 'href' ), PHP_URL_PATH ) );
		if ( '/' !== $path && str_starts_with( $current, $path ) ) {
			$processor->set_attribute( 'aria-current', 'page' );
		}
	}
	return $processor->get_updated_html();
}
add_filter( 'render_block_rejunte/header', 'rejunte_render_header_current', 20 );

/**
 * IDs in an HTML fragment.
 *
 * @return string[]
 */
function rejunte_ids_in( string $html ): array {
	$ids       = array();
	$processor = new WP_HTML_Tag_Processor( $html );
	while ( $processor->next_tag() ) {
		$id = $processor->get_attribute( 'id' );
		if ( is_string( $id ) && '' !== $id ) {
			$ids[] = $id;
		}
	}
	return $ids;
}

/**
 * Keep IDs unique on the page.
 *
 * Saved markup derives IDs from content (a heading's id, a product's), so the
 * same block or product twice on one page would repeat them, and labels
 * pointing at them would read the wrong thing. A repeated ID gets a suffix, and
 * the references to it inside the same block follow.
 *
 * Only a block's own IDs are considered: for a static block with inner blocks
 * that is the markup around them, which the inner blocks have already handled.
 *
 * @param string               $content Rendered block.
 * @param array<string, mixed> $block   Parsed block.
 */
function rejunte_unique_ids( string $content, array $block ): string {
	static $seen = array();

	if ( ! str_starts_with( (string) ( $block['blockName'] ?? '' ), 'rejunte/' ) || ! str_contains( $content, ' id="' ) ) {
		return $content;
	}
	$own = '' !== trim( (string) ( $block['innerHTML'] ?? '' ) ) ? rejunte_ids_in( $block['innerHTML'] ) : ( empty( $block['innerBlocks'] ) ? rejunte_ids_in( $content ) : array() );
	if ( ! $own ) {
		return $content;
	}

	$renames   = array();
	$processor = new WP_HTML_Tag_Processor( $content );
	while ( $processor->next_tag() ) {
		$id = $processor->get_attribute( 'id' );
		if ( ! is_string( $id ) || ! in_array( $id, $own, true ) ) {
			continue;
		}
		if ( isset( $seen[ $id ] ) ) {
			++$seen[ $id ];
			$renames[ $id ] = $id . '-' . $seen[ $id ];
			$processor->set_attribute( 'id', $renames[ $id ] );
		} else {
			$seen[ $id ] = 1;
		}
	}
	if ( ! $renames ) {
		return $content;
	}

	$processor = new WP_HTML_Tag_Processor( $processor->get_updated_html() );
	while ( $processor->next_tag() ) {
		foreach ( array( 'aria-labelledby', 'aria-describedby', 'aria-controls', 'for' ) as $attribute ) {
			$value = $processor->get_attribute( $attribute );
			if ( is_string( $value ) ) {
				$tokens = array_map( static fn( $token ) => $renames[ $token ] ?? $token, preg_split( '/\s+/', trim( $value ) ) ?: array() );
				$processor->set_attribute( $attribute, implode( ' ', $tokens ) );
			}
		}
	}
	return $processor->get_updated_html();
}
add_filter( 'render_block', 'rejunte_unique_ids', 50, 2 );
