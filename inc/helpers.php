<?php
/**
 * Small helpers shared by the theme modules.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * URL of a file under assets/.
 */
function rejunte_asset_url( string $path ): string {
	return REJUNTE_URI . '/assets/' . ltrim( $path, '/' );
}

/**
 * Brand images that ship with the theme.
 *
 * Header and footer are template parts, which live in theme files rather than
 * the database, so their default logo cannot be a media-library attachment: an
 * attachment ID would not survive a move to another site. When a block has no
 * image picked, it renders one of these instead.
 *
 * @return array<string, array{url: string, width: int, height: int}>
 */
function rejunte_brand_images(): array {
	return array(
		'logo'            => array(
			'url'    => rejunte_asset_url( 'img/logo.webp' ),
			'width'  => 800,
			'height' => 800,
		),
		'logo-mark'       => array(
			'url'    => rejunte_asset_url( 'img/logo-mark.png' ),
			'width'  => 125,
			'height' => 176,
		),
		'logo-mark-light' => array(
			'url'    => rejunte_asset_url( 'img/logo-mark-light.png' ),
			'width'  => 125,
			'height' => 176,
		),
	);
}

/**
 * Walk a parsed block tree depth first and collect every block of the given names.
 *
 * @param array<int, array<string, mixed>> $blocks Parsed blocks.
 * @param string[]                         $names  Block names to collect.
 * @return array<int, array<string, mixed>>
 */
function rejunte_find_blocks( array $blocks, array $names ): array {
	$found = array();
	foreach ( $blocks as $block ) {
		if ( in_array( $block['blockName'] ?? '', $names, true ) ) {
			$found[] = $block;
		}
		if ( ! empty( $block['innerBlocks'] ) ) {
			$found = array_merge( $found, rejunte_find_blocks( $block['innerBlocks'], $names ) );
		}
	}
	return $found;
}

/**
 * Plain text from a rich-text attribute: tags stripped, entities decoded, line
 * breaks collapsed to spaces.
 */
function rejunte_plain_text( ?string $html ): string {
	if ( null === $html || '' === $html ) {
		return '';
	}
	$text = preg_replace( '#<br\s*/?>#i', ' ', $html );
	$text = html_entity_decode( wp_strip_all_tags( (string) $text ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	return trim( (string) preg_replace( '/\s+/u', ' ', $text ) );
}
