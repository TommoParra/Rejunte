<?php
/**
 * Cookie consent: a first-party banner, no third-party consent platform.
 *
 * The banner tells the truth about what the site does. With only technical
 * cookies (the cart session, this choice itself) it is a short notice with a
 * link to the cookie policy. Once an optional service is configured — Google
 * Analytics in the Customizer, or anything a plugin registers through the
 * `rejunte_consent_services` filter — it asks: accept, reject or choose per
 * category, all three with the same weight, and nothing optional loads before
 * the visitor says yes.
 *
 * The choice is kept for 13 months in a first-party cookie and can be changed
 * at any time from "Configurar cookies" in the footer.
 *
 * @package Rejunte
 */

defined( 'ABSPATH' ) || exit;

/**
 * Name of the cookie that stores the visitor's choice.
 */
const REJUNTE_CONSENT_COOKIE = 'rejunte_consent';

/**
 * Optional services, each in a category, loaded only after consent.
 *
 * @return array<int, array{id: string, category: string, label: string, src?: string, inline?: string}>
 */
function rejunte_consent_services(): array {
	$services = array();

	$ga = trim( (string) get_option( 'rejunte_ga4_id', '' ) );
	if ( preg_match( '/^G-[A-Z0-9]{4,}$/', $ga ) ) {
		$services[] = array(
			'id'       => 'google-analytics',
			'category' => 'analytics',
			'label'    => 'Google Analytics',
			'src'      => 'https://www.googletagmanager.com/gtag/js?id=' . rawurlencode( $ga ),
			'inline'   => sprintf(
				"window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',%s,{anonymize_ip:true});",
				wp_json_encode( $ga )
			),
		);
	}

	/**
	 * Filters the optional services that need consent.
	 *
	 * @param array $services Each: id, category ('analytics' or 'marketing'), label, and src and/or inline script.
	 */
	return array_values( (array) apply_filters( 'rejunte_consent_services', $services ) );
}

/**
 * Categories in use, with their copy.
 *
 * @return array<string, array{label: string, description: string}>
 */
function rejunte_consent_categories(): array {
	$all = array(
		'analytics' => array(
			'label'       => __( 'Análisis', 'rejunte' ),
			'description' => __( 'Nos dicen cuántas personas visitan la web y qué páginas miran, sin identificarte.', 'rejunte' ),
		),
		'marketing' => array(
			'label'       => __( 'Publicidad', 'rejunte' ),
			'description' => __( 'Permiten mostrarte anuncios de Rejunte en otras webs y redes.', 'rejunte' ),
		),
	);
	$used = array_unique( array_column( rejunte_consent_services(), 'category' ) );
	return array_intersect_key( $all, array_flip( $used ) );
}

/**
 * Version of the question being asked. When the categories change, everyone
 * is asked again.
 */
function rejunte_consent_version(): string {
	return substr( md5( implode( ',', array_keys( rejunte_consent_categories() ) ) ), 0, 8 );
}

/**
 * The visitor's stored choice, if it answers the current question.
 *
 * @return array<string, bool>|null
 */
function rejunte_consent_choice(): ?array {
	$raw = isset( $_COOKIE[ REJUNTE_CONSENT_COOKIE ] ) ? wp_unslash( $_COOKIE[ REJUNTE_CONSENT_COOKIE ] ) : ''; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Decoded and validated below.
	$data = json_decode( (string) $raw, true );
	if ( ! is_array( $data ) || ( $data['v'] ?? '' ) !== rejunte_consent_version() ) {
		return null;
	}
	return array_map( 'boolval', (array) ( $data['c'] ?? array() ) );
}

/**
 * URL of the cookie policy page, if there is one.
 */
function rejunte_cookie_policy_url(): string {
	$page = get_page_by_path( 'politica-de-cookies' );
	return $page && 'publish' === $page->post_status ? get_permalink( $page ) : '';
}

/**
 * Customizer → "Privacidad y cookies".
 *
 * @param WP_Customize_Manager $customize Customizer.
 */
function rejunte_customize_privacy( WP_Customize_Manager $customize ): void {
	$customize->add_section(
		'rejunte_privacy',
		array(
			'title'       => __( 'Privacidad y cookies', 'rejunte' ),
			'description' => __( 'Servicios opcionales que solo se cargan si el visitante acepta las cookies. Mientras no haya ninguno, el aviso solo informa de las cookies técnicas.', 'rejunte' ),
			'priority'    => 31,
		)
	);
	$customize->add_setting(
		'rejunte_ga4_id',
		array(
			'type'              => 'option',
			'default'           => '',
			'sanitize_callback' => static fn( $value ) => preg_match( '/^G-[A-Z0-9]{4,}$/', strtoupper( trim( (string) $value ) ) ) ? strtoupper( trim( (string) $value ) ) : '',
		)
	);
	$customize->add_control(
		'rejunte_ga4_id',
		array(
			'section'     => 'rejunte_privacy',
			'label'       => __( 'Google Analytics 4 (ID de medición)', 'rejunte' ),
			'description' => __( 'Por ejemplo G-ABC123XYZ. Se carga solo con el consentimiento de «Análisis». Recordá añadirlo a la política de cookies.', 'rejunte' ),
			'type'        => 'text',
		)
	);
}
add_action( 'customize_register', 'rejunte_customize_privacy' );

/**
 * The banner, early in the document so keyboard users meet it right after the
 * skip links; it sits fixed at the bottom of the screen and never moves the page.
 */
function rejunte_consent_banner(): void {
	if ( is_admin() || wp_is_json_request() || is_customize_preview() ) {
		return;
	}

	$categories = rejunte_consent_categories();
	$choice     = rejunte_consent_choice();
	$policy     = rejunte_cookie_policy_url();
	$asks       = (bool) $categories;

	$config = array(
		'cookie'   => REJUNTE_CONSENT_COOKIE,
		'version'  => rejunte_consent_version(),
		'services' => rejunte_consent_services(),
		'choice'   => $choice,
	);
	?>
	<section class="rj-consent" id="rj-consent" aria-labelledby="rj-consent-title" data-mode="<?php echo $asks ? 'ask' : 'notice'; ?>" <?php echo null === $choice ? '' : 'hidden'; ?>>
		<div class="rj-consent__card">
			<h2 class="rj-consent__title" id="rj-consent-title"><?php esc_html_e( 'Cookies', 'rejunte' ); ?></h2>
			<p class="rj-consent__text">
				<?php
				echo esc_html(
					$asks
						? __( 'Usamos cookies técnicas para que el pedido funcione y, si aceptás, otras para entender cómo se usa la web.', 'rejunte' )
						: __( 'Solo usamos cookies técnicas, las necesarias para que el pedido funcione. Nada de análisis ni publicidad.', 'rejunte' )
				);
				if ( $policy ) {
					printf( ' <a href="%1$s">%2$s</a>', esc_url( $policy ), esc_html__( 'Política de cookies', 'rejunte' ) );
				}
				?>
			</p>

			<?php if ( $asks ) : ?>
				<form class="rj-consent__choices" id="rj-consent-choices" hidden>
					<fieldset>
						<legend class="screen-reader-text"><?php esc_html_e( 'Qué cookies aceptás', 'rejunte' ); ?></legend>
						<label class="rj-consent__choice">
							<input type="checkbox" checked disabled>
							<span><strong><?php esc_html_e( 'Técnicas', 'rejunte' ); ?></strong> <?php esc_html_e( 'Siempre activas: el carrito y esta elección.', 'rejunte' ); ?></span>
						</label>
						<?php foreach ( $categories as $key => $category ) : ?>
							<label class="rj-consent__choice">
								<input type="checkbox" name="<?php echo esc_attr( $key ); ?>" <?php checked( ! empty( $choice[ $key ] ) ); ?>>
								<span><strong><?php echo esc_html( $category['label'] ); ?></strong> <?php echo esc_html( $category['description'] ); ?></span>
							</label>
						<?php endforeach; ?>
					</fieldset>
				</form>
				<div class="rj-consent__actions">
					<button type="button" class="rj-consent__button" data-consent="accept"><?php esc_html_e( 'Aceptar', 'rejunte' ); ?></button>
					<button type="button" class="rj-consent__button" data-consent="reject"><?php esc_html_e( 'Rechazar', 'rejunte' ); ?></button>
					<button type="button" class="rj-consent__button" data-consent="configure" aria-controls="rj-consent-choices" aria-expanded="false"><?php esc_html_e( 'Configurar', 'rejunte' ); ?></button>
					<button type="button" class="rj-consent__button" data-consent="save" hidden><?php esc_html_e( 'Guardar mi elección', 'rejunte' ); ?></button>
				</div>
			<?php else : ?>
				<div class="rj-consent__actions">
					<button type="button" class="rj-consent__button" data-consent="ok"><?php esc_html_e( 'Entendido', 'rejunte' ); ?></button>
				</div>
			<?php endif; ?>
		</div>
	</section>
	<script type="application/json" id="rj-consent-config"><?php echo wp_json_encode( $config, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG ); ?></script>
	<?php
}
add_action( 'wp_body_open', 'rejunte_consent_banner', 6 );

/**
 * The banner's behaviour and the loader for consented services.
 */
function rejunte_consent_script(): void {
	if ( is_admin() ) {
		return;
	}
	$file = REJUNTE_DIR . '/assets/js/consent.js';
	wp_enqueue_script( 'rejunte-consent', rejunte_asset_url( 'js/consent.js' ), array(), (string) filemtime( $file ), array( 'strategy' => 'defer' ) );
}
add_action( 'wp_enqueue_scripts', 'rejunte_consent_script' );

/**
 * The cookies the site sets, in one place: the cookie policy pattern builds its
 * table from this list. Add a row here when a new cookie appears (and update
 * the published policy page, which keeps the table it was created with).
 *
 * @return array<int, array{name: string, purpose: string, duration: string, type: string}>
 */
function rejunte_cookie_inventory(): array {
	$cookies = array(
		array(
			'name'     => REJUNTE_CONSENT_COOKIE,
			'purpose'  => __( 'Guarda tu elección sobre las cookies.', 'rejunte' ),
			'duration' => __( '13 meses', 'rejunte' ),
			'type'     => __( 'Técnica, propia', 'rejunte' ),
		),
		array(
			'name'     => 'rj-motion (localStorage)',
			'purpose'  => __( 'Recuerda si pausaste las animaciones.', 'rejunte' ),
			'duration' => __( 'Hasta que la borres', 'rejunte' ),
			'type'     => __( 'Preferencia de accesibilidad, propia', 'rejunte' ),
		),
	);
	if ( class_exists( 'WooCommerce' ) ) {
		array_unshift(
			$cookies,
			array(
				'name'     => 'woocommerce_items_in_cart',
				'purpose'  => __( 'Indica que hay productos en el pedido.', 'rejunte' ),
				'duration' => __( 'Sesión', 'rejunte' ),
				'type'     => __( 'Técnica, propia', 'rejunte' ),
			),
			array(
				'name'     => 'woocommerce_cart_hash',
				'purpose'  => __( 'Detecta cambios en el pedido.', 'rejunte' ),
				'duration' => __( 'Sesión', 'rejunte' ),
				'type'     => __( 'Técnica, propia', 'rejunte' ),
			),
			array(
				'name'     => 'wp_woocommerce_session_*',
				'purpose'  => __( 'Guarda el contenido de tu pedido mientras navegás.', 'rejunte' ),
				'duration' => __( '2 días', 'rejunte' ),
				'type'     => __( 'Técnica, propia', 'rejunte' ),
			)
		);
	}
	return $cookies;
}
