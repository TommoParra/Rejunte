<?php
/**
 * Datos de contacto: the WhatsApp number orders and enquiries go to, set in the
 * Customizer, and the helpers that build WhatsApp links from it.
 *
 * Every wa.me link on the site — the cart's "Pedir por WhatsApp", the encargos
 * button, any link an editor adds — goes to this one number, so changing it in
 * the Customizer changes it everywhere.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Number used when none is set in the Customizer.
 */
const REJUNTE_WHATSAPP_FALLBACK = '+34 655 47 97 47';

/**
 * Contact settings with their defaults.
 *
 * @return array{phone: string, intro: string, outro: string, checkout: bool}
 */
function rejunte_contact_settings(): array {
	return array(
		'phone'    => (string) get_option( 'rejunte_whatsapp_phone', '' ),
		'intro'    => (string) get_option( 'rejunte_whatsapp_intro', __( '¡Hola Rejunte! Quiero hacer este pedido:', 'rejunte' ) ),
		'outro'    => (string) get_option( 'rejunte_whatsapp_outro', __( '¿Cuándo lo puedo pasar a buscar?', 'rejunte' ) ),
		'checkout' => (bool) get_option( 'rejunte_whatsapp_checkout', true ),
	);
}

/**
 * Keep a phone number readable but valid: digits, spaces and a leading +.
 * Fewer than eight digits is treated as empty, so the fallback applies.
 */
function rejunte_sanitize_phone( $value ): string {
	$value = trim( preg_replace( '/[^\d+\s]/', '', (string) $value ) );
	$value = preg_replace( '/(?!^)\+/', '', $value );
	return strlen( preg_replace( '/\D/', '', $value ) ) >= 8 ? $value : '';
}

/**
 * The WhatsApp number in international form without "+" or "00", as wa.me
 * expects it ("34655479747").
 */
function rejunte_whatsapp_number(): string {
	$phone  = rejunte_contact_settings()['phone'] ?: REJUNTE_WHATSAPP_FALLBACK;
	$digits = preg_replace( '/\D/', '', $phone );
	return str_starts_with( $digits, '00' ) ? substr( $digits, 2 ) : $digits;
}

/**
 * The number as people read it ("+34 655 47 97 47").
 */
function rejunte_whatsapp_display(): string {
	$phone = rejunte_contact_settings()['phone'] ?: REJUNTE_WHATSAPP_FALLBACK;
	return str_starts_with( $phone, '+' ) ? $phone : '+' . ltrim( $phone, '0' );
}

/**
 * A wa.me link to the configured number, optionally with a prefilled message.
 *
 * @param string $text Message (plain text, newlines allowed).
 */
function rejunte_whatsapp_url( string $text = '' ): string {
	$url = 'https://wa.me/' . rejunte_whatsapp_number();
	return '' === $text ? $url : $url . '?text=' . rawurlencode( $text );
}

/**
 * Customizer → "Datos de contacto".
 *
 * @param WP_Customize_Manager $customize Customizer.
 */
function rejunte_customize_contact( WP_Customize_Manager $customize ): void {
	$customize->add_section(
		'rejunte_contact',
		array(
			'title'       => __( 'Datos de contacto', 'rejunte' ),
			'description' => __( 'El WhatsApp al que llegan los pedidos y las consultas. Todos los enlaces a WhatsApp de la web usan este número.', 'rejunte' ),
			'priority'    => 30,
		)
	);

	$customize->add_setting(
		'rejunte_whatsapp_phone',
		array(
			'type'              => 'option',
			'default'           => '',
			'sanitize_callback' => 'rejunte_sanitize_phone',
		)
	);
	$customize->add_control(
		'rejunte_whatsapp_phone',
		array(
			'section'     => 'rejunte_contact',
			'label'       => __( 'WhatsApp para pedidos', 'rejunte' ),
			/* translators: %s: fallback phone number. */
			'description' => sprintf( __( 'Con el código de país. Vacío, se usa %s.', 'rejunte' ), REJUNTE_WHATSAPP_FALLBACK ),
			'type'        => 'tel',
			'input_attrs' => array(
				'placeholder'  => REJUNTE_WHATSAPP_FALLBACK,
				'autocomplete' => 'tel',
			),
		)
	);

	$customize->add_setting(
		'rejunte_whatsapp_intro',
		array(
			'type'              => 'option',
			'default'           => __( '¡Hola Rejunte! Quiero hacer este pedido:', 'rejunte' ),
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$customize->add_control(
		'rejunte_whatsapp_intro',
		array(
			'section'     => 'rejunte_contact',
			'label'       => __( 'Inicio del mensaje del pedido', 'rejunte' ),
			'description' => __( 'Va antes de la lista de productos.', 'rejunte' ),
			'type'        => 'textarea',
		)
	);

	$customize->add_setting(
		'rejunte_whatsapp_outro',
		array(
			'type'              => 'option',
			'default'           => __( '¿Cuándo lo puedo pasar a buscar?', 'rejunte' ),
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
	$customize->add_control(
		'rejunte_whatsapp_outro',
		array(
			'section'     => 'rejunte_contact',
			'label'       => __( 'Final del mensaje del pedido', 'rejunte' ),
			'description' => __( 'Va después del total. Puede quedar vacío.', 'rejunte' ),
			'type'        => 'textarea',
		)
	);

	if ( class_exists( 'WooCommerce' ) ) {
		$customize->add_setting(
			'rejunte_whatsapp_checkout',
			array(
				'type'              => 'option',
				'default'           => true,
				'sanitize_callback' => 'wp_validate_boolean',
			)
		);
		$customize->add_control(
			'rejunte_whatsapp_checkout',
			array(
				'section'     => 'rejunte_contact',
				'label'       => __( 'Cerrar los pedidos por WhatsApp', 'rejunte' ),
				'description' => __( 'El botón del carrito abre WhatsApp con el pedido escrito, en lugar de ir al pago. Desactivalo cuando haya una pasarela de pago.', 'rejunte' ),
				'type'        => 'checkbox',
			)
		);
	}
}
add_action( 'customize_register', 'rejunte_customize_contact' );

/**
 * Send every wa.me link in block output to the configured number, keeping its
 * message. Editors can paste any wa.me link; the number always follows the
 * Customizer.
 *
 * @param string $content Rendered block.
 */
function rejunte_route_whatsapp_links( string $content ): string {
	if ( ! str_contains( $content, 'wa.me/' ) ) {
		return $content;
	}
	return (string) preg_replace( '#https://wa\.me/\d*#', 'https://wa.me/' . rejunte_whatsapp_number(), $content );
}
add_filter( 'render_block', 'rejunte_route_whatsapp_links' );

/**
 * The WhatsApp number as the business's order contact point in structured data.
 *
 * @param array<int, array<string, mixed>> $graph Nodes.
 * @return array<int, array<string, mixed>>
 */
function rejunte_schema_contact_point( array $graph ): array {
	$home = home_url( '/' );
	foreach ( $graph as &$node ) {
		if ( ( $node['@id'] ?? '' ) === $home . '#negocio' ) {
			$node['contactPoint'] = array(
				'@type'             => 'ContactPoint',
				'contactType'       => __( 'Pedidos y encargos por WhatsApp', 'rejunte' ),
				'telephone'         => '+' . rejunte_whatsapp_number(),
				'url'               => rejunte_whatsapp_url(),
				'availableLanguage' => 'es',
			);
		}
	}
	unset( $node );
	return $graph;
}
add_filter( 'rejunte_schema_graph', 'rejunte_schema_contact_point' );

/**
 * The order channel in llms.txt, right after the business facts.
 *
 * @param string[] $lines Markdown lines.
 * @return string[]
 */
function rejunte_llms_whatsapp( array $lines ): array {
	$index = array_search( '## ' . __( 'Datos', 'rejunte' ), $lines, true );
	$line  = sprintf(
		/* translators: 1: phone number, 2: wa.me link. */
		__( '- Pedidos y encargos por WhatsApp: %1$s (%2$s)', 'rejunte' ),
		rejunte_whatsapp_display(),
		rejunte_whatsapp_url()
	);
	if ( false === $index ) {
		$lines[] = $line;
		return $lines;
	}
	// After the last fact of the "Datos" list.
	$end = $index + 1;
	while ( isset( $lines[ $end ] ) && str_starts_with( $lines[ $end ], '- ' ) ) {
		++$end;
	}
	array_splice( $lines, $end, 0, array( $line ) );
	return $lines;
}
add_filter( 'rejunte_llms_lines', 'rejunte_llms_whatsapp' );
