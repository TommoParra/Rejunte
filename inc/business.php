<?php
/**
 * The business profile, read from the content people already edit.
 *
 * Address, opening hours, phone and social profiles are typed once, as visible
 * text in the footer block. Structured data and llms.txt are derived from that
 * same text here, so what search engines and assistants are told can never drift
 * from what visitors read, and there is no second settings screen to keep in sync.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Attributes of the `rejunte/footer` block in the footer template part.
 *
 * @return array<string, mixed>
 */
function rejunte_footer_attributes(): array {
	static $attributes = null;
	if ( null !== $attributes ) {
		return $attributes;
	}

	$attributes = array();
	$template   = get_block_template( get_stylesheet() . '//footer', 'wp_template_part' );
	if ( $template && $template->content ) {
		$found = rejunte_find_blocks( parse_blocks( $template->content ), array( 'rejunte/footer' ) );
		if ( $found ) {
			$type       = WP_Block_Type_Registry::get_instance()->get_registered( 'rejunte/footer' );
			$attributes = $type ? $type->prepare_attributes_for_render( $found[0]['attrs'] ) : $found[0]['attrs'];
		}
	}
	return $attributes;
}

/**
 * schema.org day names for Spanish day words and their usual abbreviations.
 *
 * @return array<string, string>
 */
function rejunte_day_names(): array {
	return array(
		'lunes'     => 'Monday',
		'lun'       => 'Monday',
		'martes'    => 'Tuesday',
		'mar'       => 'Tuesday',
		'miércoles' => 'Wednesday',
		'miercoles' => 'Wednesday',
		'mié'       => 'Wednesday',
		'mie'       => 'Wednesday',
		'jueves'    => 'Thursday',
		'jue'       => 'Thursday',
		'viernes'   => 'Friday',
		'vie'       => 'Friday',
		'sábado'    => 'Saturday',
		'sabado'    => 'Saturday',
		'sáb'       => 'Saturday',
		'sab'       => 'Saturday',
		'domingo'   => 'Sunday',
		'dom'       => 'Sunday',
	);
}

/**
 * Days named in a line such as "Jueves a domingo" or "Lun, mié y vie".
 *
 * @return string[] schema.org day names in week order, empty when none are named.
 */
function rejunte_parse_days( string $text ): array {
	$names = rejunte_day_names();
	$week  = array( 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' );
	$words = preg_split( '/[^\p{L}]+/u', mb_strtolower( $text ), -1, PREG_SPLIT_NO_EMPTY ) ?: array();

	$days   = array();
	$tokens = array();
	foreach ( $words as $word ) {
		if ( isset( $names[ $word ] ) ) {
			$tokens[] = $names[ $word ];
		} elseif ( 'a' === $word || 'al' === $word ) {
			$tokens[] = '..';
		}
	}

	foreach ( $tokens as $index => $token ) {
		if ( '..' === $token ) {
			continue;
		}
		$next = $tokens[ $index + 1 ] ?? null;
		$end  = $tokens[ $index + 2 ] ?? null;
		if ( '..' === $next && $end && '..' !== $end ) {
			$from = array_search( $token, $week, true );
			$to   = array_search( $end, $week, true );
			for ( $i = $from; ; $i = ( $i + 1 ) % 7 ) {
				$days[] = $week[ $i ];
				if ( $i === $to ) {
					break;
				}
			}
		} elseif ( ! in_array( $token, $days, true ) ) {
			$days[] = $token;
		}
	}

	return array_values( array_unique( $days ) );
}

/**
 * Opening and closing time from "16 a 20 h", "16–20 h" or "9:30 a 13:00".
 *
 * @return array{opens: string, closes: string}|null
 */
function rejunte_parse_hours( string $text ): ?array {
	if ( ! preg_match( '/(\d{1,2})(?:[:.](\d{2}))?\s*(?:h\s*)?(?:a|–|—|-)\s*(\d{1,2})(?:[:.](\d{2}))?\s*h?/u', $text, $match ) ) {
		return null;
	}
	return array(
		'opens'  => sprintf( '%02d:%02d', (int) $match[1], (int) ( $match[2] ?? 0 ) ),
		'closes' => sprintf( '%02d:%02d', (int) $match[3], (int) ( $match[4] ?? 0 ) ),
	);
}

/**
 * Everything known about the business.
 *
 * @return array{
 *     name: string,
 *     description: string,
 *     url: string,
 *     telephone: string,
 *     email: string,
 *     same_as: string[],
 *     address: array<string, string>,
 *     hours: array<int, array{days: string[], opens: string, closes: string}>,
 *     hours_text: string[],
 *     logo: string
 * }
 */
function rejunte_business(): array {
	static $business = null;
	if ( null !== $business ) {
		return $business;
	}

	$footer   = rejunte_footer_attributes();
	$business = array(
		'name'        => get_bloginfo( 'name' ),
		'description' => rejunte_plain_text( $footer['description'] ?? '' ) ?: get_bloginfo( 'description' ),
		'url'         => home_url( '/' ),
		'telephone'   => '',
		'email'       => '',
		'same_as'     => array(),
		'address'     => array(),
		'hours'       => array(),
		'hours_text'  => array(),
		'logo'        => rejunte_brand_images()['logo']['url'],
	);

	$lines = array();
	foreach ( (array) ( $footer['columns'] ?? array() ) as $column ) {
		foreach ( (array) ( $column['lines'] ?? array() ) as $line ) {
			$lines[] = (string) $line;
		}
	}

	$texts = array_map( 'rejunte_plain_text', $lines );
	$phone = static fn( string $text ): bool => (bool) preg_match( '/^\+?[\d\s().-]{9,}$/', $text );

	foreach ( $lines as $index => $html ) {
		$text = $texts[ $index ];

		$links = new WP_HTML_Tag_Processor( $html );
		while ( $links->next_tag( 'a' ) ) {
			$href = (string) $links->get_attribute( 'href' );
			if ( str_starts_with( $href, 'tel:' ) ) {
				$business['telephone'] = preg_replace( '/[^\d+]/', '', substr( $href, 4 ) );
			} elseif ( str_starts_with( $href, 'mailto:' ) ) {
				$business['email'] = sanitize_email( substr( $href, 7 ) );
			} elseif ( preg_match( '#^https?://#', $href ) && ! str_starts_with( $href, home_url() ) && ! str_contains( $href, 'wa.me/' ) ) {
				$business['same_as'][] = esc_url_raw( $href );
			}
		}

		if ( $phone( $text ) ) {
			if ( ! $business['telephone'] ) {
				$business['telephone'] = preg_replace( '/[^\d+]/', '', $text );
			}
			// A phone number like 600-000-000 would otherwise read as opening hours.
			continue;
		}

		/*
		 * Opening hours: a line naming days counts only together with a time,
		 * on the same line ("Jue a dom 16–20 h") or on the next one ("Jueves a
		 * domingo" / "16 a 20 h"). A street like "Carrer del Mar" or a note
		 * like "Encargos hasta el martes" never becomes a schedule.
		 */
		$days = rejunte_parse_days( $text );
		if ( $days ) {
			$time = rejunte_parse_hours( $text );
			$next = $texts[ $index + 1 ] ?? '';
			if ( ! $time && $next && ! $phone( $next ) && ! rejunte_parse_days( $next ) && ! preg_match( '/^\d{5}\b/', $next ) ) {
				$time = rejunte_parse_hours( $next );
				if ( $time ) {
					$business['hours_text'][] = $text . ', ' . $next;
				}
			} elseif ( $time ) {
				$business['hours_text'][] = $text;
			}
			if ( $time ) {
				$business['hours'][] = array_merge( array( 'days' => $days ), $time );
			}
		}

		if ( preg_match( '/^(\d{5})\s+(.+)$/u', $text, $postal ) ) {
			$business['address']['postalCode']      = $postal[1];
			$business['address']['addressLocality'] = $postal[2];
			$previous                               = $texts[ $index - 1 ] ?? '';
			if ( $previous && ! rejunte_parse_days( $previous ) && ! rejunte_parse_hours( $previous ) && ! $phone( $previous ) ) {
				$business['address']['streetAddress'] = $previous;
			}
		}
	}

	if ( $business['address'] ) {
		$business['address']['addressCountry'] = (string) ( $footer['country'] ?? 'ES' );
	}
	$business['same_as'] = array_values( array_unique( $business['same_as'] ) );

	/**
	 * Filters the business profile used by structured data and llms.txt.
	 *
	 * @param array $business Business profile.
	 */
	$business = apply_filters( 'rejunte_business', $business );
	return $business;
}
